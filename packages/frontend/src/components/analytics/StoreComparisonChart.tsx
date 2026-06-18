'use client'

import { Box, Heading, Text } from '@chakra-ui/react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { ChartDataPoint } from '@/types/analytics'

interface StoreComparisonChartProps {
  data: ChartDataPoint[]
}

const COLORS = ['#3182CE', '#38A169', '#9F7AEA', '#ED8936', '#E53E3E', '#00B5D8']

export function StoreComparisonChart({ data }: StoreComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
        <Heading size="md" mb={4}>Store Performance</Heading>
        <Text color="gray.500">No store data available</Text>
      </Box>
    )
  }

  const formatTooltip = (value: number, name: string) => {
    return [
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value),
      name
    ]
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
      <Heading size="md" mb={4}>Store Performance</Heading>
      
      <Box h="300px">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="date"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}
