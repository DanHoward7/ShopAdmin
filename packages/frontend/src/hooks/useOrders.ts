import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrdersAPI, orderKeys } from '@/lib/orders-api';
import type {
  Order,
  OrderQueryParams,
  OrderStats,
  OrderStatus,
} from '@/types/api';

// Get all orders with filtering and pagination
export const useOrders = (params: OrderQueryParams = {}) => {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => OrdersAPI.getOrders(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get a single order by ID
export const useOrder = (id: string) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => OrdersAPI.getOrderById(id),
    enabled: !!id,
  });
};

// Create a new order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData: any) => OrdersAPI.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
};

// Get order statistics
export const useOrderStats = (storeId?: string) => {
  return useQuery({
    queryKey: orderKeys.stats(storeId),
    queryFn: () => OrdersAPI.getOrderStats(storeId),
    staleTime: 60 * 1000, // 1 minute
  });
};

// Get order status history
export const useOrderHistory = (id: string) => {
  return useQuery({
    queryKey: orderKeys.history(id),
    queryFn: () => OrdersAPI.getOrderHistory(id),
    enabled: !!id,
  });
};

// Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: OrderStatus; notes?: string }) =>
      OrdersAPI.updateOrderStatus(id, status, notes),
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
    },
  });
};

// Update order details
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Pick<Order, 'notes' | 'paymentMethod'>> }) =>
      OrdersAPI.updateOrder(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
    },
  });
};

// Delete an order
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => OrdersAPI.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
};

// Bulk update order status
export const useBulkUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderIds, status, notes }: { orderIds: string[]; status: OrderStatus; notes?: string }) =>
      OrdersAPI.bulkUpdateStatus(orderIds, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
};

// Search orders
export const useSearchOrders = (query: string) => {
  return useQuery({
    queryKey: ['orders', 'search', query],
    queryFn: () => OrdersAPI.searchOrders(query),
    enabled: query.length > 2, // Only search if query is longer than 2 characters
    staleTime: 30 * 1000,
  });
};

// Export orders
export const useExportOrders = () => {
  return useMutation({
    mutationFn: (params: OrderQueryParams) => OrdersAPI.exportOrders(params),
  });
};
