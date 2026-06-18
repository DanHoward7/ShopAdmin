import { render, screen } from '@/test-utils'
import { MetricCard } from './MetricCard'
import { FiTrendingUp } from 'react-icons/fi'

describe('MetricCard', () => {
  it('renders metric card with basic props', () => {
    render(
      <MetricCard
        title="Total Revenue"
        value={125430.50}
        format="currency"
        icon={FiTrendingUp}
        colorScheme="green"
      />
    )

    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('$125,431')).toBeInTheDocument()
  })

  it('formats currency values correctly', () => {
    render(
      <MetricCard
        title="Revenue"
        value={1234.56}
        format="currency"
      />
    )

    expect(screen.getByText('$1,235')).toBeInTheDocument()
  })

  it('formats percentage values correctly', () => {
    render(
      <MetricCard
        title="Conversion Rate"
        value={3.2}
        format="percentage"
      />
    )

    expect(screen.getByText('3.2%')).toBeInTheDocument()
  })

  it('formats number values correctly', () => {
    render(
      <MetricCard
        title="Total Orders"
        value={1398}
        format="number"
      />
    )

    expect(screen.getByText('1,398')).toBeInTheDocument()
  })

  it('displays change percentage when previous value is provided', () => {
    render(
      <MetricCard
        title="Revenue"
        value={125430}
        previousValue={100000}
        format="currency"
      />
    )

    expect(screen.getByText('+25.4%')).toBeInTheDocument()
    expect(screen.getByText('vs previous period')).toBeInTheDocument()
  })

  it('displays negative change correctly', () => {
    render(
      <MetricCard
        title="Revenue"
        value={80000}
        previousValue={100000}
        format="currency"
      />
    )

    expect(screen.getByText('-20.0%')).toBeInTheDocument()
  })

  it('does not display change when previous value is zero', () => {
    render(
      <MetricCard
        title="Revenue"
        value={125430}
        previousValue={0}
        format="currency"
      />
    )

    expect(screen.queryByText('vs previous period')).not.toBeInTheDocument()
  })

  it('applies correct color scheme', () => {
    render(
      <MetricCard
        title="Revenue"
        value={125430}
        format="currency"
        colorScheme="blue"
        icon={FiTrendingUp}
      />
    )

    // Check if the icon container has the correct background color class
    const iconContainer = screen.getByRole('generic').querySelector('[class*="blue.50"]')
    expect(iconContainer).toBeInTheDocument()
  })
})
