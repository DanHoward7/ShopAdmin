import { Request, Response } from 'express';
import { storeIntegrationService, WebhookPayload, OrderSyncPayload } from '../services/storeIntegrationService';
import { z } from 'zod';

// Validation schemas
const WebhookPayloadSchema = z.object({
  event: z.enum(['order.created', 'order.updated', 'order.cancelled']),
  data: z.any().refine((val) => val !== undefined, { message: "Data is required" }),
  timestamp: z.string(),
});

const OrderSyncSchema = z.object({
  orderNumber: z.string().min(1),
  status: z.string().min(1),
  total: z.number().min(0),
  tax: z.number().min(0).nullish(),
  shipping: z.number().min(0).nullish(),
  currency: z.string().length(3),
  customer: z.object({
    email: z.string().email(),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    phone: z.string().nullish(),
  }),
  items: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    price: z.number().min(0),
    quantity: z.number().min(1),
    total: z.number().min(0),
  })).min(1),
  shippingAddress: z.object({
    line1: z.string(),
    line2: z.string().nullish(),
    city: z.string(),
    state: z.string().nullish(),
    postalCode: z.string(),
    country: z.string(),
  }).nullish(),
  billingAddress: z.object({
    line1: z.string(),
    line2: z.string().nullish(),
    city: z.string(),
    state: z.string().nullish(),
    postalCode: z.string(),
    country: z.string(),
  }).nullish(),
  paymentMethod: z.string().nullish(),
  notes: z.string().nullish(),
  createdAt: z.string().datetime().nullish(),
});

/**
 * Middleware to authenticate API key
 */
export const authenticateApiKey = async (req: Request, res: Response, next: any) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required',
      });
    }

    const auth = await storeIntegrationService.authenticateRequest(apiKey);
    
    if (!auth) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key',
      });
    }

    // Add store context to request
    (req as any).storeId = auth.storeId;
    (req as any).permissions = auth.permissions;
    
    next();
  } catch (error) {
    console.error('Error authenticating API key:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

/**
 * Check if user has required permission
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: any) => {
    const permissions = (req as any).permissions as string[];
    
    if (!permissions || !permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required: ${permission}`,
      });
    }
    
    next();
  };
};

/**
 * Process incoming webhook from ecommerce store
 */
export const processWebhook = async (req: Request, res: Response) => {
  try {
    const storeId = (req as any).storeId;
    
    const validationResult = WebhookPayloadSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook payload',
        errors: validationResult.error.errors,
      });
    }

    // Type assertion since Zod validation ensures data exists
    await storeIntegrationService.processWebhook(validationResult.data as WebhookPayload, storeId);

    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Sync order data from ecommerce store
 */
export const syncOrder = async (req: Request, res: Response) => {
  try {
    const storeId = (req as any).storeId;
    
    const validationResult = OrderSyncSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order data',
        errors: validationResult.error.errors,
      });
    }

    // Transform undefined values to null for compatibility
    const transformedData: OrderSyncPayload = {
      ...validationResult.data,
      tax: validationResult.data.tax ?? null,
      shipping: validationResult.data.shipping ?? null,
      customer: {
        ...validationResult.data.customer,
        firstName: validationResult.data.customer.firstName ?? null,
        lastName: validationResult.data.customer.lastName ?? null,
        phone: validationResult.data.customer.phone ?? null,
      },
      shippingAddress: validationResult.data.shippingAddress ? {
        ...validationResult.data.shippingAddress,
        line2: validationResult.data.shippingAddress.line2 ?? null,
        state: validationResult.data.shippingAddress.state ?? null,
      } : null,
      billingAddress: validationResult.data.billingAddress ? {
        ...validationResult.data.billingAddress,
        line2: validationResult.data.billingAddress.line2 ?? null,
        state: validationResult.data.billingAddress.state ?? null,
      } : null,
      paymentMethod: validationResult.data.paymentMethod ?? null,
      notes: validationResult.data.notes ?? null,
      createdAt: validationResult.data.createdAt ?? null,
    };

    const order = await storeIntegrationService.syncOrder(transformedData, storeId);

    return res.status(200).json({
      success: true,
      data: order,
      message: 'Order synced successfully',
    });
  } catch (error) {
    console.error('Error syncing order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to sync order',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get store integration status
 */
export const getIntegrationStatus = async (req: Request, res: Response) => {
  try {
    const storeId = (req as any).storeId;
    
    const status = await storeIntegrationService.getIntegrationStatus(storeId);

    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Error getting integration status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get integration status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Test store connection
 */
export const testConnection = async (req: Request, res: Response) => {
  try {
    const storeId = (req as any).storeId;
    
    const result = await storeIntegrationService.testConnection(storeId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error testing connection:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to test connection',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get API documentation for store integration
 */
export const getApiDocumentation = async (req: Request, res: Response) => {
  try {
    const storeId = (req as any).storeId;
    
    const documentation = {
      storeId,
      baseUrl: `${req.protocol}://${req.get('host')}/api/integration`,
      authentication: {
        method: 'API Key',
        header: 'X-API-Key',
        description: 'Include your API key in the X-API-Key header for all requests',
      },
      endpoints: {
        webhook: {
          url: '/webhook',
          method: 'POST',
          description: 'Receive webhook notifications from your ecommerce store',
          requiredPermissions: ['orders:write'],
          payload: {
            event: 'order.created | order.updated | order.cancelled',
            data: 'Order data object',
            timestamp: 'ISO 8601 timestamp',
          },
        },
        syncOrder: {
          url: '/orders/sync',
          method: 'POST',
          description: 'Manually sync order data',
          requiredPermissions: ['orders:write'],
          payload: 'OrderSyncPayload object',
        },
        status: {
          url: '/status',
          method: 'GET',
          description: 'Get integration status and configuration',
          requiredPermissions: ['store:read'],
        },
        test: {
          url: '/test',
          method: 'GET',
          description: 'Test API connection and configuration',
          requiredPermissions: ['store:read'],
        },
      },
      examples: {
        webhook: {
          event: 'order.created',
          data: {
            orderNumber: 'ORD-12345',
            status: 'pending',
            total: 99.99,
            currency: 'USD',
            customer: {
              email: 'customer@example.com',
              firstName: 'John',
              lastName: 'Doe',
            },
            items: [
              {
                productId: 'PROD-123',
                name: 'Sample Product',
                price: 99.99,
                quantity: 1,
                total: 99.99,
              },
            ],
          },
          timestamp: new Date().toISOString(),
        },
      },
    };

    return res.status(200).json({
      success: true,
      data: documentation,
    });
  } catch (error) {
    console.error('Error getting API documentation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get API documentation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
