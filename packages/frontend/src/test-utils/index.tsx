import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  })

  return (
    <ChakraProvider value={defaultSystem}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ChakraProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock data generators
export const mockAnalyticsData = {
  period: {
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31'),
    label: 'January 2024'
  },
  revenue: {
    totalRevenue: 125430.50,
    previousRevenue: 98750.25,
    revenueGrowth: 27.0,
    averageOrderValue: 89.75,
    totalOrders: 1398,
    conversionRate: 3.2
  },
  orders: {
    totalOrders: 1398,
    pendingOrders: 45,
    processingOrders: 123,
    deliveredOrders: 1156,
    cancelledOrders: 74,
    ordersByStatus: [
      { status: 'delivered', count: 1156, percentage: 82.7 },
      { status: 'processing', count: 123, percentage: 8.8 },
      { status: 'cancelled', count: 74, percentage: 5.3 },
      { status: 'pending', count: 45, percentage: 3.2 }
    ]
  },
  products: {
    totalProducts: 342,
    lowStockProducts: 23,
    outOfStockProducts: 8,
    topSellingProducts: [
      { id: '1', name: 'Wireless Headphones', sales: 156, revenue: 15600 },
      { id: '2', name: 'Smart Watch', sales: 134, revenue: 26800 }
    ],
    categoryPerformance: [
      { category: 'Electronics', sales: 456, revenue: 45600 },
      { category: 'Accessories', sales: 234, revenue: 11700 }
    ]
  },
  stores: {
    totalStores: 8,
    activeStores: 7,
    storePerformance: [
      { storeId: '1', storeName: 'Main Store', orders: 456, revenue: 45600, growth: 12.5 },
      { storeId: '2', storeName: 'Online Shop', orders: 389, revenue: 38900, growth: 8.3 }
    ]
  },
  customers: {
    totalCustomers: 2456,
    newCustomers: 234,
    returningCustomers: 1164,
    customerRetentionRate: 68.5,
    averageCustomerValue: 156.78,
    customersByRegion: [
      { region: 'North America', count: 1234 },
      { region: 'Europe', count: 789 }
    ]
  },
  charts: {
    revenueOverTime: [{
      name: 'Revenue',
      data: [
        { date: '2024-01-01', value: 2500 },
        { date: '2024-01-02', value: 3200 },
        { date: '2024-01-03', value: 2800 }
      ],
      color: '#3182CE'
    }],
    ordersOverTime: [{
      name: 'Orders',
      data: [
        { date: '2024-01-01', value: 25 },
        { date: '2024-01-02', value: 32 },
        { date: '2024-01-03', value: 28 }
      ],
      color: '#38A169'
    }],
    topProducts: [
      { date: 'Wireless Headphones', value: 156, label: 'Electronics' },
      { date: 'Smart Watch', value: 134, label: 'Electronics' }
    ],
    storeComparison: [
      { date: 'Main Store', value: 45600, label: 'Revenue' },
      { date: 'Online Shop', value: 38900, label: 'Revenue' }
    ]
  }
}

export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'admin' as const
}

export const mockOrder = {
  id: '1',
  orderNumber: 'ORD-001',
  status: 'delivered' as const,
  total: 99.99,
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  createdAt: new Date('2024-01-01'),
  items: [
    {
      id: '1',
      name: 'Test Product',
      quantity: 2,
      price: 49.99
    }
  ]
}

export const mockStore = {
  id: '1',
  name: 'Test Store',
  url: 'https://teststore.com',
  apiKey: 'test-api-key',
  isActive: true,
  createdAt: new Date('2024-01-01')
}
