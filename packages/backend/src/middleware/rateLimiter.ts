import rateLimit from 'express-rate-limit'
import { Request, Response } from 'express'

/**
 * General API rate limiter
 * Applies to all API routes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes'
    })
  }
})

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks on login
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts from this IP, please try again later',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes'
    })
  }
})

/**
 * Very strict rate limiter for password change attempts
 * Extra protection for sensitive operations
 */
export const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 password change attempts per hour
  message: {
    success: false,
    error: 'Too many password change attempts, please try again later',
    code: 'PASSWORD_RATE_LIMIT_EXCEEDED',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many password change attempts from this IP, please try again later',
      code: 'PASSWORD_RATE_LIMIT_EXCEEDED',
      retryAfter: '1 hour'
    })
  }
})

/**
 * Moderate rate limiter for user profile updates
 * Prevents spam updates
 */
export const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 profile updates per windowMs
  message: {
    success: false,
    error: 'Too many profile update attempts, please try again later',
    code: 'PROFILE_RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many profile update attempts from this IP, please try again later',
      code: 'PROFILE_RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes'
    })
  }
})

/**
 * Lenient rate limiter for read operations
 * Allows more requests for viewing data
 */
export const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Limit each IP to 2000 read requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    code: 'READ_RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later',
      code: 'READ_RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes'
    })
  }
})
