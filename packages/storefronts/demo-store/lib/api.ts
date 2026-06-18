// API client for the demo store

import { Product, OrderData, OrderResponse } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || 'store-1'

export async function getProducts(): Promise<Product[]> {
  try {
    console.log('Fetching products from:', `${API_URL}/stores/${STORE_ID}/products`)
    const response = await fetch(`${API_URL}/stores/${STORE_ID}/products`)
    
    console.log('Response status:', response.status)
    
    if (!response.ok) {
      console.error('Response not OK:', response.status, response.statusText)
      return []
    }
    
    const data = await response.json()
    console.log('Received data:', data)
    
    // Handle both data.data and data.products response formats
    const products = data.data || data.products || []
    console.log('Parsed products:', products)
    
    return products
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return []
  }
}

export async function createOrder(orderData: OrderData): Promise<OrderResponse> {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to create order:', error)
    return {
      success: false,
      error: 'Failed to create order. Please try again.',
    }
  }
}
