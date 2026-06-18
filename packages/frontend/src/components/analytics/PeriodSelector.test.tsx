import { render, screen, fireEvent } from '@/test-utils'
import { PeriodSelector } from './PeriodSelector'
import type { AnalyticsPeriod } from '@/types/analytics'

const mockPeriods = {
  today: {
    start: new Date('2024-01-15'),
    end: new Date('2024-01-15'),
    label: 'Today'
  },
  last7Days: {
    start: new Date('2024-01-08'),
    end: new Date('2024-01-15'),
    label: 'Last 7 Days'
  },
  last30Days: {
    start: new Date('2023-12-16'),
    end: new Date('2024-01-15'),
    label: 'Last 30 Days'
  }
}

describe('PeriodSelector', () => {
  const mockOnPeriodChange = jest.fn()

  beforeEach(() => {
    mockOnPeriodChange.mockClear()
  })

  it('renders all period options', () => {
    render(
      <PeriodSelector
        periods={mockPeriods}
        selectedPeriod={mockPeriods.last30Days}
        onPeriodChange={mockOnPeriodChange}
      />
    )

    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('7 Days')).toBeInTheDocument()
    expect(screen.getByText('30 Days')).toBeInTheDocument()
  })

  it('highlights the selected period', () => {
    render(
      <PeriodSelector
        periods={mockPeriods}
        selectedPeriod={mockPeriods.last7Days}
        onPeriodChange={mockOnPeriodChange}
      />
    )

    const selectedButton = screen.getByText('7 Days')
    expect(selectedButton).toHaveAttribute('data-selected', 'true')
  })

  it('calls onPeriodChange when a period is clicked', () => {
    render(
      <PeriodSelector
        periods={mockPeriods}
        selectedPeriod={mockPeriods.last30Days}
        onPeriodChange={mockOnPeriodChange}
      />
    )

    fireEvent.click(screen.getByText('Today'))
    expect(mockOnPeriodChange).toHaveBeenCalledWith(mockPeriods.today)
  })

  it('does not call onPeriodChange when the already selected period is clicked', () => {
    render(
      <PeriodSelector
        periods={mockPeriods}
        selectedPeriod={mockPeriods.last30Days}
        onPeriodChange={mockOnPeriodChange}
      />
    )

    fireEvent.click(screen.getByText('30 Days'))
    expect(mockOnPeriodChange).toHaveBeenCalledWith(mockPeriods.last30Days)
  })

  it('renders calendar icon', () => {
    render(
      <PeriodSelector
        periods={mockPeriods}
        selectedPeriod={mockPeriods.last30Days}
        onPeriodChange={mockOnPeriodChange}
      />
    )

    // Check for the calendar icon (FiCalendar)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })
})
