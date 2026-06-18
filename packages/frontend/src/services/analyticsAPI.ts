import { apiClient } from './apiClient'
import type { 
  AnalyticsDashboard, 
  AnalyticsPeriod, 
  ReportFilter,
  CustomReport,
  ExportOptions 
} from '@/types/analytics'

export class AnalyticsAPI {
  // Get dashboard analytics data
  static async getDashboardAnalytics(period: AnalyticsPeriod): Promise<AnalyticsDashboard> {
    const response = await apiClient.get('/analytics/dashboard', {
      params: {
        startDate: period.start.toISOString(),
        endDate: period.end.toISOString()
      }
    })
    return response.data
  }

  // Get real-time metrics
  static async getRealTimeMetrics(): Promise<{
    activeUsers: number
    currentOrders: number
    todayRevenue: number
    systemHealth: 'healthy' | 'warning' | 'critical'
  }> {
    const response = await apiClient.get('/analytics/realtime')
    return response.data
  }

  // Get filtered analytics data
  static async getFilteredAnalytics(filters: ReportFilter): Promise<AnalyticsDashboard> {
    const response = await apiClient.post('/analytics/filtered', filters)
    return response.data
  }

  // Export analytics data
  static async exportAnalytics(options: ExportOptions): Promise<Blob> {
    const response = await apiClient.post('/analytics/export', options, {
      responseType: 'blob'
    })
    return response.data
  }

  // Custom reports
  static async getCustomReports(): Promise<CustomReport[]> {
    const response = await apiClient.get('/analytics/reports')
    return response.data
  }

  static async createCustomReport(report: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomReport> {
    const response = await apiClient.post('/analytics/reports', report)
    return response.data
  }

  static async updateCustomReport(id: string, report: Partial<CustomReport>): Promise<CustomReport> {
    const response = await apiClient.put(`/analytics/reports/${id}`, report)
    return response.data
  }

  static async deleteCustomReport(id: string): Promise<void> {
    await apiClient.delete(`/analytics/reports/${id}`)
  }

  static async runCustomReport(id: string): Promise<AnalyticsDashboard> {
    const response = await apiClient.get(`/analytics/reports/${id}/run`)
    return response.data
  }

  // Performance metrics
  static async getPerformanceMetrics(): Promise<{
    apiResponseTime: number
    databaseQueryTime: number
    errorRate: number
    uptime: number
    throughput: number
  }> {
    const response = await apiClient.get('/analytics/performance')
    return response.data
  }
}

// Mock data generator for development
export class MockAnalyticsAPI {
  static async getDashboardAnalytics(period: AnalyticsPeriod): Promise<AnalyticsDashboard> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const days = Math.ceil((period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24))
    
    return {
      period,
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
          { id: '2', name: 'Smart Watch', sales: 134, revenue: 26800 },
          { id: '3', name: 'Laptop Stand', sales: 98, revenue: 4900 },
          { id: '4', name: 'USB-C Cable', sales: 87, revenue: 1740 },
          { id: '5', name: 'Phone Case', sales: 76, revenue: 2280 }
        ],
        categoryPerformance: [
          { category: 'Electronics', sales: 456, revenue: 45600 },
          { category: 'Accessories', sales: 234, revenue: 11700 },
          { category: 'Home & Garden', sales: 189, revenue: 18900 },
          { category: 'Sports', sales: 123, revenue: 12300 }
        ]
      },
      stores: {
        totalStores: 8,
        activeStores: 7,
        storePerformance: [
          { storeId: '1', storeName: 'Main Store', orders: 456, revenue: 45600, growth: 12.5 },
          { storeId: '2', storeName: 'Online Shop', orders: 389, revenue: 38900, growth: 8.3 },
          { storeId: '3', storeName: 'Mobile Store', orders: 234, revenue: 23400, growth: -2.1 },
          { storeId: '4', storeName: 'Seasonal Store', orders: 189, revenue: 18900, growth: 15.7 }
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
          { region: 'Europe', count: 789 },
          { region: 'Asia', count: 345 },
          { region: 'Other', count: 88 }
        ]
      },
      charts: {
        revenueOverTime: [{
          name: 'Revenue',
          data: Array.from({ length: days }, (_, i) => ({
            date: new Date(period.start.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: Math.floor(Math.random() * 5000) + 2000
          })),
          color: '#3182CE'
        }],
        ordersOverTime: [{
          name: 'Orders',
          data: Array.from({ length: days }, (_, i) => ({
            date: new Date(period.start.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: Math.floor(Math.random() * 50) + 20
          })),
          color: '#38A169'
        }],
        topProducts: [
          { date: 'Wireless Headphones', value: 156, label: 'Electronics' },
          { date: 'Smart Watch', value: 134, label: 'Electronics' },
          { date: 'Laptop Stand', value: 98, label: 'Accessories' },
          { date: 'USB-C Cable', value: 87, label: 'Accessories' },
          { date: 'Phone Case', value: 76, label: 'Accessories' }
        ],
        storeComparison: [
          { date: 'Main Store', value: 45600, label: 'Revenue' },
          { date: 'Online Shop', value: 38900, label: 'Revenue' },
          { date: 'Mobile Store', value: 23400, label: 'Revenue' },
          { date: 'Seasonal Store', value: 18900, label: 'Revenue' }
        ]
      }
    }
  }

