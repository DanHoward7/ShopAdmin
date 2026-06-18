'use client'

import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Textarea,
} from '@chakra-ui/react'
import { useState } from 'react'
import type { OrderStatus } from '@/types/api'

interface OrderStatusUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  currentStatus: OrderStatus
  onUpdate: (status: OrderStatus, notes?: string) => void
  isLoading: boolean
}

const statusOptions: { value: OrderStatus; label: string; description: string }[] = [
  { value: 'PENDING', label: 'Pending', description: 'Order is awaiting processing' },
  { value: 'PROCESSING', label: 'Processing', description: 'Order is being prepared' },
  { value: 'SHIPPED', label: 'Shipped', description: 'Order has been shipped' },
  { value: 'DELIVERED', label: 'Delivered', description: 'Order has been delivered' },
  { value: 'CANCELLED', label: 'Cancelled', description: 'Order has been cancelled' },
  { value: 'REFUNDED', label: 'Refunded', description: 'Order has been refunded' },
  { value: 'ON_HOLD', label: 'On Hold', description: 'Order is temporarily on hold' },
]

export function OrderStatusUpdateModal({
  isOpen,
  onClose,
  currentStatus,
  onUpdate,
  isLoading
}: OrderStatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus)
  const [notes, setNotes] = useState('')

  if (!isOpen) return null

  const handleUpdate = () => {
    onUpdate(selectedStatus, notes.trim() || undefined)
  }

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
    >
      <Box
        bg="white"
        borderRadius="lg"
        p={6}
        maxW="md"
        w="full"
        mx={4}
        shadow="xl"
      >
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          Update Order Status
        </Text>
        
        <VStack gap={4} align="stretch">
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Current Status: {currentStatus.replace('_', ' ')}
            </Text>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Select new status:
            </Text>
            
            <VStack gap={2} align="stretch">
              {statusOptions.map((option) => (
                <Box
                  key={option.value}
                  p={3}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={selectedStatus === option.value ? 'blue.500' : 'gray.200'}
                  bg={selectedStatus === option.value ? 'blue.50' : 'white'}
                  cursor="pointer"
                  onClick={() => setSelectedStatus(option.value)}
                  _hover={{ borderColor: 'blue.300' }}
                >
                  <HStack justify="space-between">
                    <VStack align="start" gap={0}>
                      <Text fontWeight="medium">{option.label}</Text>
                      <Text fontSize="sm" color="gray.600">{option.description}</Text>
                    </VStack>
                    {selectedStatus === option.value && (
                      <Box
                        w={4}
                        h={4}
                        borderRadius="full"
                        bg="blue.500"
                      />
                    )}
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>
          
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Notes (Optional)
            </Text>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this status change..."
              rows={3}
            />
          </Box>
        </VStack>
        
        <HStack justify="end" gap={3} mt={6}>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            colorScheme="blue"
            disabled={isLoading || selectedStatus === currentStatus}
          >
            {isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </HStack>
      </Box>
    </Box>
  )
}
