'use client'

import {
  Box,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react'
import { FiClock, FiCheck, FiPackage, FiTruck } from 'react-icons/fi'

interface OrderTimelineProps {
  orderId: string
}

// Mock timeline data - in real app this would come from API
const mockTimelineEvents = [
  {
    id: '1',
    status: 'PENDING',
    timestamp: '2024-01-15T10:00:00Z',
    description: 'Order placed',
    icon: FiClock,
    color: 'orange'
  },
  {
    id: '2',
    status: 'PROCESSING',
    timestamp: '2024-01-15T11:30:00Z',
    description: 'Payment confirmed and order is being processed',
    icon: FiCheck,
    color: 'blue'
  },
  {
    id: '3',
    status: 'SHIPPED',
    timestamp: '2024-01-16T09:15:00Z',
    description: 'Order shipped via FedEx - Tracking: 1234567890',
    icon: FiTruck,
    color: 'teal'
  },
  {
    id: '4',
    status: 'DELIVERED',
    timestamp: '2024-01-18T14:22:00Z',
    description: 'Order delivered successfully',
    icon: FiPackage,
    color: 'green'
  }
]

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function OrderTimeline({ orderId }: OrderTimelineProps) {
  // In a real app, you'd fetch timeline data based on orderId
  // For now, using mock data regardless of orderId
  const timelineEvents = mockTimelineEvents

  return (
    <Box bg="white" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.200" shadow="sm">
      <Text fontSize="lg" fontWeight="semibold" mb={4}>
        Order Timeline
      </Text>
      
      <VStack gap={4} align="stretch">
        {timelineEvents.map((event, index) => {
          const Icon = event.icon
          const isLast = index === timelineEvents.length - 1
          
          return (
            <HStack key={event.id} align="start" gap={4}>
              {/* Timeline line and icon */}
              <VStack gap={0}>
                <Box
                  w={8}
                  h={8}
                  borderRadius="full"
                  bg={`${event.color}.100`}
                  borderWidth="2px"
                  borderColor={`${event.color}.500`}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon color={`var(--chakra-colors-${event.color}-500)`} size={16} />
                </Box>
                {!isLast && (
                  <Box
                    w="2px"
                    h={12}
                    bg="gray.200"
                  />
                )}
              </VStack>
              
              {/* Event content */}
              <VStack align="start" gap={1} flex="1">
                <HStack justify="space-between" w="full">
                  <Text fontWeight="medium" color={`${event.color}.600`}>
                    {event.status.replace('_', ' ')}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {formatDate(event.timestamp)}
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.700">
                  {event.description}
                </Text>
              </VStack>
            </HStack>
          )
        })}
        
        {timelineEvents.length === 0 && (
          <Text color="gray.500" textAlign="center" py={4}>
            No timeline events available
          </Text>
        )}
      </VStack>
    </Box>
  )
}