  static async getRealTimeMetrics() {
    await new Promise(resolve => setTimeout(resolve, 200))
    return {
      activeUsers: Math.floor(Math.random() * 100) + 50,
      currentOrders: Math.floor(Math.random() * 20) + 5,
      todayRevenue: Math.floor(Math.random() * 10000) + 5000,
      systemHealth: 'healthy' as const
    }
  }

  static async getPerformanceMetrics() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      apiResponseTime: Math.floor(Math.random() * 200) + 100,
      databaseQueryTime: Math.floor(Math.random() * 50) + 25,
      errorRate: Math.random() * 0.5,
      uptime: 99.9,
      throughput: Math.floor(Math.random() * 1000) + 500
    }
  }

  // Get filtered analytics data
  static async getFilteredAnalytics(filters: ReportFilter): Promise<AnalyticsDashboard> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // For mock, just return the same data as getDashboardAnalytics
    return this.getDashboardAnalytics(filters.dateRange)
  }

  // Export analytics data (mock - just return a blob)
  static async exportAnalytics(options: ExportOptions): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Create a mock CSV blob
    const csvContent = `Analytics Report
Period: ${options.dateRange.start.toDateString()} - ${options.dateRange.end.toDateString()}
Format: ${options.format}
Metrics: ${options.metrics.join(', ')}

This is mock export data for development.`
    
    return new Blob([csvContent], { type: 'text/csv' })
  }

  // Custom reports (mock data)
  static async getCustomReports(): Promise<CustomReport[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return [
      {
        id: '1',
        name: 'Monthly Revenue Report',
        description: 'Comprehensive monthly revenue analysis',
        filters: {
          dateRange: {
            start: new Date(2024, 0, 1),
            end: new Date(2024, 0, 31),
            label: 'January 2024'
          }
        },
        metrics: ['revenue', 'orders'],
        chartTypes: ['line', 'bar'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Store Performance Analysis',
        description: 'Compare performance across all stores',
        filters: {
          dateRange: {
            start: new Date(2024, 0, 1),
            end: new Date(2024, 2, 31),
            label: 'Q1 2024'
          }
        },
        metrics: ['stores', 'revenue', 'orders'],
        chartTypes: ['pie', 'bar'],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-15')
      }
    ]
  }

  static async createCustomReport(report: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomReport> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      ...report,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  static async updateCustomReport(id: string, report: Partial<CustomReport>): Promise<CustomReport> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock updated report
    return {
      id,
      name: report.name || 'Updated Report',
      description: report.description || 'Updated description',
      filters: report.filters || {
        dateRange: {
          start: new Date(),
          end: new Date(),
          label: 'Today'
        }
      },
      metrics: report.metrics || ['revenue'],
      chartTypes: report.chartTypes || ['line'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    }
  }

  static async deleteCustomReport(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))
    // Mock deletion - no return needed
  }

  static async runCustomReport(id: string): Promise<AnalyticsDashboard> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // For mock, return standard dashboard data
    const mockPeriod = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
      label: 'Last 30 Days'
    }
    
    return this.getDashboardAnalytics(mockPeriod)
  }
}
