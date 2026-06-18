'use client'

import {
  Box,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react'
import { FiMapPin, FiPackage } from 'react-icons/fi'
import type { Address } from '@/types/api'

interface OrderAddressesProps {
  shippingAddress?: Address
  billingAddress?: Address
}

function AddressDisplay({ address, title, icon }: { 
  address: Address
  title: string
  icon: React.ReactNode
}) {
  return (
    <VStack align="start" gap={2}>
      <HStack gap={2}>
        {icon}
        <Text fontWeight="medium">{title}</Text>
      </HStack>
      <Box pl={6}>
        <VStack align="start" gap={1}>
          <Text>{address.line1}</Text>
          {address.line2 && <Text>{address.line2}</Text>}
          <Text>
            {address.city}
            {address.state && `, ${address.state}`} {address.postalCode}
          </Text>
          <Text>{address.country}</Text>
        </VStack>
      </Box>
    </VStack>
  )
}

export function OrderAddresses({ shippingAddress, billingAddress }: OrderAddressesProps) {
  if (!shippingAddress && !billingAddress) {
    return (
      <Box bg="white" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.200" shadow="sm">
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          Addresses
        </Text>
        <Text color="gray.500" textAlign="center" py={4}>
          No addresses available
        </Text>
      </Box>
    )
  }

  return (
    <Box bg="white" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.200" shadow="sm">
      <Text fontSize="lg" fontWeight="semibold" mb={4}>
        Addresses
      </Text>
      
      <VStack gap={6} align="stretch">
        {shippingAddress && (
          <AddressDisplay
            address={shippingAddress}
            title="Shipping Address"
            icon={<FiPackage />}
          />
        )}
        
        {billingAddress && (
          <AddressDisplay
            address={billingAddress}
            title="Billing Address"
            icon={<FiMapPin />}
          />
        )}
      </VStack>
    </Box>
  )
}
