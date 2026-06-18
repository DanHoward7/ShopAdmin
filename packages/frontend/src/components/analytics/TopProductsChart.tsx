'use client'

import { Box, Heading, Text } from '@chakra-ui/react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { ChartDataPoint } from '@/types/analytics'

interface TopProductsChartProps {
  data: ChartDataPoint[]
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  if (!data || data.length === 0) {
    return (
      <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
        <Heading size="md" mb={4}>Top Products</Heading>
        <Text color="gray.500">No product data available</Text>
      </Box>
    )
  }

  const formatTooltip = (value: number, name: string) => {
    return [value.toLocaleString(), 'Sales']
  }

  const formatXAxis = (tickItem: string) => {
    // Truncate long product names
    return tickItem.length > 15 ? `${tickItem.substring(0, 15)}...` : tickItem
  }

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
      <Heading size="md" mb={4}>Top Products</Heading>
      
      <Box h="300px">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
            layout="horizontal"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number"
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              type="category"
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke="#666"
              fontSize={12}
              width={120}
            />
            <Tooltip 
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey="value" 
              fill="#9F7AEA"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}
