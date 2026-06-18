'use client'

import {
  Box,
  Input,
  Button,
  HStack,
  VStack,
  Text,
} from '@chakra-ui/react'
import { FiSearch, FiFilter, FiDownload } from 'react-icons/fi'
import type { OrderStatus } from '@/types/api'

interface OrdersFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedStatus?: OrderStatus
  onStatusChange: (status?: OrderStatus) => void
  onExport: () => void
}

const statusOptions: { value?: OrderStatus; label: string }[] = [
  { value: undefined, label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'ON_HOLD', label: 'On Hold' },
]

export function OrdersFilters({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  onExport,
}: OrdersFiltersProps) {
  const cardBg = 'white'
  const borderColor = 'gray.200'

  return (
    <Box
      bg={cardBg}
      p={6}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
      mb={6}
    >
      <VStack gap={4} align="stretch">
        <HStack justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="semibold">
            Filter Orders
          </Text>
          <Button
            size="sm"
            variant="outline"
            onClick={onExport}
          >
            <FiDownload />
            <Text ml={2}>Export</Text>
          </Button>
        </HStack>

        <HStack gap={4} align="end" flexWrap="wrap">
          <Box flex="1" minW="250px">
            <Text fontSize="sm" mb={2} fontWeight="medium">
              Search Orders
            </Text>
            <HStack>
              <FiSearch />
              <Input
                placeholder="Search by order number or customer..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                size="md"
              />
            </HStack>
          </Box>

          <Box minW="200px">
            <Text fontSize="sm" mb={2} fontWeight="medium">
              Status Filter
            </Text>
            <HStack gap={2} flexWrap="wrap">
              {statusOptions.map((option) => (
                <Button
                  key={option.label}
                  size="sm"
                  variant={selectedStatus === option.value ? 'solid' : 'outline'}
                  colorScheme={selectedStatus === option.value ? 'blue' : 'gray'}
                  onClick={() => onStatusChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </HStack>
          </Box>
        </HStack>
      </VStack>
    </Box>
  )
}
