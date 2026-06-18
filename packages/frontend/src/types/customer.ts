export interface Customer {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  storeId: string
  store: {
    id: string
    name: string
    url?: string
  }
  createdAt: string
  updatedAt: string
  totalOrders?: number
  totalSpent?: number
}

export interface CustomerDetails extends Customer {
  orders: Order[]
  stats: {
    totalOrders: number
    totalSpent: number
    averageOrderValue: number
  }
}

export interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  total: number
  product: {
    name: string
    imageUrl: string | null
  } | null
}

export interface CustomersListResponse {
  success: boolean
  data: Customer[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CustomerDetailsResponse {
  success: boolean
  data: CustomerDetails
}

export interface UpdateCustomerData {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}
