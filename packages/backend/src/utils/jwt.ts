import jwt from 'jsonwebtoken'
import { UserRole } from '@prisma/client'

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  name: string
  iat?: number
  exp?: number
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresAt: Date
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(
    payload as string | object | Buffer,
    JWT_SECRET as jwt.Secret,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'shopadmin-api',
      audience: 'shopadmin-client'
    } as jwt.SignOptions
  )
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'refresh' } as string | object | Buffer,
    JWT_SECRET as jwt.Secret,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'shopadmin-api',
      audience: 'shopadmin-client'
    } as jwt.SignOptions
  )
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(user: {
  id: string
  email: string
  role: UserRole
  name: string
}): TokenPair {
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  })

  const refreshToken = generateRefreshToken(user.id)

  // Calculate expiration date
  const expiresAt = new Date()
  expiresAt.setTime(expiresAt.getTime() + (24 * 60 * 60 * 1000)) // 24 hours

  return {
    accessToken,
    refreshToken,
    expiresAt
  }
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET as jwt.Secret,
      {
        issuer: 'shopadmin-api',
        audience: 'shopadmin-client'
      } as jwt.VerifyOptions
    ) as JWTPayload

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token')
    } else {
      throw new Error('Token verification failed')
    }
  }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): { userId: string; type: string } {
  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET as jwt.Secret,
      {
        issuer: 'shopadmin-api',
        audience: 'shopadmin-client'
      } as jwt.VerifyOptions
    ) as { userId: string; type: string }

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type')
    }

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token')
    } else {
      throw new Error('Refresh token verification failed')
    }
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }

  return parts[1] || null
}

/**
 * Get token expiration date
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as { exp?: number }
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000)
    }
    return null
  } catch {
    return null
  }
}
