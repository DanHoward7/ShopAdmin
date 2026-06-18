'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Grid,
  Spinner,
  Badge,
  HStack,
  VStack,
  Separator,
} from '@chakra-ui/react'
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiShoppingBag,
  FiPackage,
  FiDollarSign,
  FiShoppingCart,
  FiCalendar,
  FiEdit,
  FiTrash2,
} from 'react-icons/fi'
import { useCustomer, useDeleteCustomer } from '@/hooks/useCustomers'

interface PageProps {
  params: { id: string }
}

export default function CustomerDetailPage({ params }: PageProps) {
  const router = useRouter()

  const { data, isLoading, error } = useCustomer(params.id)
  const deleteCustomerMutation = useDeleteCustomer()

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        await deleteCustomerMutation.mutateAsync(params.id)
        alert('Customer deleted successfully')
        router.push('/dashboard/customers')
      } catch (error) {
        alert('Failed to delete customer')
      }
    }
  }

  const handleEdit = () => {
    // TODO: Open edit modal or navigate to edit page
    alert('Edit functionality coming soon!')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'yellow',
      PROCESSING: 'blue',
      SHIPPED: 'purple',
      DELIVERED: 'green',
      COMPLETED: 'green',
      CANCELLED: 'red',
      REFUNDED: 'orange',
    }
    return colors[status] || 'gray'
  }

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" colorPalette="blue" />
        </Flex>
      </Container>
    )
  }

  if (error || !data?.data) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box bg="red.50" p={4} borderRadius="md">
          <Text color="red.600">Failed to load customer details.</Text>
        </Box>
      </Container>
    )
  }

  const customer = data.data

  return (
    <Container maxW="container.xl" py={8}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <HStack gap={4}>
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
          >
            <FiArrowLeft />
            <Text ml={2}>Back</Text>
          </Button>
          <Box>
            <Heading size="lg">
              {customer.firstName && customer.lastName
                ? `${customer.firstName} ${customer.lastName}`
                : customer.email}
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Customer ID: {customer.id.slice(0, 8)}...
            </Text>
          </Box>
        </HStack>
        
        <HStack gap={2}>
          <Button
            onClick={handleEdit}
            colorScheme="blue"
            variant="outline"
            size="sm"
          >
            <FiEdit />
            <Text ml={2}>Edit</Text>
          </Button>
          <Button
            onClick={handleDelete}
            colorScheme="red"
            variant="outline"
            size="sm"
            loading={deleteCustomerMutation.isPending}
          >
            <FiTrash2 />
            <Text ml={2}>Delete</Text>
          </Button>
        </HStack>
      </Flex>

      <Grid templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} gap={6} mb={6}>
        {/* Customer Info Card */}
        <Box gridColumn={{ base: '1', lg: 'span 2' }}>
          <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
            <Heading size="md" mb={4}>
              Customer Information
            </Heading>
            <VStack align="stretch" gap={4}>
              <Flex align="center" gap={3}>
                <Box color="gray.500">
                  <FiMail size={20} />
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    Email
                  </Text>
                  <Text fontWeight="medium">{customer.email}</Text>
                </Box>
              </Flex>
              
              {customer.phone && (
                <Flex align="center" gap={3}>
                  <Box color="gray.500">
                    <FiPhone size={20} />
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Phone
                    </Text>
                    <Text fontWeight="medium">{customer.phone}</Text>
                  </Box>
                </Flex>
              )}
              
              <Flex align="center" gap={3}>
                <Box color="gray.500">
                  <FiShoppingBag size={20} />
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    Store
                  </Text>
                  <Text fontWeight="medium">{customer.store.name}</Text>
                  {customer.store.url && (
                    <Text fontSize="sm" color="blue.500">
                      {customer.store.url}
                    </Text>
                  )}
                </Box>
              </Flex>
              
              <Flex align="center" gap={3}>
                <Box color="gray.500">
                  <FiCalendar size={20} />
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    Customer Since
                  </Text>
                  <Text fontWeight="medium">{formatDate(customer.createdAt)}</Text>
                </Box>
              </Flex>
            </VStack>
          </Box>
        </Box>

        {/* Stats Card */}
        <Box>
          <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
            <Heading size="md" mb={4}>
              Statistics
            </Heading>
            <VStack align="stretch" gap={4}>
              <Box>
                <Flex align="center" gap={2} mb={1} color="gray.500">
                  <FiShoppingCart size={16} />
                  <Text fontSize="sm" color="gray.600">
                    Total Orders
                  </Text>
                </Flex>
                <Text fontSize="2xl" fontWeight="bold">
                  {customer.stats.totalOrders}
                </Text>
              </Box>
              
              <Separator />
              
              <Box>
                <Flex align="center" gap={2} mb={1} color="gray.500">
                  <FiDollarSign size={16} />
                  <Text fontSize="sm" color="gray.600">
                    Total Spent
                  </Text>
                </Flex>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {formatCurrency(Number(customer.stats.totalSpent))}
                </Text>
              </Box>
              
              <Separator />
              
              <Box>
                <Flex align="center" gap={2} mb={1} color="gray.500">
                  <FiPackage size={16} />
                  <Text fontSize="sm" color="gray.600">
                    Average Order Value
                  </Text>
                </Flex>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {formatCurrency(Number(customer.stats.averageOrderValue))}
                </Text>
              </Box>
            </VStack>
          </Box>
        </Box>
      </Grid>

      {/* Order History */}
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
        <Heading size="md" mb={4}>
          Order History ({customer.orders.length})
        </Heading>
        
        {customer.orders.length === 0 ? (
          <Flex direction="column" align="center" py={8}>
            <Box mb={3} p={3} bg="gray.50" borderRadius="full">
              <FiShoppingCart size={32} color="gray" />
            </Box>
            <Text color="gray.500">No orders yet</Text>
          </Flex>
        ) : (
          <VStack align="stretch" gap={3}>
            {customer.orders.map((order) => (
              <Box
                key={order.id}
                p={4}
                borderRadius="md"
                border="1px"
                borderColor="gray.200"
                _hover={{ borderColor: 'blue.300', bg: 'blue.50', cursor: 'pointer' }}
                transition="all 0.2s"
                onClick={() => router.push(`/dashboard/orders/${order.id}`)}
              >
                <Flex justify="space-between" align="start" mb={2}>
                  <Box>
                    <Text fontWeight="bold" fontSize="lg">
                      {order.orderNumber}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {formatDateTime(order.createdAt)}
                    </Text>
                  </Box>
                  <Badge colorPalette={getStatusColor(order.status)} size="sm">
                    {order.status}
                  </Badge>
                </Flex>
                
                <Flex justify="space-between" align="center">
                  <Text fontSize="sm" color="gray.600">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </Text>
                  <Text fontWeight="bold" fontSize="lg">
                    {formatCurrency(Number(order.total))}
                  </Text>
                </Flex>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </Container>
  )
}
