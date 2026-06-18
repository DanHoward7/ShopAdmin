'use client'

import {
  Box,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  Spinner,
  Center,
  Flex,
} from '@chakra-ui/react'
import { FiEye, FiEdit, FiTrash2 } from 'react-icons/fi'
import { format } from 'date-fns'
import type { Order, OrderStatus } from '@/types/api'

interface OrdersTableProps {
  orders: Order[]
  isLoading: boolean
  onViewOrder: (orderId: string) => void
  onEditOrder: (orderId: string) => void
  onDeleteOrder: (orderId: string) => void
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'DELIVERED':
      return 'green'
    case 'PROCESSING':
      return 'blue'
    case 'PENDING':
      return 'orange'
    case 'CANCELLED':
      return 'red'
    case 'SHIPPED':
      return 'teal'
    case 'REFUNDED':
      return 'purple'
    case 'ON_HOLD':
      return 'yellow'
    default:
      return 'gray'
  }
}

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM dd, yyyy')
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function OrdersTable({ orders, isLoading, onViewOrder, onEditOrder, onDeleteOrder }: OrdersTableProps) {
  const cardBg = 'white'
  const borderColor = 'gray.200'

  if (isLoading) {
    return (
      <Center p={8}>
        <Spinner size="xl" />
      </Center>
    )
  }

  if (orders.length === 0) {
    return (
      <Center p={8}>
        <Text color="gray.500">No orders found</Text>
      </Center>
    )
  }

  return (
    <VStack gap={4} align="stretch">
      {orders.map((order) => (
        <Box
          key={order.id}
          bg={cardBg}
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <Flex justify="space-between" align="start" mb={4}>
            <VStack align="start" gap={2}>
              <Text fontSize="lg" fontWeight="bold">
                Order #{order.orderNumber}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {formatDate(order.createdAt)}
              </Text>
            </VStack>
            <Badge colorScheme={getStatusColor(order.status)} size="lg">
              {order.status.toLowerCase().replace('_', ' ')}
            </Badge>
          </Flex>

          <VStack align="start" gap={3} mb={4}>
            <Flex justify="space-between" w="full">
              <Text fontWeight="medium">Customer:</Text>
              <Text>
                {order.customer 
                  ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || order.customer.email
                  : 'Guest'
                }
              </Text>
            </Flex>
            <Flex justify="space-between" w="full">
              <Text fontWeight="medium">Store:</Text>
              <Text>{order.store.name}</Text>
            </Flex>
            <Flex justify="space-between" w="full">
              <Text fontWeight="medium">Total:</Text>
              <Text fontSize="lg" fontWeight="bold">
                {formatCurrency(order.total)}
              </Text>
            </Flex>
            {order.notes && (
              <Flex justify="space-between" w="full">
                <Text fontWeight="medium">Notes:</Text>
                <Text fontSize="sm" color="gray.600" maxW="300px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                  {order.notes}
                </Text>
              </Flex>
            )}
          </VStack>

          <HStack justify="end" gap={2}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewOrder(order.id)}
            >
              <FiEye />
              <Text ml={2}>View</Text>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEditOrder(order.id)}
            >
              <FiEdit />
              <Text ml={2}>Edit</Text>
            </Button>
            <Button
              size="sm"
              variant="outline"
              colorScheme="red"
              onClick={() => onDeleteOrder(order.id)}
            >
              <FiTrash2 />
              <Text ml={2}>Delete</Text>
            </Button>
          </HStack>
        </Box>
      ))}
    </VStack>
  )
}
