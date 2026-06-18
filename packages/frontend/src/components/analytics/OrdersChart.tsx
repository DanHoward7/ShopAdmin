'use client'

import { Box, Heading, Text } from '@chakra-ui/react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'
import type { TimeSeriesData } from '@/types/analytics'

interface OrdersChartProps {
  data: TimeSeriesData[]
}

export function OrdersChart({ data }: OrdersChartProps) {
  if (!data || data.length === 0) {
    return (
      <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
        <Heading size="md" mb={4}>Orders Over Time</Heading>
        <Text color="gray.500">No orders data available</Text>
      </Box>
    )
  }

  const chartData = data[0]?.data || []

  const formatTooltip = (value: number, name: string) => {
    return [value.toLocaleString(), 'Orders']
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
      <Heading size="md" mb={4}>Orders Over Time</Heading>
      
      <Box h="300px">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38A169" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#38A169" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
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
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#38A169" 
              strokeWidth={2}
              fill="url(#orderGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}
