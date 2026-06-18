'use client'

import {
  Box,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react'
import { IconType } from 'react-icons'

interface StoreStatsCardProps {
  title: string
  value: number | string
  icon: IconType
  color: string
}

export function StoreStatsCard({ title, value, icon: Icon, color }: StoreStatsCardProps) {
  return (
    <Box
      bg="white"
      p={6}
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
      shadow="sm"
      minW="200px"
    >
      <HStack gap={4}>
        <Box
          w={12}
          h={12}
          borderRadius="lg"
          bg={`${color}.100`}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon size={24} color={`var(--chakra-colors-${color}-500)`} />
        </Box>
        
        <VStack align="start" gap={1}>
          <Text fontSize="2xl" fontWeight="bold" color={`${color}.600`}>
            {value}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {title}
          </Text>
        </VStack>
      </HStack>
    </Box>
  )
}
