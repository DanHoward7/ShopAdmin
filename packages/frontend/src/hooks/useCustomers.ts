import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerAPI } from '@/services/customerAPI'
import type { UpdateCustomerData } from '@/types/customer'

// Query keys
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
}

// Get all customers with pagination and filtering
export const useCustomers = (params?: {
  page?: number
  limit?: number
  search?: string
  storeId?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) => {
  return useQuery({
    queryKey: customerKeys.list(params || {}),
    queryFn: () => customerAPI.getCustomers(params),
    staleTime: 30000, // 30 seconds
  })
}

// Get single customer by ID
export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerAPI.getCustomer(id),
    enabled: !!id,
    staleTime: 30000,
  })
}

// Update customer mutation
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerData }) =>
      customerAPI.updateCustomer(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}

// Delete customer mutation
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => customerAPI.deleteCustomer(id),
    onSuccess: () => {
      // Invalidate customer lists
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}
