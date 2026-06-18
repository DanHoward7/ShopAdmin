import { Request, Response, NextFunction } from 'express'
import { PrismaClient, UserRole } from '@prisma/client'
import { verifyAccessToken, extractTokenFromHeader, JWTPayload } from '../utils/jwt'

const prisma = new PrismaClient()

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload & {
        isActive: boolean
      }
    }
  }
}

/**
 * Authentication middleware - verifies JWT token and adds user to request
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization)
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      })
    }

    // Verify token
    let payload: JWTPayload
    try {
      payload = verifyAccessToken(token)
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Token verification failed',
        code: 'TOKEN_INVALID'
      })
    }

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User account is inactive',
        code: 'USER_INACTIVE'
      })
    }

    // Add user to request object
    req.user = {
      ...payload,
      isActive: user.isActive
    }

    return next()
  } catch (error) {
    console.error('Authentication middleware error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    })
  }
}

/**
 * Authorization middleware - checks if user has required role
 */
export function authorize(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        details: {
          required: allowedRoles,
          current: req.user.role
        }
      })
    }

    return next()
  }
}

/**
 * Optional authentication middleware - adds user to request if token is valid, but doesn't require it
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization)
    
    if (!token) {
      return next() // No token, continue without user
    }

    try {
      const payload = verifyAccessToken(token)
      
      // Check if user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true
        }
      })

      if (user && user.isActive) {
        req.user = {
          ...payload,
          isActive: user.isActive
        }
      }
    } catch {
      // Invalid token, continue without user
    }

    return next()
  } catch (error) {
    console.error('Optional auth middleware error:', error)
    return next() // Continue without user on error
  }
}

/**
 * Role-based authorization helpers
 */
export const requireAdmin = authorize(['ADMIN'])
export const requireManagerOrAdmin = authorize(['ADMIN', 'MANAGER'])
export const requireAnyRole = authorize(['ADMIN', 'MANAGER', 'VIEWER'])

/**
 * Check if user has permission for specific resource
 */
export function hasPermission(userRole: UserRole, action: string, resource: string): boolean {
  const permissions: Record<UserRole, Record<string, string[]>> = {
    ADMIN: {
      '*': ['*'] // Admin can do everything
    },
    MANAGER: {
      'orders': ['create', 'read', 'update', 'delete'],
      'stores': ['create', 'read', 'update', 'delete'],
      'products': ['create', 'read', 'update', 'delete'],
      'customers': ['read', 'update'],
      'users': ['read'] // Can view users but not manage them
    },
    VIEWER: {
      'orders': ['read'],
      'stores': ['read'],
      'products': ['read'],
      'customers': ['read'],
      'users': ['read']
    }
  }

  const userPermissions = permissions[userRole]
  
  // Admin has all permissions
  if (userPermissions['*']) {
    return true
  }

  const resourcePermissions = userPermissions[resource]
  if (!resourcePermissions) {
    return false
  }

  return resourcePermissions.includes(action) || resourcePermissions.includes('*')
}

/**
 * Resource-based authorization middleware
 */
export function authorizeResource(resource: string, action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      })
    }

    if (!hasPermission(req.user.role, action, resource)) {
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions for ${action} on ${resource}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        details: {
          resource,
          action,
          userRole: req.user.role
        }
      })
    }

    return next()
  }
}
