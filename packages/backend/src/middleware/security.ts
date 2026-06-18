import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

/**
 * Input sanitization middleware
 * Cleans and validates request data to prevent injection attacks
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body)
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query)
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params)
    }

    return next()
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input data',
      code: 'INVALID_INPUT'
    })
  }
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item))
  }

  if (typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key name
      const cleanKey = sanitizeString(key)
      if (cleanKey && cleanKey.length <= 100) { // Limit key length
        sanitized[cleanKey] = sanitizeObject(value)
      }
    }
    return sanitized
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj)
  }

  return obj
}

/**
 * Sanitize string values
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') {
    return str
  }

  // Remove null bytes and control characters
  let cleaned = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  // Limit string length to prevent DoS
  if (cleaned.length > 10000) {
    cleaned = cleaned.substring(0, 10000)
  }

  // Basic XSS prevention - remove script tags and javascript: protocols
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  cleaned = cleaned.replace(/javascript:/gi, '')
  cleaned = cleaned.replace(/on\w+\s*=/gi, '')

  return cleaned.trim()
}

/**
 * Request size limiter middleware
 * Prevents large payload attacks
 */
export function limitRequestSize(maxSize: number = 1024 * 1024) { // Default 1MB
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0')
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        error: 'Request payload too large',
        code: 'PAYLOAD_TOO_LARGE',
        maxSize: `${maxSize} bytes`
      })
    }

    return next()
  }
}

/**
 * Security headers middleware
 * Adds additional security headers beyond helmet
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block')
  
  // Prevent information disclosure
  res.removeHeader('X-Powered-By')
  
  // Cache control for sensitive endpoints
  if (req.path.includes('/auth') || req.path.includes('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
  }

  return next()
}

/**
 * Request validation middleware factory
 * Creates middleware for validating requests with Zod schemas
 */
export function validateRequest(schema: {
  body?: z.ZodSchema
  query?: z.ZodSchema
  params?: z.ZodSchema
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schema.body) {
        req.body = schema.body.parse(req.body)
      }

      // Validate query parameters
      if (schema.query) {
        req.query = schema.query.parse(req.query)
      }

      // Validate URL parameters
      if (schema.params) {
        req.params = schema.params.parse(req.params)
      }

      return next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        })
      }

      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        code: 'INVALID_REQUEST'
      })
    }
  }
}

/**
 * Common validation schemas for reuse
 */
export const commonSchemas = {
  // ID parameter validation
  id: z.object({
    id: z.string().regex(/^[a-zA-Z0-9_-]+$/, 'Invalid ID format').max(50)
  }),

  // Pagination query validation
  pagination: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sort: z.string().max(50).optional(),
    order: z.enum(['asc', 'desc']).optional()
  }),

  // Search query validation
  search: z.object({
    q: z.string().max(100).optional(),
    filter: z.string().max(200).optional()
  })
}
