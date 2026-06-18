import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAnalyticsDashboard, useAnalyticsPeriods, useExportAnalytics } from './useAnalytics'
import { MockAnalyticsAPI } from '@/services/analyticsAPI'
import { mockAnalyticsData } from '@/test-utils'

// Mock the analytics API
jest.mock('@/services/analyticsAPI', () => ({
  MockAnalyticsAPI: {
    getDashboardAnalytics: jest.fn(),
    getRealTimeMetrics: jest.fn(),
    getPerformanceMetrics: jest.fn(),
    getFilteredAnalytics: jest.fn(),
    exportAnalytics: jest.fn(),
    getCustomReports: jest.fn(),
    createCustomReport: jest.fn(),
    updateCustomReport: jest.fn(),
    deleteCustomReport: jest.fn(),
    runCustomReport: jest.fn(),
  }
}))

const mockGetDashboardAnalytics = MockAnalyticsAPI.getDashboardAnalytics as jest.MockedFunction<typeof MockAnalyticsAPI.getDashboardAnalytics>
const mockExportAnalytics = MockAnalyticsAPI.exportAnalytics as jest.MockedFunction<typeof MockAnalyticsAPI.exportAnalytics>

describe('useAnalytics hooks', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
          gcTime: 0,
        },
      },
    })
    jest.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  describe('useAnalyticsDashboard', () => {
    it('fetches analytics dashboard data successfully', async () => {
      mockGetDashboardAnalytics.mockResolvedValue(mockAnalyticsData)

      const { result } = renderHook(
        () => useAnalyticsDashboard(mockAnalyticsData.period),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockAnalyticsData)
      expect(mockGetDashboardAnalytics).toHaveBeenCalledWith(
        mockAnalyticsData.period
      )
    })

    it('handles error state correctly', async () => {
      const error = new Error('Failed to fetch analytics')
      mockGetDashboardAnalytics.mockRejectedValue(error)

      const { result } = renderHook(
        () => useAnalyticsDashboard(mockAnalyticsData.period),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })

    it('shows loading state initially', () => {
      mockGetDashboardAnalytics.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const { result } = renderHook(
        () => useAnalyticsDashboard(mockAnalyticsData.period),
        { wrapper }
      )

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()
    })
  })

  describe('useAnalyticsPeriods', () => {
    it('returns predefined periods', () => {
      const { result } = renderHook(() => useAnalyticsPeriods())

      expect(result.current).toHaveProperty('today')
      expect(result.current).toHaveProperty('yesterday')
      expect(result.current).toHaveProperty('last7Days')
      expect(result.current).toHaveProperty('last30Days')
      expect(result.current).toHaveProperty('last3Months')
      expect(result.current).toHaveProperty('lastYear')

      // Check that periods have correct structure
      expect(result.current.today).toHaveProperty('start')
      expect(result.current.today).toHaveProperty('end')
      expect(result.current.today).toHaveProperty('label', 'Today')
    })

    it('generates correct date ranges', () => {
      const { result } = renderHook(() => useAnalyticsPeriods())

      const today = new Date()
      const todayPeriod = result.current.today

      // Check that today period has same date for start and end
      expect(todayPeriod.start.toDateString()).toBe(today.toDateString())
      expect(todayPeriod.end.toDateString()).toBe(today.toDateString())

      // Check that last7Days has correct range
      const last7Days = result.current.last7Days
      const daysDiff = Math.ceil(
        (last7Days.end.getTime() - last7Days.start.getTime()) / (1000 * 60 * 60 * 24)
      )
      expect(daysDiff).toBe(7)
    })
  })

  describe('useExportAnalytics', () => {
    it('creates download link when export succeeds', async () => {
      const mockBlob = new Blob(['test data'], { type: 'text/csv' })
      mockExportAnalytics.mockResolvedValue(mockBlob)

      // Mock DOM methods
      const mockCreateElement = jest.spyOn(document, 'createElement')
      const mockAppendChild = jest.spyOn(document.body, 'appendChild')
      const mockRemoveChild = jest.spyOn(document.body, 'removeChild')
      const mockCreateObjectURL = jest.spyOn(URL, 'createObjectURL')
      const mockRevokeObjectURL = jest.spyOn(URL, 'revokeObjectURL')

      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
        style: { visibility: '' }
      } as any

      mockCreateElement.mockReturnValue(mockLink)
      mockCreateObjectURL.mockReturnValue('mock-url')

      const { result } = renderHook(() => useExportAnalytics(), { wrapper })

      const exportOptions = {
        format: 'csv' as const,
        dateRange: mockAnalyticsData.period,
        metrics: ['revenue', 'orders']
      }

      result.current.mutate(exportOptions)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockExportAnalytics).toHaveBeenCalledWith(exportOptions)
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob)
      expect(mockLink.click).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url')

      // Cleanup mocks
      mockCreateElement.mockRestore()
      mockAppendChild.mockRestore()
      mockRemoveChild.mockRestore()
      mockCreateObjectURL.mockRestore()
      mockRevokeObjectURL.mockRestore()
    })

    it('handles export error correctly', async () => {
      const error = new Error('Export failed')
      mockExportAnalytics.mockRejectedValue(error)

      const { result } = renderHook(() => useExportAnalytics(), { wrapper })

      const exportOptions = {
        format: 'csv' as const,
        dateRange: mockAnalyticsData.period,
        metrics: ['revenue']
      }

      result.current.mutate(exportOptions)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })
  })
})
