import api from '@/lib/api'
import type {
  Customer,
  CustomerDetails,
  CustomersListResponse,
  CustomerDetailsResponse,
  UpdateCustomerData,
} from '@/types/customer'

export const customerAPI = {
  // Get all customers with pagination and filtering
  getCustomers: async (params?: {
    page?: number
    limit?: number
    search?: string
    storeId?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<CustomersListResponse> => {
    const response = await api.get('/customers', { params })
    return response.data
  },

  // Get single customer by ID
  getCustomer: async (id: string): Promise<CustomerDetailsResponse> => {
    const response = await api.get(`/customers/${id}`)
    return response.data
  },

  // Update customer
  updateCustomer: async (
    id: string,
    data: UpdateCustomerData
  ): Promise<{ success: boolean; data: Customer }> => {
    const response = await api.put(`/customers/${id}`, data)
    return response.data
  },

  // Delete customer
  deleteCustomer: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/customers/${id}`)
    return response.data
  },
}
