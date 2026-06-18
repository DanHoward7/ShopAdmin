'use client'

import { useParams, useRouter } from 'next/navigation'
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Flex,
  Badge,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { FiArrowLeft, FiEdit, FiTrash2, FiDownload } from 'react-icons/fi'
import { useOrder, useUpdateOrderStatus, useDeleteOrder } from '@/hooks/useOrders'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderItems } from '@/components/orders/OrderItems'
import { OrderCustomerInfo } from '@/components/orders/OrderCustomerInfo'
import { OrderAddresses } from '@/components/orders/OrderAddresses'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { OrderStatusUpdateModal } from '@/components/orders/OrderStatusUpdateModal'
import { useState } from 'react'
import type { OrderStatus } from '@/types/api'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  
  const { data: orderResponse, isLoading, isError, error } = useOrder(orderId)
  const updateStatusMutation = useUpdateOrderStatus()
  const deleteOrderMutation = useDeleteOrder()

  const handleStatusUpdate = async (status: OrderStatus, notes?: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: orderId, status, notes })
      setIsStatusModalOpen(false)
      alert('Order status updated successfully')
    } catch (error) {
      alert('Failed to update order status')
    }
  }

  const handleDeleteOrder = async () => {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        await deleteOrderMutation.mutateAsync(orderId)
        alert('Order deleted successfully')
        router.push('/orders')
      } catch (error) {
        alert('Failed to delete order')
      }
    }
  }

  const handleExportOrder = () => {
    // TODO: Implement order export functionality
    console.log('Export order:', orderId)
  }

  if (isLoading) {
    return (
      <Center p={8}>
        <VStack gap={4}>
          <Spinner size="xl" />
          <Text>Loading order details...</Text>
        </VStack>
      </Center>
    )
  }

  if (isError || !orderResponse?.data) {
    return (
      <Box p={6}>
        <Button onClick={() => router.back()} mb={4}>
          <FiArrowLeft />
          <Text ml={2}>Back</Text>
        </Button>
        <Box bg="red.50" p={4} borderRadius="md" borderColor="red.200" borderWidth="1px">
          <Text color="red.600">
            Error loading order: {error instanceof Error ? error.message : 'Order not found'}
          </Text>
        </Box>
      </Box>
    )
  }

  const order = orderResponse.data

  return (
    <Box p={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <HStack gap={4}>
          <Button onClick={() => router.back()} variant="outline">
            <FiArrowLeft />
            <Text ml={2}>Back</Text>
          </Button>
          <Box>
            <Heading size="xl">Order #{order.orderNumber}</Heading>
            <Text color="gray.600">
              Created on {formatDate(order.createdAt)}
            </Text>
          </Box>
        </HStack>
        
        <HStack gap={2}>
          <Button
            onClick={() => setIsStatusModalOpen(true)}
            colorScheme="blue"
            variant="outline"
          >
            <FiEdit />
            <Text ml={2}>Update Status</Text>
          </Button>
          <Button
            onClick={handleExportOrder}
            variant="outline"
          >
            <FiDownload />
            <Text ml={2}>Export</Text>
          </Button>
          <Button
            onClick={handleDeleteOrder}
            colorScheme="red"
            variant="outline"
          >
            <FiTrash2 />
            <Text ml={2}>Delete</Text>
          </Button>
        </HStack>
      </Flex>

      {/* Order Overview */}
      <Box bg="white" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.200" shadow="sm" mb={6}>
        <Flex justify="space-between" align="start" mb={4}>
          <VStack align="start" gap={2}>
            <Text fontSize="lg" fontWeight="semibold">Order Overview</Text>
            <HStack gap={4}>
              <OrderStatusBadge status={order.status} />
              <Text fontSize="sm" color="gray.600">
                Store: {order.store.name}
              </Text>
            </HStack>
          </VStack>
          
          <VStack align="end" gap={1}>
            <Text fontSize="2xl" fontWeight="bold">
              {formatCurrency(order.total)}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Total Amount
            </Text>
          </VStack>
        </Flex>

        {order.notes && (
          <Box mt={4} p={3} bg="gray.50" borderRadius="md">
            <Text fontSize="sm" fontWeight="medium" mb={1}>Notes:</Text>
            <Text fontSize="sm" color="gray.700">{order.notes}</Text>
          </Box>
        )}
      </Box>

      {/* Main Content Grid */}
      <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
        {/* Left Column */}
        <VStack flex="2" gap={6} align="stretch">
          <OrderItems items={order.items} />
          <OrderTimeline orderId={orderId} />
        </VStack>

        {/* Right Column */}
        <VStack flex="1" gap={6} align="stretch">
          <OrderCustomerInfo customer={order.customer} notes={order.notes} />
          <OrderAddresses 
            shippingAddress={order.shippingAddress}
            billingAddress={order.billingAddress}
          />
          
          {/* Order Summary */}
          <Box bg="white" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.200" shadow="sm">
            <Text fontSize="lg" fontWeight="semibold" mb={4}>Order Summary</Text>
            <VStack gap={3} align="stretch">
              <Flex justify="space-between">
                <Text>Subtotal:</Text>
                <Text>{formatCurrency((order.total - (order.tax || 0) - (order.shipping || 0)))}</Text>
              </Flex>
              {order.shipping && (
                <Flex justify="space-between">
                  <Text>Shipping:</Text>
                  <Text>{formatCurrency(order.shipping)}</Text>
                </Flex>
              )}
              {order.tax && (
                <Flex justify="space-between">
                  <Text>Tax:</Text>
                  <Text>{formatCurrency(order.tax)}</Text>
                </Flex>
              )}
              <Box borderTop="1px" borderColor="gray.200" pt={3}>
                <Flex justify="space-between">
                  <Text fontSize="lg" fontWeight="bold">Total:</Text>
                  <Text fontSize="lg" fontWeight="bold">{formatCurrency(order.total)}</Text>
                </Flex>
              </Box>
              {order.paymentMethod && (
                <Flex justify="space-between" mt={2}>
                  <Text fontSize="sm" color="gray.600">Payment Method:</Text>
                  <Text fontSize="sm">{order.paymentMethod}</Text>
                </Flex>
              )}
            </VStack>
          </Box>
        </VStack>
      </Flex>

      {/* Status Update Modal */}
      <OrderStatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        currentStatus={order.status}
        onUpdate={handleStatusUpdate}
        isLoading={updateStatusMutation.isPending}
      />
    </Box>
  )
}
