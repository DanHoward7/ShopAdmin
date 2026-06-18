import { Request, Response, NextFunction } from 'express'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export interface AuditLogData {
  action: string
  resource: string
  resourceId?: string | undefined
  details?: any
}

/**
 * Audit logging middleware - logs user actions
 */
export function auditLog(action: string, resource: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store audit data in request for later use
    req.auditData = {
      action,
      resource,
      resourceId: req.params.id || undefined,
      details: {
        method: req.method,
        path: req.path,
        query: req.query,
        body: sanitizeBody(req.body)
      }
    }

    // Continue to the route handler
    next()
  }
}

/**
 * Create audit log entry
 */
export async function createAuditLog(
  userId: string | undefined,
  action: string,
  resource: string,
  resourceId?: string | undefined,
  details?: any,
  ipAddress?: string | undefined,
  userAgent?: string | undefined
) {
  try {
    // Build data object conditionally to avoid undefined values
    const data: Prisma.AuditLogUncheckedCreateInput = {
      action,
      resource,
    }

    // Only include optional fields if they have actual values
    if (userId) data.userId = userId
    if (resourceId) data.resourceId = resourceId
    if (details) data.details = details
    if (ipAddress) data.ipAddress = ipAddress
    if (userAgent) data.userAgent = userAgent

    await prisma.auditLog.create({ data })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw error to avoid breaking the main flow
  }
}

/**
 * Middleware to automatically log successful operations
 */
export function autoAudit(req: Request, res: Response, next: NextFunction) {
  // Store original res.json to intercept responses
  const originalJson = res.json

  res.json = function(body: any) {
    // Only log successful operations (2xx status codes)
    if (res.statusCode >= 200 && res.statusCode < 300 && req.auditData) {
      const { action, resource, resourceId, details } = req.auditData
      
      // Extract additional details from response if available
      const responseDetails = {
        ...details,
        statusCode: res.statusCode,
        responseData: sanitizeResponse(body)
      }

      // Create audit log asynchronously
      createAuditLog(
        req.user?.userId,
        action,
        resource,
        resourceId || extractResourceIdFromResponse(body),
        responseDetails,
        getClientIp(req),
        req.get('User-Agent')
      ).catch(error => {
        console.error('Auto audit logging failed:', error)
      })
    }

    // Call original json method
    return originalJson.call(this, body)
  }

  next()
}

/**
 * Manual audit logging function for custom use
 */
export async function logUserAction(
  req: Request,
  action: string,
  resource: string,
  resourceId?: string,
  additionalDetails?: any
) {
  const details = {
    method: req.method,
    path: req.path,
    query: req.query,
    ...additionalDetails
  }

  await createAuditLog(
    req.user?.userId,
    action,
    resource,
    resourceId,
    details,
    getClientIp(req),
    req.get('User-Agent')
  )
}

/**
 * Sanitize request body for logging (remove sensitive data)
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body
  }

  const sanitized = { ...body }
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'apiKey']
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]'
    }
  })

  return sanitized
}

/**
 * Sanitize response data for logging
 */
function sanitizeResponse(body: any): any {
  if (!body || typeof body !== 'object') {
    return body
  }

  // Only log basic response info to avoid storing too much data
  if (body.success !== undefined) {
    return {
      success: body.success,
      message: body.message,
      dataType: body.data ? typeof body.data : undefined,
      dataLength: Array.isArray(body.data) ? body.data.length : undefined
    }
  }

  return { type: typeof body }
}

/**
 * Extract resource ID from response body
 */
function extractResourceIdFromResponse(body: any): string | undefined {
  if (!body || typeof body !== 'object') {
    return undefined
  }

  // Try to find ID in common response patterns
  if (body.data?.id) {
    return body.data.id
  }

  if (body.id) {
    return body.id
  }

  return undefined
}

/**
 * Get client IP address from request
 */
function getClientIp(req: Request): string {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection as any)?.socket?.remoteAddress ||
    'unknown'
  )
}

/**
 * Extend Express Request type to include audit data
 */
declare global {
  namespace Express {
    interface Request {
      auditData?: AuditLogData
    }
  }
}

/**
 * Common audit actions
 */
export const AUDIT_ACTIONS = {
  // User actions
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',

  // CRUD operations
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  
  // Bulk operations
  BULK_CREATE: 'BULK_CREATE',
  BULK_UPDATE: 'BULK_UPDATE',
  BULK_DELETE: 'BULK_DELETE',

  // Status changes
  ACTIVATE: 'ACTIVATE',
  DEACTIVATE: 'DEACTIVATE',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',

  // API operations
  GENERATE_API_KEY: 'GENERATE_API_KEY',
  REVOKE_API_KEY: 'REVOKE_API_KEY',

  // Export operations
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT'
} as const

/**
 * Common resource types
 */
export const AUDIT_RESOURCES = {
  USER: 'User',
  ORDER: 'Order',
  STORE: 'Store',
  PRODUCT: 'Product',
  CUSTOMER: 'Customer',
  API_KEY: 'ApiKey',
  AUDIT_LOG: 'AuditLog'
} as const
