'use client'

import { Box, Flex, Text, HStack } from '@chakra-ui/react'
import { IconType } from 'react-icons'

interface MetricCardProps {
  title: string
  value: number
  previousValue?: number
  format: 'number' | 'currency' | 'percentage'
  icon?: IconType
  colorScheme?: string
}

export function MetricCard({ 
  title, 
  value, 
  previousValue, 
  format, 
  icon: Icon,
  colorScheme = 'blue' 
}: MetricCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val)
      case 'percentage':
        return `${val.toFixed(1)}%`
      case 'number':
      default:
        return val.toLocaleString()
    }
  }

  const calculateChange = () => {
    if (!previousValue || previousValue === 0) return null
    
    const change = ((value - previousValue) / previousValue) * 100
    return {
      value: change,
      isPositive: change >= 0,
      formatted: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
    }
  }

  const change = calculateChange()

  return (
    <Box
      bg="white"
      p={6}
      borderRadius="lg"
      shadow="sm"
      border="1px"
      borderColor="gray.200"
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
    >
      <Flex justify="space-between" align="start" mb={4}>
        <Text fontSize="sm" color="gray.600" fontWeight="medium">
          {title}
        </Text>
        {Icon && (
          <Box
            p={2}
            borderRadius="md"
            bg={`${colorScheme}.50`}
            color={`${colorScheme}.600`}
          >
            <Icon size={16} />
          </Box>
        )}
      </Flex>

      <Text fontSize="2xl" fontWeight="bold" color="gray.900" mb={2}>
        {formatValue(value)}
      </Text>

      {change && (
        <HStack gap={2}>
          <Text
            fontSize="sm"
            fontWeight="medium"
            color={change.isPositive ? 'green.600' : 'red.600'}
          >
            {change.formatted}
          </Text>
          <Text fontSize="sm" color="gray.500">
            vs previous period
          </Text>
        </HStack>
      )}
    </Box>
  )
}
