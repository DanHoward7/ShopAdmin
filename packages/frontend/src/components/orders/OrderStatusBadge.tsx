'use client'

import { Box } from '@chakra-ui/react'
import type { OrderStatus } from '@/types/api'

interface OrderStatusBadgeProps {
  status: OrderStatus
  size?: 'sm' | 'md' | 'lg'
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

const formatStatusText = (status: OrderStatus) => {
  return status.toLowerCase().replace('_', ' ')
}

const getSizeStyles = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return { px: 2, py: 1, fontSize: 'xs' }
    case 'lg':
      return { px: 3, py: 2, fontSize: 'sm' }
    default:
      return { px: 2, py: 1, fontSize: 'xs' }
  }
}

export function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
  const color = getStatusColor(status)
  const sizeStyles = getSizeStyles(size)
  
  return (
    <Box
      display="inline-block"
      bg={`${color}.100`}
      color={`${color}.800`}
      borderRadius="md"
      fontWeight="medium"
      textTransform="capitalize"
      {...sizeStyles}
    >
      {formatStatusText(status)}
    </Box>
  )
}
