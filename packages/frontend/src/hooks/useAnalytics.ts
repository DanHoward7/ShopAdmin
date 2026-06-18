import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnalyticsAPI, MockAnalyticsAPI } from '@/services/analyticsAPI'
import type { 
  AnalyticsDashboard, 
  AnalyticsPeriod, 
  ReportFilter,
  CustomReport,
  ExportOptions 
} from '@/types/analytics'

// Use mock API for development
const analyticsAPI = process.env.NODE_ENV === 'development' ? MockAnalyticsAPI : AnalyticsAPI

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: (period: AnalyticsPeriod) => [...analyticsKeys.all, 'dashboard', period] as const,
  realtime: () => [...analyticsKeys.all, 'realtime'] as const,
  performance: () => [...analyticsKeys.all, 'performance'] as const,
  reports: () => [...analyticsKeys.all, 'reports'] as const,
  filtered: (filters: ReportFilter) => [...analyticsKeys.all, 'filtered', filters] as const,
}

// Dashboard analytics hook
export function useAnalyticsDashboard(period: AnalyticsPeriod) {
  return useQuery({
    queryKey: analyticsKeys.dashboard(period),
    queryFn: () => analyticsAPI.getDashboardAnalytics(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  })
}

// Real-time metrics hook
export function useRealTimeMetrics() {
  return useQuery({
    queryKey: analyticsKeys.realtime(),
    queryFn: () => analyticsAPI.getRealTimeMetrics(),
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 0, // Always fresh
  })
}

// Performance metrics hook
export function usePerformanceMetrics() {
  return useQuery({
    queryKey: analyticsKeys.performance(),
    queryFn: () => analyticsAPI.getPerformanceMetrics(),
    refetchInterval: 60 * 1000, // 1 minute
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Filtered analytics hook
export function useFilteredAnalytics(filters: ReportFilter) {
  return useQuery({
    queryKey: analyticsKeys.filtered(filters),
    queryFn: () => analyticsAPI.getFilteredAnalytics(filters),
    enabled: !!filters.dateRange,
    staleTime: 5 * 60 * 1000,
  })
}

// Custom reports hook
export function useCustomReports() {
  return useQuery({
    queryKey: analyticsKeys.reports(),
    queryFn: () => analyticsAPI.getCustomReports(),
    staleTime: 10 * 60 * 1000,
  })
}

// Export analytics mutation
export function useExportAnalytics() {
  return useMutation({
    mutationFn: async (options: ExportOptions) => {
      const blob = await analyticsAPI.exportAnalytics(options)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      const filename = `analytics-${options.format}-${new Date().toISOString().split('T')[0]}.${options.format}`
      link.download = filename
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return { success: true, filename }
    },
  })
}

// Custom report mutations
export function useCreateCustomReport() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (report: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>) =>
      analyticsAPI.createCustomReport(report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.reports() })
    },
  })
}

export function useUpdateCustomReport() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, report }: { id: string; report: Partial<CustomReport> }) =>
      analyticsAPI.updateCustomReport(id, report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.reports() })
    },
  })
}

export function useDeleteCustomReport() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => analyticsAPI.deleteCustomReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.reports() })
    },
  })
}

// Utility hooks
export function useAnalyticsPeriods() {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)
  
  const lastMonth = new Date(today)
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  
  const lastQuarter = new Date(today)
  lastQuarter.setMonth(lastQuarter.getMonth() - 3)
  
  const lastYear = new Date(today)
  lastYear.setFullYear(lastYear.getFullYear() - 1)

  return {
    today: { start: today, end: today, label: 'Today' },
    yesterday: { start: yesterday, end: yesterday, label: 'Yesterday' },
    last7Days: { start: lastWeek, end: today, label: 'Last 7 Days' },
    last30Days: { start: lastMonth, end: today, label: 'Last 30 Days' },
    last3Months: { start: lastQuarter, end: today, label: 'Last 3 Months' },
    lastYear: { start: lastYear, end: today, label: 'Last Year' },
  }
}
