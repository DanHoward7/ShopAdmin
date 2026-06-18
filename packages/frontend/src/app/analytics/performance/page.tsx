'use client'

import { Box, Heading, Text, SimpleGrid, Flex, Button, HStack, VStack, Spinner, Center } from '@chakra-ui/react'
import { FiRefreshCw, FiServer, FiDatabase, FiAlertTriangle, FiActivity } from 'react-icons/fi'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { usePerformanceMetrics } from '@/hooks/useAnalytics'
import { MetricCard } from '@/components/analytics/MetricCard'

export default function PerformancePage() {
  const { data: metrics, isLoading, error, refetch } = usePerformanceMetrics()

  const handleRefresh = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <Center h="400px">
          <VStack gap={4}>
            <Spinner size="xl" />
            <Text>Loading performance metrics...</Text>
          </VStack>
        </Center>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <Center h="400px">
          <VStack gap={4}>
            <Text color="red.500">Failed to load performance metrics</Text>
            <Button onClick={handleRefresh}>
              <FiRefreshCw />
              Retry
            </Button>
          </VStack>
        </Center>
      </DashboardLayout>
    )
  }

  if (!metrics) {
    return (
      <DashboardLayout>
        <Center h="400px">
          <Text>No performance data available</Text>
        </Center>
      </DashboardLayout>
    )
  }

  const getHealthStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return { color: 'green', status: 'Excellent' }
    if (value <= thresholds.warning) return { color: 'yellow', status: 'Warning' }
    return { color: 'red', status: 'Critical' }
  }

  const apiHealth = getHealthStatus(metrics.apiResponseTime, { good: 200, warning: 500 })
  const dbHealth = getHealthStatus(metrics.databaseQueryTime, { good: 50, warning: 100 })
  const errorHealth = getHealthStatus(metrics.errorRate, { good: 1, warning: 5 })

  return (
    <DashboardLayout>
      <Box p={8}>
        {/* Header */}
        <Flex justify="space-between" align="center" mb={8}>
          <Box>
            <Heading size="xl" mb={2}>Performance Metrics</Heading>
            <Text color="gray.600">
              Monitor system performance and health indicators
            </Text>
          </Box>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            loading={isLoading}
          >
            <FiRefreshCw />
            Refresh
          </Button>
        </Flex>

        {/* Key Performance Metrics */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} gap={6} mb={8}>
          <MetricCard
            title="API Response Time"
            value={metrics.apiResponseTime}
            format="number"
            icon={FiServer}
            colorScheme={apiHealth.color}
          />
          <MetricCard
            title="Database Query Time"
            value={metrics.databaseQueryTime}
            format="number"
            icon={FiDatabase}
            colorScheme={dbHealth.color}
          />
          <MetricCard
            title="Error Rate"
            value={metrics.errorRate}
            format="percentage"
            icon={FiAlertTriangle}
            colorScheme={errorHealth.color}
          />
          <MetricCard
            title="System Uptime"
            value={metrics.uptime}
            format="percentage"
            icon={FiActivity}
            colorScheme="green"
          />
          <MetricCard
            title="Throughput"
            value={metrics.throughput}
            format="number"
            icon={FiActivity}
            colorScheme="blue"
          />
        </SimpleGrid>

        {/* Detailed Performance Information */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
          {/* System Health Overview */}
          <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
            <Heading size="md" mb={6}>System Health Overview</Heading>
            
            <VStack align="start" gap={4}>
              <Flex justify="space-between" w="full" align="center">
                <HStack gap={3}>
                  <Box p={2} borderRadius="md" bg={`${apiHealth.color}.50`} color={`${apiHealth.color}.600`}>
                    <FiServer size={16} />
                  </Box>
                  <Box>
                    <Text fontWeight="medium">API Performance</Text>
                    <Text fontSize="sm" color="gray.600">{metrics.apiResponseTime}ms average response</Text>
                  </Box>
                </HStack>
                <Box
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg={`${apiHealth.color}.100`}
                  color={`${apiHealth.color}.800`}
                  fontSize="sm"
                  fontWeight="medium"
                >
                  {apiHealth.status}
                </Box>
              </Flex>

              <Flex justify="space-between" w="full" align="center">
                <HStack gap={3}>
                  <Box p={2} borderRadius="md" bg={`${dbHealth.color}.50`} color={`${dbHealth.color}.600`}>
                    <FiDatabase size={16} />
                  </Box>
                  <Box>
                    <Text fontWeight="medium">Database Performance</Text>
                    <Text fontSize="sm" color="gray.600">{metrics.databaseQueryTime}ms average query</Text>
                  </Box>
                </HStack>
                <Box
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg={`${dbHealth.color}.100`}
                  color={`${dbHealth.color}.800`}
                  fontSize="sm"
                  fontWeight="medium"
                >
                  {dbHealth.status}
                </Box>
              </Flex>

              <Flex justify="space-between" w="full" align="center">
                <HStack gap={3}>
                  <Box p={2} borderRadius="md" bg={`${errorHealth.color}.50`} color={`${errorHealth.color}.600`}>
                    <FiAlertTriangle size={16} />
                  </Box>
                  <Box>
                    <Text fontWeight="medium">Error Rate</Text>
                    <Text fontSize="sm" color="gray.600">{metrics.errorRate.toFixed(2)}% error rate</Text>
                  </Box>
                </HStack>
                <Box
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg={`${errorHealth.color}.100`}
                  color={`${errorHealth.color}.800`}
                  fontSize="sm"
                  fontWeight="medium"
                >
                  {errorHealth.status}
                </Box>
              </Flex>
            </VStack>
          </Box>

          {/* Performance Recommendations */}
          <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
            <Heading size="md" mb={6}>Performance Recommendations</Heading>
            
            <VStack align="start" gap={4}>
              {metrics.apiResponseTime > 200 && (
                <Box p={4} borderRadius="md" bg="yellow.50" border="1px" borderColor="yellow.200">
                  <Text fontWeight="medium" color="yellow.800" mb={2}>
                    API Response Time Warning
                  </Text>
                  <Text fontSize="sm" color="yellow.700">
                    API response time is above optimal threshold. Consider optimizing database queries or adding caching.
                  </Text>
                </Box>
              )}

              {metrics.databaseQueryTime > 50 && (
                <Box p={4} borderRadius="md" bg="orange.50" border="1px" borderColor="orange.200">
                  <Text fontWeight="medium" color="orange.800" mb={2}>
                    Database Performance Alert
                  </Text>
                  <Text fontSize="sm" color="orange.700">
                    Database queries are slower than expected. Review query optimization and indexing strategies.
                  </Text>
                </Box>
              )}

              {metrics.errorRate > 1 && (
                <Box p={4} borderRadius="md" bg="red.50" border="1px" borderColor="red.200">
                  <Text fontWeight="medium" color="red.800" mb={2}>
                    High Error Rate Detected
                  </Text>
                  <Text fontSize="sm" color="red.700">
                    Error rate is above acceptable levels. Check application logs and monitor for issues.
                  </Text>
                </Box>
              )}

              {metrics.apiResponseTime <= 200 && metrics.databaseQueryTime <= 50 && metrics.errorRate <= 1 && (
                <Box p={4} borderRadius="md" bg="green.50" border="1px" borderColor="green.200">
                  <Text fontWeight="medium" color="green.800" mb={2}>
                    System Performance Optimal
                  </Text>
                  <Text fontSize="sm" color="green.700">
                    All performance metrics are within acceptable ranges. System is operating efficiently.
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Performance Thresholds */}
        <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200" mt={8}>
          <Heading size="md" mb={6}>Performance Thresholds</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            <Box>
              <Text fontWeight="medium" mb={2}>API Response Time</Text>
              <VStack align="start" gap={1} fontSize="sm">
                <Text color="green.600">• Excellent: ≤ 200ms</Text>
                <Text color="yellow.600">• Warning: 201-500ms</Text>
                <Text color="red.600">• Critical: {'>'}500ms</Text>
              </VStack>
            </Box>
            
            <Box>
              <Text fontWeight="medium" mb={2}>Database Query Time</Text>
              <VStack align="start" gap={1} fontSize="sm">
                <Text color="green.600">• Excellent: ≤ 50ms</Text>
                <Text color="yellow.600">• Warning: 51-100ms</Text>
                <Text color="red.600">• Critical: {'>'}100ms</Text>
              </VStack>
            </Box>
            
            <Box>
              <Text fontWeight="medium" mb={2}>Error Rate</Text>
              <VStack align="start" gap={1} fontSize="sm">
                <Text color="green.600">• Excellent: ≤ 1%</Text>
                <Text color="yellow.600">• Warning: 1-5%</Text>
                <Text color="red.600">• Critical: {'>'}5%</Text>
              </VStack>
            </Box>
          </SimpleGrid>
        </Box>
      </Box>
    </DashboardLayout>
  )
}
