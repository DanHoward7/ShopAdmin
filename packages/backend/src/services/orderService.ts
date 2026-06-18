import { PrismaClient, OrderStatus } from '@prisma/client';
import { 
  CreateOrderInput, 
  UpdateOrderInput, 
  OrderQuery, 
  OrderResponse, 
  OrderListResponse,
  OrderStatsResponse 
} from '../types/order.types';
import { orderHistoryService } from './orderHistoryService';

const prisma = new PrismaClient();

export class OrderService {
  /**
   * Create a new order with items and addresses
   */
  async createOrder(data: CreateOrderInput): Promise<OrderResponse> {
    try {
      // Check if store exists
      const store = await prisma.store.findUnique({
        where: { id: data.storeId },
      });

      if (!store) {
        throw new Error(`Store with ID ${data.storeId} not found`);
      }

      // Check if order number is unique for this store
      const existingOrder = await prisma.order.findUnique({
        where: {
          orderNumber_storeId: {
            orderNumber: data.orderNumber,
            storeId: data.storeId,
          },
        },
      });

      if (existingOrder) {
        throw new Error(`Order number ${data.orderNumber} already exists for this store`);
      }

      // Validate customer if provided
      if (data.customerId) {
        const customer = await prisma.customer.findUnique({
          where: { id: data.customerId },
        });

        if (!customer) {
          throw new Error(`Customer with ID ${data.customerId} not found`);
        }
      }

      // Create addresses if provided
      let shippingAddressId: string | undefined;
      let billingAddressId: string | undefined;

      if (data.shippingAddress) {
        const shippingAddress = await prisma.address.create({
          data: {
            line1: data.shippingAddress.line1,
            line2: data.shippingAddress.line2 ?? null,
            city: data.shippingAddress.city,
            state: data.shippingAddress.state ?? null,
            postalCode: data.shippingAddress.postalCode,
            country: data.shippingAddress.country,
          },
        });
        shippingAddressId = shippingAddress.id;
      }

      if (data.billingAddress) {
        const billingAddress = await prisma.address.create({
          data: {
            line1: data.billingAddress.line1,
            line2: data.billingAddress.line2 ?? null,
            city: data.billingAddress.city,
            state: data.billingAddress.state ?? null,
            postalCode: data.billingAddress.postalCode,
            country: data.billingAddress.country,
          },
        });
        billingAddressId = billingAddress.id;
      }

      // Create order with items
      const order = await prisma.order.create({
        data: {
          orderNumber: data.orderNumber,
          storeId: data.storeId,
          customerId: data.customerId ?? null,
          status: data.status,
          total: data.total,
          tax: data.tax ?? null,
          shipping: data.shipping ?? null,
          paymentMethod: data.paymentMethod ?? null,
          notes: data.notes ?? null,
          shippingAddressId: shippingAddressId ?? null,
          billingAddressId: billingAddressId ?? null,
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              total: item.total,
            })),
          },
        },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              url: true,
            },
          },
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          shippingAddress: true,
          billingAddress: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });

      return this.formatOrderResponse(order);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Get order by ID with full details
   */
  async getOrderById(id: string): Promise<OrderResponse | null> {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              url: true,
            },
          },
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          shippingAddress: true,
          billingAddress: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });

      return order ? this.formatOrderResponse(order) : null;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  /**
   * Get orders with filtering, pagination, and sorting
   */
  async getOrders(query: OrderQuery): Promise<OrderListResponse> {
    try {
      const {
        page,
        limit,
        storeId,
        status,
        customerId,
        search,
        sortBy,
        sortOrder,
        dateFrom,
        dateTo,
      } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (storeId) {
        where.storeId = storeId;
      }

      if (status) {
        where.status = status;
      }

      if (customerId) {
        where.customerId = customerId;
      }

      if (search) {
        where.OR = [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { customer: { email: { contains: search, mode: 'insensitive' } } },
          { customer: { firstName: { contains: search, mode: 'insensitive' } } },
          { customer: { lastName: { contains: search, mode: 'insensitive' } } },
          { notes: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) {
          where.createdAt.gte = new Date(dateFrom);
        }
        if (dateTo) {
          where.createdAt.lte = new Date(dateTo);
        }
      }

      // Get total count for pagination
      const total = await prisma.order.count({ where });

      // Get orders
      const orders = await prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              url: true,
            },
          },
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          shippingAddress: true,
          billingAddress: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        orders: orders.map(order => this.formatOrderResponse(order)),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        filters: {
          ...(storeId && { storeId }),
          ...(status && { status }),
          ...(customerId && { customerId }),
          ...(search && { search }),
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo }),
        },
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Update order
   */
  async updateOrder(id: string, data: UpdateOrderInput): Promise<OrderResponse> {
    try {
      // Check if order exists
      const existingOrder = await prisma.order.findUnique({
        where: { id },
      });

      if (!existingOrder) {
        throw new Error(`Order with ID ${id} not found`);
      }

      // Track status changes
      if (data.status && data.status !== existingOrder.status) {
        await orderHistoryService.recordStatusChange(
          id,
          existingOrder.status,
          data.status,
          'System', // In a real app, this would be the authenticated user
          'Status updated via API'
        );
      }

      // Handle address updates
      let shippingAddressId = existingOrder.shippingAddressId;
      let billingAddressId = existingOrder.billingAddressId;

      if (data.shippingAddress) {
        if (shippingAddressId) {
          await prisma.address.update({
            where: { id: shippingAddressId },
            data: {
              line1: data.shippingAddress.line1,
              line2: data.shippingAddress.line2 ?? null,
              city: data.shippingAddress.city,
              state: data.shippingAddress.state ?? null,
              postalCode: data.shippingAddress.postalCode,
              country: data.shippingAddress.country,
            },
          });
        } else {
          const address = await prisma.address.create({
            data: {
              line1: data.shippingAddress.line1,
              line2: data.shippingAddress.line2 ?? null,
              city: data.shippingAddress.city,
              state: data.shippingAddress.state ?? null,
              postalCode: data.shippingAddress.postalCode,
              country: data.shippingAddress.country,
            },
          });
          shippingAddressId = address.id;
        }
      }

      if (data.billingAddress) {
        if (billingAddressId) {
          await prisma.address.update({
            where: { id: billingAddressId },
            data: {
              line1: data.billingAddress.line1,
              line2: data.billingAddress.line2 ?? null,
              city: data.billingAddress.city,
              state: data.billingAddress.state ?? null,
              postalCode: data.billingAddress.postalCode,
              country: data.billingAddress.country,
            },
          });
        } else {
          const address = await prisma.address.create({
            data: {
              line1: data.billingAddress.line1,
              line2: data.billingAddress.line2 ?? null,
              city: data.billingAddress.city,
              state: data.billingAddress.state ?? null,
              postalCode: data.billingAddress.postalCode,
              country: data.billingAddress.country,
            },
          });
          billingAddressId = address.id;
        }
      }

      // Update order items if provided
      if (data.items) {
        // Delete existing items
        await prisma.orderItem.deleteMany({
          where: { orderId: id },
        });

        // Create new items
        await prisma.orderItem.createMany({
          data: data.items.map(item => ({
            orderId: id,
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
          })),
        });
      }

      // Update order
      const updateData: any = {};
      if (data.orderNumber !== undefined) updateData.orderNumber = data.orderNumber;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.total !== undefined) updateData.total = data.total;
      if (data.tax !== undefined) updateData.tax = data.tax;
      if (data.shipping !== undefined) updateData.shipping = data.shipping;
      if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
      if (data.notes !== undefined) updateData.notes = data.notes;
      
      // Always update address IDs if they changed
      updateData.shippingAddressId = shippingAddressId;
      updateData.billingAddressId = billingAddressId;

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              url: true,
            },
          },
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          shippingAddress: true,
          billingAddress: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });

      return this.formatOrderResponse(updatedOrder);
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  /**
   * Delete order
   */
  async deleteOrder(id: string): Promise<void> {
    try {
      const existingOrder = await prisma.order.findUnique({
        where: { id },
        include: {
          shippingAddress: true,
          billingAddress: true,
        },
      });

      if (!existingOrder) {
        throw new Error(`Order with ID ${id} not found`);
      }

      // Delete order (items will be deleted by cascade)
      await prisma.order.delete({
        where: { id },
      });

      // Clean up addresses if they exist
      if (existingOrder.shippingAddressId) {
        await prisma.address.delete({
          where: { id: existingOrder.shippingAddressId },
        }).catch(() => {
          // Address might be referenced by other orders, ignore error
        });
      }

      if (existingOrder.billingAddressId && 
          existingOrder.billingAddressId !== existingOrder.shippingAddressId) {
        await prisma.address.delete({
          where: { id: existingOrder.billingAddressId },
        }).catch(() => {
          // Address might be referenced by other orders, ignore error
        });
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStats(storeId?: string): Promise<OrderStatsResponse> {
    try {
      const where = storeId ? { storeId } : {};

      const [totalOrders, totalRevenueResult, statusBreakdown, recentOrders] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.aggregate({
          where,
          _sum: { total: true },
        }),
        prisma.order.groupBy({
          by: ['status'],
          where,
          _count: { status: true },
        }),
        prisma.order.findMany({
          where,
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            store: {
              select: {
                id: true,
                name: true,
                url: true,
              },
            },
            customer: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      const totalRevenue = totalRevenueResult._sum.total?.toNumber() || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const statusBreakdownMap: Record<OrderStatus, number> = {
        PENDING: 0,
        PROCESSING: 0,
        COMPLETED: 0,
        CANCELLED: 0,
        REFUNDED: 0,
        ON_HOLD: 0,
        SHIPPED: 0,
      };

      statusBreakdown.forEach(item => {
        statusBreakdownMap[item.status] = item._count.status;
      });

      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        statusBreakdown: statusBreakdownMap,
        recentOrders: recentOrders.map(order => this.formatOrderResponse(order)),
      };
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  }

  /**
   * Format order response
   */
  private formatOrderResponse(order: any): OrderResponse {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      storeId: order.storeId,
      store: order.store,
      customerId: order.customerId,
      customer: order.customer,
      status: order.status,
      total: order.total.toNumber(),
      tax: order.tax?.toNumber(),
      shipping: order.shipping?.toNumber(),
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      items: order.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        price: item.price.toNumber(),
        quantity: item.quantity,
        total: item.total.toNumber(),
        product: item.product,
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}

export const orderService = new OrderService();
