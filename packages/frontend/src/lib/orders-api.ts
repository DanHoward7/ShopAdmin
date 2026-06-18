import api from './api';
import type {
  Order,
  OrderQueryParams,
  OrderStats,
  PaginatedResponse,
  ApiResponse,
  OrderStatus,
} from '@/types/api';

export class OrdersAPI {
  /**
   * Get paginated list of orders with filtering
   */
  static async getOrders(params: OrderQueryParams = {}): Promise<PaginatedResponse<Order>> {
    const response = await api.get('/orders', { params });
    return response.data;
  }

  /**
   * Get order by ID
   */
  static async getOrderById(id: string): Promise<ApiResponse<Order>> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  }

  /**
   * Create a new order
   */
  static async createOrder(orderData: any): Promise<ApiResponse<Order>> {
    const response = await api.post('/orders', orderData);
    return response.data;
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    id: string, 
    status: OrderStatus,
    notes?: string
  ): Promise<ApiResponse<Order>> {
    const response = await api.put(`/orders/${id}/status`, { status, notes });
    return response.data;
  }

  /**
   * Update order details
   */
  static async updateOrder(
    id: string,
    updates: Partial<Pick<Order, 'notes' | 'paymentMethod'>>
  ): Promise<ApiResponse<Order>> {
    const response = await api.put(`/orders/${id}`, updates);
    return response.data;
  }

  /**
   * Delete order
   */
  static async deleteOrder(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  }

  /**
   * Get order statistics
   */
  static async getOrderStats(storeId?: string): Promise<ApiResponse<OrderStats>> {
    const params = storeId ? { storeId } : {};
    const response = await api.get('/orders/stats', { params });
    return response.data;
  }

  /**
   * Export orders to CSV
   */
  static async exportOrders(params: OrderQueryParams = {}): Promise<Blob> {
    const response = await api.get('/orders/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Get order status history
   */
  static async getOrderHistory(id: string): Promise<ApiResponse<any[]>> {
    const response = await api.get(`/orders/${id}/history`);
    return response.data;
  }

  /**
   * Bulk update order status
   */
  static async bulkUpdateStatus(
    orderIds: string[],
    status: OrderStatus,
    notes?: string
  ): Promise<ApiResponse<{ updated: number; failed: string[] }>> {
    const response = await api.put('/orders/bulk/status', {
      orderIds,
      status,
      notes,
    });
    return response.data;
  }

  /**
   * Search orders by order number or customer email
   */
  static async searchOrders(query: string): Promise<ApiResponse<Order[]>> {
    const response = await api.get('/orders/search', {
      params: { q: query },
    });
    return response.data;
  }
}

// React Query keys for caching
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrderQueryParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  stats: (storeId?: string) => [...orderKeys.all, 'stats', storeId] as const,
  history: (id: string) => [...orderKeys.all, 'history', id] as const,
};
