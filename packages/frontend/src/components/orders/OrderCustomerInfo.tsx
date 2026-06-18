'use client'

import {
  Box,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react'
import { FiUser, FiMail, FiPhone } from 'react-icons/fi'
import type { Customer } from '@/types/api'

interface OrderCustomerInfoProps {
  customer: Customer | null | undefined
  notes?: string | null
}

export function OrderCustomerInfo({ customer, notes }: OrderCustomerInfoProps) {
  // Handle guest checkout (no customer record)
  if (!customer) {
    // Try to extract email from notes (format: "Order from FirstName LastName (email@example.com)")
    const emailMatch = notes?.match(/\(([^)]+@[^)]+)\)/)
    const nameMatch = notes?.match(/Order from ([^(]+)/)
    const guestEmail = emailMatch?.[1]
    const guestName = nameMatch?.[1]?.trim()
    
    return (
      <Box bg="white" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.200" shadow="sm">
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          Customer Information
        </Text>
        
        <VStack gap={3} align="stretch">
          <HStack gap={3}>
            <FiUser />
            <VStack align="start" gap={0}>
              <Text fontWeight="medium">{guestName || 'Guest Customer'}</Text>
              <Text fontSize="sm" color="gray.600">No customer account</Text>
            </VStack>
          </HStack>
          
          {guestEmail && (
            <HStack gap={3}>
              <FiMail />
              <VStack align="start" gap={0}>
                <Text>{guestEmail}</Text>
                <Text fontSize="sm" color="gray.600">Email Address</Text>
              </VStack>
            </HStack>
          )}
          
          <Box mt={2} pt={3} borderTop="1px" borderColor="gray.200">
            <Text fontSize="sm" color="gray.600">
              This order was placed as a guest checkout
            </Text>
          </Box>
        </VStack>
      </Box>
    )
  }

  const customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Guest Customer'
  
  return (
    <Box bg="white" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.200" shadow="sm">
      <Text fontSize="lg" fontWeight="semibold" mb={4}>
        Customer Information
      </Text>
      
      <VStack gap={3} align="stretch">
        <HStack gap={3}>
          <FiUser />
          <VStack align="start" gap={0}>
            <Text fontWeight="medium">{customerName}</Text>
            <Text fontSize="sm" color="gray.600">Customer ID: {customer.id}</Text>
          </VStack>
        </HStack>
        
        <HStack gap={3}>
          <FiMail />
          <VStack align="start" gap={0}>
            <Text>{customer.email}</Text>
            <Text fontSize="sm" color="gray.600">Email Address</Text>
          </VStack>
        </HStack>
        
        {customer.phone && (
          <HStack gap={3}>
            <FiPhone />
            <VStack align="start" gap={0}>
              <Text>{customer.phone}</Text>
              <Text fontSize="sm" color="gray.600">Phone Number</Text>
            </VStack>
          </HStack>
        )}
        
        <Box mt={2} pt={3} borderTop="1px" borderColor="gray.200">
          <Text fontSize="sm" color="gray.600">
            Customer since: {new Date(customer.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}
