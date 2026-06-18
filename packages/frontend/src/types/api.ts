// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  orders?: T[]; // Backend returns 'orders' for order endpoints
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: any;
}

// Order Types
export type OrderStatus = 
  | 'PENDING'
  | 'PROCESSING' 
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'ON_HOLD';

export interface Order {
  id: string;
  orderNumber: string;
  storeId: string;
  customerId: string;
  status: OrderStatus;
  total: number;
  tax?: number;
  shipping?: number;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  store: Store;
  customer: Customer;
  items: OrderItem[];
  shippingAddress?: Address;
  billingAddress?: Address;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

// Store Types
export type StoreStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export interface Store {
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
  apiKey?: string;
  createdAt: string;
  updatedAt: string;
}

// Query Parameters
export interface OrderFilters {
  status?: OrderStatus;
  storeId?: string;
  customerId?: string;
  orderNumber?: string;
  startDate?: string;
  endDate?: string;
  minTotal?: number;
  maxTotal?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface OrderQueryParams extends OrderFilters, PaginationParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Statistics Types
export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
  averageOrderValue: number;
}
