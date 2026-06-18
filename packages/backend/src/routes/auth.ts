import express from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt'
import { authenticate, requireAdmin } from '../middleware/auth'
import { auditLog, logUserAction, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../middleware/audit'
import { authLimiter, passwordLimiter, profileLimiter } from '../middleware/rateLimiter'

const router = express.Router()
const prisma = new PrismaClient()

// Enhanced validation schemas with security rules
const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email too long')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password too long')
})

const refreshTokenSchema = z.object({
  refreshToken: z.string()
    .min(1, 'Refresh token is required')
    .max(1000, 'Token too long')
    .regex(/^[A-Za-z0-9._-]+$/, 'Invalid token format')
})

const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required')
    .max(128, 'Password too long'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
})

const updateProfileSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
    .trim()
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email too long')
    .toLowerCase()
    .trim()
    .optional()
})

/**
 * POST /auth/login
 * User login
 */
router.post('/login', authLimiter, auditLog(AUDIT_ACTIONS.LOGIN, AUDIT_RESOURCES.USER), async (req, res) => {
  try {
    // Validate request body
    const { email, password } = loginSchema.parse(req.body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        isActive: true
      }
    })

    if (!user) {
      await logUserAction(req, AUDIT_ACTIONS.LOGIN, AUDIT_RESOURCES.USER, undefined, {
        email,
        success: false,
        reason: 'User not found'
      })

      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      })
    }

    if (!user.isActive) {
      await logUserAction(req, AUDIT_ACTIONS.LOGIN, AUDIT_RESOURCES.USER, user.id, {
        email,
        success: false,
        reason: 'User inactive'
      })

      return res.status(401).json({
        success: false,
        error: 'Account is inactive',
        code: 'ACCOUNT_INACTIVE'
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      await logUserAction(req, AUDIT_ACTIONS.LOGIN, AUDIT_RESOURCES.USER, user.id, {
        email,
        success: false,
        reason: 'Invalid password'
      })

      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      })
    }

    // Generate tokens
    const tokens = generateTokenPair(user)

    // Create session record
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      }
    })

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    // Log successful login
    await logUserAction(req, AUDIT_ACTIONS.LOGIN, AUDIT_RESOURCES.USER, user.id, {
      email,
      success: true
    })

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt
        }
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * POST /auth/refresh
 * Refresh access token
 */
router.post('/refresh', authLimiter, async (req, res) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body)

    // Verify refresh token
    let decoded
    try {
      decoded = verifyRefreshToken(refreshToken)
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      })
    }

    // Check if session exists and is valid
    const session = await prisma.userSession.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true
          }
        }
      }
    })

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        error: 'Session expired or invalid',
        code: 'SESSION_EXPIRED'
      })
    }

    if (!session.user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is inactive',
        code: 'ACCOUNT_INACTIVE'
      })
    }

    // Generate new tokens
    const tokens = generateTokenPair(session.user)

    // Update session with new refresh token
    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        token: tokens.refreshToken,
        expiresAt: tokens.expiresAt
      }
    })

    return res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt
        }
      }
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * POST /auth/logout
 * User logout
 */
router.post('/logout', authenticate, auditLog(AUDIT_ACTIONS.LOGOUT, AUDIT_RESOURCES.USER), async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken

    if (refreshToken) {
      // Remove specific session
      await prisma.userSession.deleteMany({
        where: {
          token: refreshToken,
          userId: req.user!.userId
        }
      })
    } else {
      // Remove all sessions for user
      await prisma.userSession.deleteMany({
        where: { userId: req.user!.userId }
      })
    }

    await logUserAction(req, AUDIT_ACTIONS.LOGOUT, AUDIT_RESOURCES.USER, req.user!.userId)

    return res.json({
      success: true,
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * GET /auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    return res.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * PUT /auth/profile
 * Update user profile
 */
router.put('/profile', profileLimiter, authenticate, auditLog(AUDIT_ACTIONS.UPDATE_PROFILE, AUDIT_RESOURCES.USER), async (req, res) => {
  try {
    const updates = updateProfileSchema.parse(req.body)

    // Check if email is being changed and if it's already taken
    if (updates.email && updates.email !== req.user!.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: updates.email.toLowerCase() }
      })

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use',
          code: 'EMAIL_TAKEN'
        })
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.email && { email: updates.email.toLowerCase() })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    })

    await logUserAction(req, AUDIT_ACTIONS.UPDATE_PROFILE, AUDIT_RESOURCES.USER, req.user!.userId, {
      updates
    })

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * PUT /auth/password
 * Change user password
 */
router.put('/password', passwordLimiter, authenticate, auditLog(AUDIT_ACTIONS.CHANGE_PASSWORD, AUDIT_RESOURCES.USER), async (req, res) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body)

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, password: true }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      await logUserAction(req, AUDIT_ACTIONS.CHANGE_PASSWORD, AUDIT_RESOURCES.USER, req.user!.userId, {
        success: false,
        reason: 'Invalid current password'
      })

      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { password: hashedNewPassword }
    })

    // Invalidate all existing sessions (force re-login)
    await prisma.userSession.deleteMany({
      where: { userId: req.user!.userId }
    })

    await logUserAction(req, AUDIT_ACTIONS.CHANGE_PASSWORD, AUDIT_RESOURCES.USER, req.user!.userId, {
      success: true
    })

    return res.json({
      success: true,
      message: 'Password changed successfully. Please log in again.'
    })
  } catch (error) {
    console.error('Change password error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * GET /auth/sessions
 * Get user's active sessions
 */
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const sessions = await prisma.userSession.findMany({
      where: {
        userId: req.user!.userId,
        expiresAt: { gt: new Date() }
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      success: true,
      data: { sessions }
    })
  } catch (error) {
    console.error('Get sessions error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * DELETE /auth/sessions/:sessionId
 * Revoke specific session
 */
router.delete('/sessions/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params

    const whereClause: any = {
      userId: req.user!.userId
    }
    if (sessionId) {
      whereClause.id = sessionId
    }
    
    await prisma.userSession.deleteMany({
      where: whereClause
    })

    res.json({
      success: true,
      message: 'Session revoked successfully'
    })
  } catch (error) {
    console.error('Revoke session error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

export default router
