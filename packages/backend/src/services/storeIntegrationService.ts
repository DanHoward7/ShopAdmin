import { PrismaClient } from '@prisma/client';
import { apiKeyService } from './apiKeyService';

const prisma = new PrismaClient();

export interface WebhookPayload {
  event: 'order.created' | 'order.updated' | 'order.cancelled';
  data: any;
  timestamp: string;
  storeId?: string;
}

export interface OrderSyncPayload {
  orderNumber: string;
  status: string;
  total: number;
  tax?: number | null;
  shipping?: number | null;
  currency: string;
  customer: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
  }>;
  shippingAddress?: {
    line1: string;
    line2?: string | null;
    city: string;
    state?: string | null;
    postalCode: string;
    country: string;
  } | null;
  billingAddress?: {
    line1: string;
    line2?: string | null;
    city: string;
    state?: string | null;
    postalCode: string;
    country: string;
  } | null;
  paymentMethod?: string | null;
  notes?: string | null;
  createdAt?: string | null;
}

export class StoreIntegrationService {
  /**
   * Authenticate API request and get store context
   */
  async authenticateRequest(apiKey: string): Promise<{ storeId: string; permissions: string[] } | null> {
    return apiKeyService.authenticateApiKey(apiKey);
  }

  /**
   * Process incoming webhook from ecommerce store
   */
  async processWebhook(payload: WebhookPayload, storeId: string): Promise<void> {
    try {
      // Verify store exists and is active
      const store = await prisma.store.findFirst({
        where: {
          id: storeId,
          isActive: true,
          status: 'ACTIVE',
        },
        include: {
          storeConfig: true,
        },
      });

      if (!store) {
        throw new Error('Store not found or inactive');
      }

      // Check if webhook processing is enabled
      if (!store.storeConfig?.orderSyncEnabled) {
        console.log(`Webhook processing disabled for store ${storeId}`);
        return;
      }

      // Process based on event type
      switch (payload.event) {
        case 'order.created':
          await this.handleOrderCreated(payload.data, storeId);
          break;
        case 'order.updated':
          await this.handleOrderUpdated(payload.data, storeId);
          break;
        case 'order.cancelled':
          await this.handleOrderCancelled(payload.data, storeId);
          break;
        default:
          console.log(`Unknown webhook event: ${payload.event}`);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  }

  /**
   * Sync order data from ecommerce store
   */
  async syncOrder(orderData: OrderSyncPayload, storeId: string): Promise<any> {
    try {
      // Verify store exists and is active
      const store = await prisma.store.findFirst({
        where: {
          id: storeId,
          isActive: true,
          status: 'ACTIVE',
        },
      });

      if (!store) {
        throw new Error('Store not found or inactive');
      }

      // Check if order already exists
      const existingOrder = await prisma.order.findFirst({
        where: {
          orderNumber: orderData.orderNumber,
          storeId,
        },
      });

      if (existingOrder) {
        // Update existing order
        return this.updateExistingOrder(existingOrder.id, orderData, storeId);
      } else {
        // Create new order
        return this.createNewOrder(orderData, storeId);
      }
    } catch (error) {
      console.error('Error syncing order:', error);
      throw error;
    }
  }

  /**
   * Get store integration status and configuration
   */
  async getIntegrationStatus(storeId: string): Promise<{
    isActive: boolean;
    lastSync?: Date;
    syncEnabled: boolean;
    webhookUrl?: string;
    apiKeysCount: number;
    recentOrders: number;
  }> {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        include: {
          storeConfig: true,
          _count: {
            select: {
              apiKeys: true,
              orders: {
                where: {
                  createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                  },
                },
              },
            },
          },
        },
      });

      if (!store) {
        throw new Error('Store not found');
      }

      // Get last order sync time (approximate)
      const lastOrder = await prisma.order.findFirst({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });

