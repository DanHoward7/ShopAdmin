'use client'

import {
  Box,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  Flex,
} from '@chakra-ui/react'
import { FiEye, FiEdit, FiTrash2, FiKey, FiExternalLink } from 'react-icons/fi'
import type { Store } from '@/types/api'

interface StoresTableProps {
  stores: Store[]
  onViewStore: (storeId: string) => void
  onEditStore: (storeId: string) => void
  onDeleteStore: (storeId: string) => void
  onGenerateApiKey: (storeId: string) => void
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getStatusColor = (status: string, isActive: boolean) => {
  if (!isActive) return 'gray'
  
  switch (status) {
    case 'ACTIVE':
      return 'green'
    case 'PENDING':
      return 'orange'
    case 'SUSPENDED':
      return 'red'
    case 'INACTIVE':
      return 'gray'
    default:
      return 'gray'
  }
}

export function StoresTable({ 
  stores, 
  onViewStore, 
  onEditStore, 
  onDeleteStore,
  onGenerateApiKey 
}: StoresTableProps) {
  if (stores.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">No stores found</Text>
      </Box>
    )
  }

  return (
    <VStack gap={4} align="stretch">
      {stores.map((store) => (
        <Box
          key={store.id}
          bg="white"
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor="gray.200"
          shadow="sm"
        >
          <Flex justify="space-between" align="start" mb={4}>
            <VStack align="start" gap={2}>
              <Flex align="center" gap={3}>
                <Text fontSize="lg" fontWeight="bold">
                  {store.name}
                </Text>
                <Badge colorScheme={getStatusColor(store.status, store.isActive)}>
                  {store.isActive ? store.status.toLowerCase() : 'inactive'}
                </Badge>
              </Flex>
              <Text fontSize="sm" color="gray.600">
                {store.url}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Created: {formatDate(store.createdAt)}
              </Text>
            </VStack>
          </Flex>

          <VStack align="start" gap={3} mb={4}>
            {store.description && (
              <Flex justify="space-between" w="full">
                <Text fontWeight="medium">Description:</Text>
                <Text maxW="400px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                  {store.description}
                </Text>
              </Flex>
            )}
            
            <Flex justify="space-between" w="full">
              <Text fontWeight="medium">Currency:</Text>
              <Text>{store.currency}</Text>
            </Flex>
            
            <Flex justify="space-between" w="full">
              <Text fontWeight="medium">Timezone:</Text>
              <Text>{store.timezone}</Text>
            </Flex>

            {store.contactEmail && (
              <Flex justify="space-between" w="full">
                <Text fontWeight="medium">Contact:</Text>
                <Text>{store.contactEmail}</Text>
              </Flex>
            )}
          </VStack>

          <HStack justify="end" gap={2} flexWrap="wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewStore(store.id)}
            >
              <FiEye />
              <Text ml={2}>View</Text>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEditStore(store.id)}
            >
              <FiEdit />
              <Text ml={2}>Edit</Text>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              colorScheme="blue"
              onClick={() => onGenerateApiKey(store.id)}
            >
              <FiKey />
              <Text ml={2}>API Key</Text>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(store.url, '_blank')}
            >
              <FiExternalLink />
              <Text ml={2}>Visit</Text>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              colorScheme="red"
              onClick={() => onDeleteStore(store.id)}
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
