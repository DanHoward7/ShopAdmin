export interface AnalyticsMetric {
  id: string
  name: string
  value: number
  previousValue?: number
  change?: number
  changePercent?: number
  trend: 'up' | 'down' | 'stable'
  format: 'number' | 'currency' | 'percentage'
  icon?: string
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
  category?: string
}

export interface TimeSeriesData {
  name: string
  data: ChartDataPoint[]
  color?: string
}

export interface AnalyticsPeriod {
  start: Date
  end: Date
  label: string
}

export interface RevenueMetrics {
  totalRevenue: number
  previousRevenue: number
  revenueGrowth: number
  averageOrderValue: number
  totalOrders: number
  conversionRate: number
}

export interface OrderMetrics {
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  deliveredOrders: number
  cancelledOrders: number
  ordersByStatus: { status: string; count: number; percentage: number }[]
}

export interface ProductMetrics {
  totalProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  topSellingProducts: { id: string; name: string; sales: number; revenue: number }[]
  categoryPerformance: { category: string; sales: number; revenue: number }[]
}

export interface StoreMetrics {
  totalStores: number
  activeStores: number
  storePerformance: {
    storeId: string
    storeName: string
    orders: number
    revenue: number
    growth: number
  }[]
}

export interface CustomerMetrics {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  customerRetentionRate: number
  averageCustomerValue: number
  customersByRegion: { region: string; count: number }[]
}

export interface AnalyticsDashboard {
  period: AnalyticsPeriod
  revenue: RevenueMetrics
  orders: OrderMetrics
  products: ProductMetrics
  stores: StoreMetrics
  customers: CustomerMetrics
  charts: {
    revenueOverTime: TimeSeriesData[]
    ordersOverTime: TimeSeriesData[]
    topProducts: ChartDataPoint[]
    storeComparison: ChartDataPoint[]
  }
}

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel'
  dateRange: AnalyticsPeriod
  metrics: string[]
  includeCharts?: boolean
}

export interface ReportFilter {
  dateRange: AnalyticsPeriod
  stores?: string[]
  categories?: string[]
  status?: string[]
  customers?: string[]
}

export interface CustomReport {
  id: string
  name: string
  description: string
  filters: ReportFilter
  metrics: string[]
  chartTypes: string[]
  createdAt: Date
  updatedAt: Date
}
