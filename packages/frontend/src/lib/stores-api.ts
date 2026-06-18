import api from './api';
import type {
  Store,
  ApiResponse,
  PaginatedResponse,
  StoreStatus,
} from '@/types/api';

export interface StoreQueryParams {
  page?: number;
  limit?: number;
  status?: StoreStatus;
  name?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateStoreData {
  name: string;
  url: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  timezone: string;
  currency: string;
}

export interface UpdateStoreData extends Partial<CreateStoreData> {
  status?: StoreStatus;
  isActive?: boolean;
}

export class StoresAPI {
  /**
   * Get paginated list of stores with filtering
   */
  static async getStores(params: StoreQueryParams = {}): Promise<PaginatedResponse<Store>> {
    const response = await api.get('/stores', { params });
    return response.data;
  }

  /**
   * Get store by ID
   */
  static async getStoreById(id: string): Promise<ApiResponse<Store>> {
    const response = await api.get(`/stores/${id}`);
    return response.data;
  }

  /**
   * Create new store
   */
  static async createStore(data: CreateStoreData): Promise<ApiResponse<Store>> {
    const response = await api.post('/stores', data);
    return response.data;
  }

  /**
   * Update store
   */
  static async updateStore(id: string, data: UpdateStoreData): Promise<ApiResponse<Store>> {
    const response = await api.put(`/stores/${id}`, data);
    return response.data;
  }

  /**
   * Delete store
   */
  static async deleteStore(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/stores/${id}`);
    return response.data;
  }

  /**
   * Generate new API key for store
   */
  static async generateApiKey(id: string): Promise<ApiResponse<{ apiKey: string }>> {
    const response = await api.post(`/stores/${id}/api-key`);
    return response.data;
  }

  /**
   * Rotate API key for store
   */
  static async rotateApiKey(id: string): Promise<ApiResponse<{ apiKey: string }>> {
    const response = await api.put(`/stores/${id}/api-key`);
    return response.data;
  }

  /**
   * Test store connection
   */
  static async testConnection(id: string): Promise<ApiResponse<{ status: string; message: string }>> {
    const response = await api.post(`/stores/${id}/test-connection`);
    return response.data;
  }

  /**
   * Get store statistics
   */
  static async getStoreStats(id: string): Promise<ApiResponse<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    lastSyncAt: string;
  }>> {
    const response = await api.get(`/stores/${id}/stats`);
    return response.data;
  }
}

// React Query keys for caching
export const storeKeys = {
  all: ['stores'] as const,
  lists: () => [...storeKeys.all, 'list'] as const,
  list: (params: StoreQueryParams) => [...storeKeys.lists(), params] as const,
  details: () => [...storeKeys.all, 'detail'] as const,
  detail: (id: string) => [...storeKeys.details(), id] as const,
  stats: (id: string) => [...storeKeys.detail(id), 'stats'] as const,
};
