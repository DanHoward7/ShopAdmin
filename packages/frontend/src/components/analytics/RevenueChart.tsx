'use client'

import { Box, Heading, Text } from '@chakra-ui/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'
import type { TimeSeriesData } from '@/types/analytics'

interface RevenueChartProps {
  data: TimeSeriesData[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
        <Heading size="md" mb={4}>Revenue Over Time</Heading>
        <Text color="gray.500">No revenue data available</Text>
      </Box>
    )
  }

  const chartData = data[0]?.data || []

  const formatTooltip = (value: number, name: string) => {
    return [
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value),
      'Revenue'
    ]
  }

  const formatXAxis = (tickItem: string) => {
    try {
      return format(parseISO(tickItem), 'MMM dd')
    } catch {
      return tickItem
    }
  }

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
      <Heading size="md" mb={4}>Revenue Over Time</Heading>
      
      <Box h="300px">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              stroke="#666"
              fontSize={12}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelFormatter={(label) => {
                try {
                  return format(parseISO(label), 'MMM dd, yyyy')
                } catch {
                  return label
                }
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3182CE" 
              strokeWidth={2}
              dot={{ fill: '#3182CE', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3182CE', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}
