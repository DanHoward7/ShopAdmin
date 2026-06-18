'use client'

import { Box, Flex, Text, HStack, Badge, Spinner } from '@chakra-ui/react'
import { FiUsers, FiShoppingCart, FiDollarSign, FiActivity } from 'react-icons/fi'
import { useRealTimeMetrics } from '@/hooks/useAnalytics'

export function RealTimeMetrics() {
  const { data: metrics, isLoading, error } = useRealTimeMetrics()

  if (isLoading) {
    return (
      <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
        <Flex align="center" gap={2} mb={4}>
          <Spinner size="sm" />
          <Text fontWeight="semibold">Loading real-time metrics...</Text>
        </Flex>
      </Box>
    )
  }

  if (error || !metrics) {
    return (
      <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
        <Text color="red.500">Failed to load real-time metrics</Text>
      </Box>
    )
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'green'
      case 'warning': return 'yellow'
      case 'critical': return 'red'
      default: return 'gray'
    }
  }

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontWeight="semibold" fontSize="lg">Real-Time Metrics</Text>
        <HStack gap={2}>
          <Box w={2} h={2} borderRadius="full" bg="green.400" />
          <Text fontSize="sm" color="gray.600">Live</Text>
        </HStack>
      </Flex>

      <HStack gap={8} justify="space-between">
        <HStack gap={3}>
          <Box p={2} borderRadius="md" bg="blue.50" color="blue.600">
            <FiUsers size={16} />
          </Box>
          <Box>
            <Text fontSize="sm" color="gray.600">Active Users</Text>
            <Text fontSize="xl" fontWeight="bold">{metrics.activeUsers}</Text>
          </Box>
        </HStack>

        <HStack gap={3}>
          <Box p={2} borderRadius="md" bg="green.50" color="green.600">
            <FiShoppingCart size={16} />
          </Box>
          <Box>
            <Text fontSize="sm" color="gray.600">Current Orders</Text>
            <Text fontSize="xl" fontWeight="bold">{metrics.currentOrders}</Text>
          </Box>
        </HStack>

        <HStack gap={3}>
          <Box p={2} borderRadius="md" bg="purple.50" color="purple.600">
            <FiDollarSign size={16} />
          </Box>
          <Box>
            <Text fontSize="sm" color="gray.600">Today's Revenue</Text>
            <Text fontSize="xl" fontWeight="bold">
              ${metrics.todayRevenue.toLocaleString()}
            </Text>
          </Box>
        </HStack>

        <HStack gap={3}>
          <Box p={2} borderRadius="md" bg="orange.50" color="orange.600">
            <FiActivity size={16} />
          </Box>
          <Box>
            <Text fontSize="sm" color="gray.600">System Health</Text>
            <Badge colorScheme={getHealthColor(metrics.systemHealth)} textTransform="capitalize">
              {metrics.systemHealth}
            </Badge>
          </Box>
        </HStack>
      </HStack>
    </Box>
  )
}
