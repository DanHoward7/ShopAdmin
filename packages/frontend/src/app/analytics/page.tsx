'use client'

import { useState } from 'react'
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  HStack,
  VStack,
  SimpleGrid,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { FiDownload, FiRefreshCw, FiCalendar, FiTrendingUp } from 'react-icons/fi'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAnalyticsDashboard, useAnalyticsPeriods, useExportAnalytics } from '@/hooks/useAnalytics'
import { MetricCard } from '@/components/analytics/MetricCard'
import { RevenueChart } from '@/components/analytics/RevenueChart'
import { OrdersChart } from '@/components/analytics/OrdersChart'
import { TopProductsChart } from '@/components/analytics/TopProductsChart'
import { StoreComparisonChart } from '@/components/analytics/StoreComparisonChart'
import { PeriodSelector } from '@/components/analytics/PeriodSelector'
import { RealTimeMetrics } from '@/components/analytics/RealTimeMetrics'
import type { AnalyticsPeriod } from '@/types/analytics'

export default function AnalyticsPage() {
  const periods = useAnalyticsPeriods()
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>(periods.last30Days)
  
  const { data: analytics, isLoading, error, refetch } = useAnalyticsDashboard(selectedPeriod)
  const exportMutation = useExportAnalytics()

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    exportMutation.mutate({
      format,
      dateRange: selectedPeriod,
      metrics: ['revenue', 'orders', 'products', 'customers'],
      includeCharts: format === 'pdf'
    })
  }

  const handleRefresh = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <Center h="400px">
          <VStack gap={4}>
            <Spinner size="xl" />
            <Text>Loading analytics...</Text>
          </VStack>
        </Center>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <Center h="400px">
          +
          <VStack gap={4}>
            <Text color="red.500">Failed to load analytics data</Text>
            <Button onClick={handleRefresh}>
              <FiRefreshCw />
              Retry
            </Button>
          </VStack>
        </Center>
      </DashboardLayout>
    )
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <Center h="400px">
          <Text>No analytics data available</Text>
        </Center>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Box p={8}>
        {/* Header */}
        <Flex justify="space-between" align="center" mb={8}>
          <Box>
            <Heading size="xl" mb={2}>Analytics Dashboard</Heading>
            <Text color="gray.600">
              Comprehensive insights into your business performance
            </Text>
          </Box>
          
          <HStack gap={4}>
            <PeriodSelector
              periods={periods}
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
            
            <Button
              variant="outline"
              onClick={handleRefresh}
              loading={isLoading}
            >
              <FiRefreshCw />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
              loading={exportMutation.isPending}
            >
              <FiDownload />
              Export
            </Button>
          </HStack>
        </Flex>

        {/* Real-time Metrics */}
        <Box mb={8}>
          <RealTimeMetrics />
        </Box>

        {/* Key Metrics */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mb={8}>
          <MetricCard
            title="Total Revenue"
            value={analytics.revenue.totalRevenue}
            previousValue={analytics.revenue.previousRevenue}
            format="currency"
            icon={FiTrendingUp}
            colorScheme="green"
          />
          <MetricCard
            title="Total Orders"
            value={analytics.orders.totalOrders}
            format="number"
            icon={FiTrendingUp}
            colorScheme="blue"
          />
          <MetricCard
            title="Average Order Value"
            value={analytics.revenue.averageOrderValue}
            format="currency"
            icon={FiTrendingUp}
            colorScheme="purple"
          />
          <MetricCard
            title="Conversion Rate"
            value={analytics.revenue.conversionRate}
            format="percentage"
            icon={FiTrendingUp}
            colorScheme="orange"
          />
        </SimpleGrid>

        {/* Charts Grid */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8} mb={8}>
          <RevenueChart data={analytics.charts.revenueOverTime} />
          <OrdersChart data={analytics.charts.ordersOverTime} />
          <TopProductsChart data={analytics.charts.topProducts} />
          <StoreComparisonChart data={analytics.charts.storeComparison} />
        </SimpleGrid>

        {/* Additional Metrics */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
          <Box bg="white" p={6} borderRadius="lg" shadow="sm">
            <Heading size="md" mb={4}>Order Status Breakdown</Heading>
            <VStack align="start" gap={2}>
              {analytics.orders.ordersByStatus.map((status) => (
                <Flex key={status.status} justify="space-between" w="full">
                  <Text textTransform="capitalize">{status.status}</Text>
                  <Text fontWeight="semibold">{status.count} ({status.percentage}%)</Text>
                </Flex>
              ))}
            </VStack>
          </Box>

          <Box bg="white" p={6} borderRadius="lg" shadow="sm">
            <Heading size="md" mb={4}>Store Performance</Heading>
            <VStack align="start" gap={2}>
              {analytics.stores.storePerformance.slice(0, 4).map((store) => (
                <Flex key={store.storeId} justify="space-between" w="full">
                  <Text>{store.storeName}</Text>
                  <Text fontWeight="semibold">${store.revenue.toLocaleString()}</Text>
                </Flex>
              ))}
            </VStack>
          </Box>

          <Box bg="white" p={6} borderRadius="lg" shadow="sm">
            <Heading size="md" mb={4}>Customer Insights</Heading>
            <VStack align="start" gap={2}>
              <Flex justify="space-between" w="full">
                <Text>Total Customers</Text>
                <Text fontWeight="semibold">{analytics.customers.totalCustomers.toLocaleString()}</Text>
              </Flex>
              <Flex justify="space-between" w="full">
                <Text>New Customers</Text>
                <Text fontWeight="semibold">{analytics.customers.newCustomers.toLocaleString()}</Text>
              </Flex>
              <Flex justify="space-between" w="full">
                <Text>Retention Rate</Text>
                <Text fontWeight="semibold">{analytics.customers.customerRetentionRate}%</Text>
              </Flex>
              <Flex justify="space-between" w="full">
                <Text>Avg. Customer Value</Text>
                <Text fontWeight="semibold">${analytics.customers.averageCustomerValue}</Text>
              </Flex>
            </VStack>
          </Box>
        </SimpleGrid>
      </Box>
    </DashboardLayout>
  )
}