      return {
        isActive: store.isActive && store.status === 'ACTIVE',
        ...(lastOrder?.createdAt && { lastSync: lastOrder.createdAt }),
        syncEnabled: store.storeConfig?.orderSyncEnabled ?? false,
        ...(store.storeConfig?.webhookUrl && { webhookUrl: store.storeConfig.webhookUrl }),
        apiKeysCount: store._count.apiKeys,
        recentOrders: store._count.orders,
      };
    } catch (error) {
      console.error('Error getting integration status:', error);
      throw error;
    }
  }

  /**
   * Test store connection and API key
   */
  async testConnection(storeId: string): Promise<{
    success: boolean;
    message: string;
    details: {
      storeActive: boolean;
      configExists: boolean;
      apiKeysCount: number;
    };
  }> {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        include: {
          storeConfig: true,
          _count: {
            select: {
              apiKeys: {
                where: { isActive: true },
              },
            },
          },
        },
      });

      if (!store) {
        return {
          success: false,
          message: 'Store not found',
          details: {
            storeActive: false,
            configExists: false,
            apiKeysCount: 0,
          },
        };
      }

      const details = {
        storeActive: store.isActive && store.status === 'ACTIVE',
        configExists: !!store.storeConfig,
        apiKeysCount: store._count.apiKeys,
      };

      const success = details.storeActive && details.configExists && details.apiKeysCount > 0;

      return {
        success,
        message: success 
          ? 'Store integration is properly configured' 
          : 'Store integration needs configuration',
        details,
      };
    } catch (error) {
      console.error('Error testing connection:', error);
      return {
        success: false,
        message: 'Error testing connection',
        details: {
          storeActive: false,
          configExists: false,
          apiKeysCount: 0,
        },
      };
    }
  }

  /**
   * Handle order created webhook
   */
  private async handleOrderCreated(orderData: any, storeId: string): Promise<void> {
    try {
      await this.createNewOrder(orderData, storeId);
      console.log(`Order created via webhook for store ${storeId}`);
    } catch (error) {
      console.error('Error handling order created webhook:', error);
      throw error;
    }
  }

  /**
   * Handle order updated webhook
   */
  private async handleOrderUpdated(orderData: any, storeId: string): Promise<void> {
    try {
      const existingOrder = await prisma.order.findFirst({
        where: {
          orderNumber: orderData.orderNumber,
          storeId,
        },
      });

      if (existingOrder) {
        await this.updateExistingOrder(existingOrder.id, orderData, storeId);
        console.log(`Order updated via webhook for store ${storeId}`);
      } else {
        // Create if it doesn't exist
        await this.createNewOrder(orderData, storeId);
        console.log(`Order created via update webhook for store ${storeId}`);
      }
    } catch (error) {
      console.error('Error handling order updated webhook:', error);
      throw error;
    }
  }

  /**
   * Handle order cancelled webhook
   */
  private async handleOrderCancelled(orderData: any, storeId: string): Promise<void> {
    try {
      const existingOrder = await prisma.order.findFirst({
        where: {
          orderNumber: orderData.orderNumber,
          storeId,
        },
      });

      if (existingOrder) {
        await prisma.order.update({
          where: { id: existingOrder.id },
          data: { status: 'CANCELLED' },
        });
        console.log(`Order cancelled via webhook for store ${storeId}`);
      }
    } catch (error) {
      console.error('Error handling order cancelled webhook:', error);
      throw error;
    }
  }

  /**
   * Create new order from sync data
   */
  private async createNewOrder(orderData: OrderSyncPayload, storeId: string): Promise<any> {
    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: {
        email: orderData.customer.email,
        storeId,
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email: orderData.customer.email,
          firstName: orderData.customer.firstName ?? null,
          lastName: orderData.customer.lastName ?? null,
          phone: orderData.customer.phone ?? null,
          storeId,
        },
      });
    }

    // Create addresses if provided
    let shippingAddressId: string | null = null;
    let billingAddressId: string | null = null;

    if (orderData.shippingAddress) {
      const shippingAddress = await prisma.address.create({
        data: {
          line1: orderData.shippingAddress.line1,
          line2: orderData.shippingAddress.line2 ?? null,
          city: orderData.shippingAddress.city,
          state: orderData.shippingAddress.state ?? null,
          postalCode: orderData.shippingAddress.postalCode,
          country: orderData.shippingAddress.country,
        },
      });
      shippingAddressId = shippingAddress.id;
    }

    if (orderData.billingAddress) {
      const billingAddress = await prisma.address.create({
        data: {
          line1: orderData.billingAddress.line1,
          line2: orderData.billingAddress.line2 ?? null,
          city: orderData.billingAddress.city,
          state: orderData.billingAddress.state ?? null,
          postalCode: orderData.billingAddress.postalCode,
          country: orderData.billingAddress.country,
        },
      });
      billingAddressId = billingAddress.id;
    }

    // Map status to our enum
    const status = this.mapOrderStatus(orderData.status);

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: orderData.orderNumber,
        storeId,
        customerId: customer.id,
        status,
        total: orderData.total,
        tax: orderData.tax ?? null,
        shipping: orderData.shipping ?? null,
        paymentMethod: orderData.paymentMethod ?? null,
        notes: orderData.notes ?? null,
        shippingAddressId,
        billingAddressId,
        ...(orderData.createdAt && { createdAt: new Date(orderData.createdAt) }),
        items: {
          create: orderData.items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
        store: true,
      },
    });

    return order;
  }

  /**
   * Update existing order from sync data
   */
  private async updateExistingOrder(orderId: string, orderData: OrderSyncPayload, storeId: string): Promise<any> {
    const status = this.mapOrderStatus(orderData.status);

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        total: orderData.total,
        tax: orderData.tax ?? null,
        shipping: orderData.shipping ?? null,
        paymentMethod: orderData.paymentMethod ?? null,
        notes: orderData.notes ?? null,
      },
      include: {
        items: true,
        customer: true,
        store: true,
      },
    });

    return order;
  }

  /**
   * Map external order status to internal enum
   */
  private mapOrderStatus(externalStatus: string): any {
    const statusMap: Record<string, string> = {
      'pending': 'PENDING',
      'processing': 'PROCESSING',
      'completed': 'COMPLETED',
      'fulfilled': 'COMPLETED',
      'cancelled': 'CANCELLED',
      'canceled': 'CANCELLED',
      'refunded': 'REFUNDED',
      'on-hold': 'ON_HOLD',
      'shipped': 'SHIPPED',
    };

    return statusMap[externalStatus.toLowerCase()] || 'PENDING';
  }
}

export const storeIntegrationService = new StoreIntegrationService();
