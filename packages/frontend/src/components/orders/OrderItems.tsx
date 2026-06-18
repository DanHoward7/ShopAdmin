'use client'

import {
  Box,
  Text,
  VStack,
  HStack,
  Flex,
} from '@chakra-ui/react'
import type { OrderItem } from '@/types/api'

interface OrderItemsProps {
  items: OrderItem[]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function OrderItems({ items }: OrderItemsProps) {
  return (
    <Box bg="white" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.200" shadow="sm">
      <Text fontSize="lg" fontWeight="semibold" mb={4}>
        Order Items ({items.length})
      </Text>
      
      <VStack gap={4} align="stretch">
        {items.map((item) => (
          <Box
            key={item.id}
            p={4}
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.100"
            bg="gray.50"
          >
            <Flex justify="space-between" align="start">
              <VStack align="start" gap={1} flex="1">
                <Text fontWeight="medium">{item.name}</Text>
                <Text fontSize="sm" color="gray.600">
                  Product ID: {item.productId}
                </Text>
                <HStack gap={4}>
                  <Text fontSize="sm">
                    Quantity: <Text as="span" fontWeight="medium">{item.quantity}</Text>
                  </Text>
                  <Text fontSize="sm">
                    Unit Price: <Text as="span" fontWeight="medium">{formatCurrency(item.price)}</Text>
                  </Text>
                </HStack>
              </VStack>
              
              <VStack align="end" gap={1}>
                <Text fontSize="lg" fontWeight="bold">
                  {formatCurrency(item.total)}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Total
                </Text>
              </VStack>
            </Flex>
          </Box>
        ))}
        
        {items.length === 0 && (
          <Text color="gray.500" textAlign="center" py={4}>
            No items in this order
          </Text>
        )}
      </VStack>
    </Box>
  )
}
