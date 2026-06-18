import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

// Zod schemas for validation
export const OrderStatusSchema = z.nativeEnum(OrderStatus);

export const AddressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

export const OrderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product name is required'),
  price: z.number().positive('Price must be positive'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  total: z.number().positive('Total must be positive'),
});

export const CreateOrderSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
  storeId: z.string().min(1, 'Store ID is required'),
  customerId: z.string().optional(),
  status: OrderStatusSchema.default(OrderStatus.PENDING),
  total: z.number().positive('Total must be positive'),
  tax: z.number().min(0, 'Tax cannot be negative').optional(),
  shipping: z.number().min(0, 'Shipping cannot be negative').optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  shippingAddress: AddressSchema.optional(),
  billingAddress: AddressSchema.optional(),
  items: z.array(OrderItemSchema).min(1, 'At least one item is required'),
});

export const UpdateOrderSchema = z.object({
  orderNumber: z.string().min(1).optional(),
  status: OrderStatusSchema.optional(),
  total: z.number().positive().optional(),
  tax: z.number().min(0).optional(),
  shipping: z.number().min(0).optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  shippingAddress: AddressSchema.optional(),
  billingAddress: AddressSchema.optional(),
  items: z.array(OrderItemSchema).optional(),
});

export const OrderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  storeId: z.string().optional(),
  status: OrderStatusSchema.optional(),
  customerId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'total', 'orderNumber']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// TypeScript types derived from schemas
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;
export type OrderQuery = z.infer<typeof OrderQuerySchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Address = z.infer<typeof AddressSchema>;

// Response types
export interface OrderResponse {
  id: string;
  orderNumber: string;
  storeId: string;
  store: {
    id: string;
    name: string;
    url: string;
  };
  customerId?: string;
  customer?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  status: OrderStatus;
  total: number;
  tax?: number;
  shipping?: number;
  paymentMethod?: string;
  notes?: string;
  shippingAddress?: Address & { id: string };
  billingAddress?: Address & { id: string };
  items: Array<{
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
    product: {
      id: string;
      name: string;
      sku?: string;
      imageUrl?: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  orders: OrderResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    storeId?: string;
    status?: OrderStatus;
    customerId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export interface OrderStatsResponse {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  statusBreakdown: Record<OrderStatus, number>;
  recentOrders: OrderResponse[];
}
