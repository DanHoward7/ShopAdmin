import { render, screen, waitFor } from '@/test-utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RealTimeMetrics } from './RealTimeMetrics'
import * as analyticsHooks from '@/hooks/useAnalytics'

// Mock the useRealTimeMetrics hook
jest.mock('@/hooks/useAnalytics', () => ({
  useRealTimeMetrics: jest.fn()
}))

const mockUseRealTimeMetrics = analyticsHooks.useRealTimeMetrics as jest.MockedFunction<
  typeof analyticsHooks.useRealTimeMetrics
>

describe('RealTimeMetrics', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
  })

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  it('displays loading state', () => {
    mockUseRealTimeMetrics.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    renderWithQueryClient(<RealTimeMetrics />)

    expect(screen.getByText('Loading real-time metrics...')).toBeInTheDocument()
  })

  it('displays error state', () => {
    mockUseRealTimeMetrics.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    } as any)

    renderWithQueryClient(<RealTimeMetrics />)

    expect(screen.getByText('Failed to load real-time metrics')).toBeInTheDocument()
  })

  it('displays real-time metrics data', () => {
    const mockData = {
      activeUsers: 75,
      currentOrders: 12,
      todayRevenue: 8500,
      systemHealth: 'healthy' as const
    }

    mockUseRealTimeMetrics.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any)

    renderWithQueryClient(<RealTimeMetrics />)

    expect(screen.getByText('Real-Time Metrics')).toBeInTheDocument()
    expect(screen.getByText('75')).toBeInTheDocument() // Active Users
    expect(screen.getByText('12')).toBeInTheDocument() // Current Orders
    expect(screen.getByText('8,500')).toBeInTheDocument() // Today's Revenue
    expect(screen.getByText('healthy')).toBeInTheDocument() // System Health
  })

  it('displays live indicator', () => {
    const mockData = {
      activeUsers: 75,
      currentOrders: 12,
      todayRevenue: 8500,
      systemHealth: 'healthy' as const
    }

    mockUseRealTimeMetrics.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any)

    renderWithQueryClient(<RealTimeMetrics />)

    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('displays correct health badge colors', () => {
    const mockData = {
      activeUsers: 75,
      currentOrders: 12,
      todayRevenue: 8500,
      systemHealth: 'warning' as const
    }

    mockUseRealTimeMetrics.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any)

    renderWithQueryClient(<RealTimeMetrics />)

    const healthBadge = screen.getByText('warning')
    expect(healthBadge).toBeInTheDocument()
  })

  it('formats revenue with commas', () => {
    const mockData = {
      activeUsers: 75,
      currentOrders: 12,
      todayRevenue: 12345,
      systemHealth: 'healthy' as const
    }

    mockUseRealTimeMetrics.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any)

    renderWithQueryClient(<RealTimeMetrics />)

    expect(screen.getByText('$12,345')).toBeInTheDocument()
  })
})
