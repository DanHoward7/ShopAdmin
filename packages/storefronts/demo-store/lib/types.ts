// TypeScript types for the demo store

export interface Product {
  id: string
  name: string
  description?: string | null
  price: number | string  // Backend returns Decimal as string
  stock: number
  imageUrl?: string | null
  sku?: string | null
  category?: string | null
  storeId: string
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface OrderData {
  orderNumber: string
  storeId: string
  customerId?: string
  items: Array<{
    productId: string
    name: string
    price: number
    quantity: number
    total: number
  }>
  total: number
  shippingAddress: {
    line1: string
    city: string
    postalCode: string
    country: string
  }
  paymentMethod?: string
  notes?: string
}

export interface OrderResponse {
  success: boolean
  data?: {
    id: string
    orderNumber: string
    total: number
    status: string
  }
  error?: string
}
