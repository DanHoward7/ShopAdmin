'use client'

import {
  Box,
  Text,
  HStack,
  VStack,
  Spinner,
} from '@chakra-ui/react'
import { useOrderStats } from '@/hooks/useOrders'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function OrdersStats() {
  const { data: stats, isLoading } = useOrderStats()
  const cardBg = 'white'
  const borderColor = 'gray.200'

  if (isLoading) {
    return (
      <Box
        bg={cardBg}
        p={6}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        shadow="sm"
        mb={6}
      >
        <HStack justify="center">
          <Spinner size="md" />
          <Text>Loading statistics...</Text>
        </HStack>
      </Box>
    )
  }

  if (!stats?.data) {
    return null
  }

  const statsData = stats.data

  return (
    <Box
      bg={cardBg}
      p={6}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
      mb={6}
    >
      <Text fontSize="lg" fontWeight="semibold" mb={4}>
        Order Statistics
      </Text>
      
      <HStack gap={8} flexWrap="wrap">
        <VStack align="start" gap={1}>
          <Text fontSize="2xl" fontWeight="bold" color="blue.500">
            {statsData.total}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Total Orders
          </Text>
        </VStack>

        <VStack align="start" gap={1}>
          <Text fontSize="2xl" fontWeight="bold" color="green.500">
            {formatCurrency(statsData.totalRevenue)}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Total Revenue
          </Text>
        </VStack>

        <VStack align="start" gap={1}>
          <Text fontSize="2xl" fontWeight="bold" color="purple.500">
            {formatCurrency(statsData.averageOrderValue)}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Average Order Value
          </Text>
        </VStack>

        <VStack align="start" gap={1}>
          <Text fontSize="2xl" fontWeight="bold" color="orange.500">
            {statsData.pending}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Pending Orders
          </Text>
        </VStack>

        <VStack align="start" gap={1}>
          <Text fontSize="2xl" fontWeight="bold" color="blue.500">
            {statsData.processing}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Processing
          </Text>
        </VStack>

        <VStack align="start" gap={1}>
          <Text fontSize="2xl" fontWeight="bold" color="teal.500">
            {statsData.shipped}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Shipped
          </Text>
        </VStack>

        <VStack align="start" gap={1}>
          <Text fontSize="2xl" fontWeight="bold" color="green.500">
            {statsData.delivered}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Delivered
          </Text>
        </VStack>
      </HStack>
    </Box>
  )
}
