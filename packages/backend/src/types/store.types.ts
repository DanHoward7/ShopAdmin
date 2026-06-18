import { z } from 'zod';
import { StoreStatus, RegistrationStatus } from '@prisma/client';

// Store Registration Types
export const StoreRegistrationSchema = z.object({
  storeName: z.string().min(1, 'Store name is required').max(100),
  storeUrl: z.string().url('Valid URL is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().optional(),
  description: z.string().max(500).optional(),
  businessType: z.string().max(50).optional(),
  expectedVolume: z.enum(['1-100', '100-1000', '1000-10000', '10000+']).optional(),
});

export const StoreRegistrationUpdateSchema = z.object({
  status: z.nativeEnum(RegistrationStatus),
  reviewNotes: z.string().max(1000).optional(),
  reviewedBy: z.string().optional(),
});

// Store Management Types
export const StoreCreateSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(100),
  url: z.string().url('Valid URL is required'),
  description: z.string().max(500).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  timezone: z.string().default('UTC'),
  currency: z.string().length(3).default('USD'),
  status: z.nativeEnum(StoreStatus).default(StoreStatus.PENDING),
});

export const StoreUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  description: z.string().max(500).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().length(3).optional(),
  status: z.nativeEnum(StoreStatus).optional(),
  isActive: z.boolean().optional(),
});

// API Key Management Types
export const ApiKeyCreateSchema = z.object({
  name: z.string().min(1, 'API key name is required').max(100),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  expiresAt: z.string().datetime().optional(),
});

export const ApiKeyUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().optional(),
});

// Store Configuration Types
export const StoreConfigSchema = z.object({
  webhookUrl: z.string().url().optional(),
  webhookSecret: z.string().min(16).optional(),
  orderSyncEnabled: z.boolean().default(true),
  productSyncEnabled: z.boolean().default(false),
  customerSyncEnabled: z.boolean().default(false),
  syncFrequency: z.number().min(60).max(3600).default(300), // 1 minute to 1 hour
  maxOrdersPerSync: z.number().min(1).max(1000).default(100),
  retryAttempts: z.number().min(0).max(10).default(3),
  notificationSettings: z.record(z.any()).optional(),
  customFields: z.record(z.any()).optional(),
});

// Query Types
export const StoreQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.nativeEnum(StoreStatus).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const RegistrationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.nativeEnum(RegistrationStatus).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['storeName', 'submittedAt', 'status']).default('submittedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Input/Output Types
export type StoreRegistrationInput = z.infer<typeof StoreRegistrationSchema>;
export type StoreRegistrationUpdateInput = z.infer<typeof StoreRegistrationUpdateSchema>;
export type StoreCreateInput = z.infer<typeof StoreCreateSchema>;
export type StoreUpdateInput = z.infer<typeof StoreUpdateSchema>;
export type ApiKeyCreateInput = z.infer<typeof ApiKeyCreateSchema>;
export type ApiKeyUpdateInput = z.infer<typeof ApiKeyUpdateSchema>;
export type StoreConfigInput = z.infer<typeof StoreConfigSchema>;
export type StoreQuery = z.infer<typeof StoreQuerySchema>;
export type RegistrationQuery = z.infer<typeof RegistrationQuerySchema>;

// Response Types
export interface StoreResponse {
  id: string;
  name: string;
  url: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  timezone: string;
  currency: string;
  status: StoreStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    orders: number;
    products: number;
    customers: number;
    apiKeys: number;
  };
}

export interface StoreListResponse {
  stores: StoreResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    status?: StoreStatus;
    search?: string;
  };
}

export interface ApiKeyResponse {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  isActive: boolean;
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface ApiKeyCreateResponse extends ApiKeyResponse {
  apiKey: string; // Only returned on creation
}

export interface StoreRegistrationResponse {
  id: string;
  storeName: string;
  storeUrl: string;
  contactEmail: string;
  contactPhone?: string;
  description?: string;
  businessType?: string;
  expectedVolume?: string;
  status: RegistrationStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  storeId?: string;
}

export interface StoreRegistrationListResponse {
  registrations: StoreRegistrationResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    status?: RegistrationStatus;
    search?: string;
  };
}

export interface StoreConfigResponse {
  id: string;
  storeId: string;
  webhookUrl?: string;
  orderSyncEnabled: boolean;
  productSyncEnabled: boolean;
  customerSyncEnabled: boolean;
  syncFrequency: number;
  maxOrdersPerSync: number;
  retryAttempts: number;
  notificationSettings?: Record<string, any>;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Permission constants
export const API_PERMISSIONS = {
  ORDERS_READ: 'orders:read',
  ORDERS_WRITE: 'orders:write',
  PRODUCTS_READ: 'products:read',
  PRODUCTS_WRITE: 'products:write',
  CUSTOMERS_READ: 'customers:read',
  CUSTOMERS_WRITE: 'customers:write',
  WEBHOOKS_MANAGE: 'webhooks:manage',
  STORE_READ: 'store:read',
  STORE_WRITE: 'store:write',
} as const;

export const PERMISSION_GROUPS = {
  READ_ONLY: [
    API_PERMISSIONS.ORDERS_READ,
    API_PERMISSIONS.PRODUCTS_READ,
    API_PERMISSIONS.CUSTOMERS_READ,
    API_PERMISSIONS.STORE_READ,
  ],
  FULL_ACCESS: [
    API_PERMISSIONS.ORDERS_READ,
    API_PERMISSIONS.ORDERS_WRITE,
    API_PERMISSIONS.PRODUCTS_READ,
    API_PERMISSIONS.PRODUCTS_WRITE,
    API_PERMISSIONS.CUSTOMERS_READ,
    API_PERMISSIONS.CUSTOMERS_WRITE,
    API_PERMISSIONS.WEBHOOKS_MANAGE,
    API_PERMISSIONS.STORE_READ,
    API_PERMISSIONS.STORE_WRITE,
  ],
} as const;
