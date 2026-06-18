'use client'

import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  HStack,
  VStack,
  Button,
  Icon,
} from '@chakra-ui/react'
import { FiShoppingCart, FiShoppingBag, FiPackage, FiTrendingUp, FiPlus, FiEye } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

// Mock dashboard data - in real app this would come from API
const dashboardStats = {
  totalOrders: 1247,
  ordersGrowth: 12.5,
  totalStores: 8,
  storesGrowth: 2,
  totalProducts: 342,
  productsGrowth: 8.3,
  totalRevenue: 45678.90,
  revenueGrowth: 15.2,
}

const recentOrders = [
  { id: '1', orderNumber: 'ORD-001', store: 'Main Store', total: 129.99, status: 'DELIVERED' },
  { id: '2', orderNumber: 'ORD-002', store: 'Online Shop', total: 89.50, status: 'SHIPPED' },
  { id: '3', orderNumber: 'ORD-003', store: 'Mobile Store', total: 234.75, status: 'PROCESSING' },
]

function StatCard({ 
  title, 
  value, 
  growth, 
  icon, 
  colorScheme = 'blue' 
}: {
  title: string
  value: string | number
  growth: number
  icon: any
  colorScheme?: string
}) {
  return (
    <Box
      bg="white"
      p={6}
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
      shadow="sm"
    >
      <HStack justify="space-between">
        <VStack align="start" gap={1}>
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            {title}
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {typeof value === 'number' && title.includes('Revenue') 
              ? `$${value.toLocaleString()}` 
              : value.toLocaleString()}
          </Text>
          <HStack gap={1}>
            <Text fontSize="sm" color={growth >= 0 ? 'green.500' : 'red.500'}>
              {growth >= 0 ? '↗' : '↘'} {Math.abs(growth)}%
            </Text>
          </HStack>
        </VStack>
        <Box
          p={3}
          borderRadius="full"
          bg={`${colorScheme}.100`}
          color={`${colorScheme}.500`}
        >
          <Icon as={icon} boxSize={6} />
        </Box>
      </HStack>
    </Box>
  )
}

export default function DashboardPage() {
  const router = useRouter()

  return (
    <Box p={6}>
      {/* Header */}
      <Box mb={8}>
        <Heading size="xl" mb={2}>Dashboard</Heading>
        <Text color="gray.600">
          Welcome back! Here's what's happening with your stores.
        </Text>
      </Box>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mb={8}>
        <StatCard
          title="Total Orders"
          value={dashboardStats.totalOrders}
          growth={dashboardStats.ordersGrowth}
          icon={FiShoppingCart}
          colorScheme="blue"
        />
        <StatCard
          title="Active Stores"
          value={dashboardStats.totalStores}
          growth={dashboardStats.storesGrowth}
          icon={FiShoppingBag}
          colorScheme="green"
        />
        <StatCard
          title="Total Products"
          value={dashboardStats.totalProducts}
          growth={dashboardStats.productsGrowth}
          icon={FiPackage}
          colorScheme="purple"
        />
        <StatCard
          title="Total Revenue"
          value={dashboardStats.totalRevenue}
          growth={dashboardStats.revenueGrowth}
          icon={FiTrendingUp}
          colorScheme="orange"
        />
      </SimpleGrid>

      {/* Quick Actions & Recent Orders */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        {/* Quick Actions */}
        <Box
          bg="white"
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor="gray.200"
          shadow="sm"
        >
          <Heading size="md" mb={4}>Quick Actions</Heading>
          <VStack gap={3} align="stretch">
            <Button
              colorScheme="blue"
              variant="outline"
              justifyContent="flex-start"
              onClick={() => router.push('/stores')}
            >
              <HStack>
                <FiPlus />
                <Text>Connect New Store</Text>
              </HStack>
            </Button>
            <Button
              colorScheme="green"
              variant="outline"
              justifyContent="flex-start"
              onClick={() => router.push('/products')}
            >
              <HStack>
                <FiPackage />
                <Text>Add New Product</Text>
              </HStack>
            </Button>
            <Button
              colorScheme="purple"
              variant="outline"
              justifyContent="flex-start"
              onClick={() => router.push('/orders')}
            >
              <HStack>
                <FiEye />
                <Text>View All Orders</Text>
              </HStack>
            </Button>
          </VStack>
        </Box>

        {/* Recent Orders */}
        <Box
          bg="white"
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor="gray.200"
          shadow="sm"
        >
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Recent Orders</Heading>
            <Button 
              size="sm" 
              variant="ghost" 
              colorScheme="blue"
              onClick={() => router.push('/orders')}
            >
              View All
            </Button>
          </HStack>
          <VStack gap={3} align="stretch">
            {recentOrders.map((order) => (
              <Box
                key={order.id}
                p={3}
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                _hover={{ bg: 'gray.50', cursor: 'pointer' }}
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <HStack justify="space-between">
                  <VStack align="start" gap={1}>
                    <Text fontWeight="medium">{order.orderNumber}</Text>
                    <Text fontSize="sm" color="gray.600">{order.store}</Text>
                  </VStack>
                  <VStack align="end" gap={1}>
                    <Text fontWeight="bold">${order.total}</Text>
                    <Text 
                      fontSize="sm" 
                      color={
                        order.status === 'DELIVERED' ? 'green.500' :
                        order.status === 'SHIPPED' ? 'blue.500' :
                        'orange.500'
                      }
                    >
                      {order.status}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  )
}
