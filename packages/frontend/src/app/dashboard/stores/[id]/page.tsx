'use client'

import { useParams, useRouter } from 'next/navigation'
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Flex,
  Badge,
  Spinner,
  Center,
  Link,
} from '@chakra-ui/react'
import { FiArrowLeft, FiEdit, FiTrash2, FiKey, FiExternalLink, FiRefreshCw } from 'react-icons/fi'
import { useStore, useDeleteStore, useGenerateApiKey, useTestConnection } from '@/hooks/useStores'
import { StoreApiKeyModal } from '@/components/stores/StoreApiKeyModal'
import { StoreEditModal } from '@/components/stores/StoreEditModal'
import { useState } from 'react'

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

export default function StoreDetailPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.id as string
  
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  const { data: storeResponse, isLoading, isError, error } = useStore(storeId)
  const deleteStoreMutation = useDeleteStore()
  const generateApiKeyMutation = useGenerateApiKey()
  const testConnectionMutation = useTestConnection()

  const handleDeleteStore = async () => {
    if (confirm('Are you sure you want to delete this store? This will also delete all associated orders.')) {
      try {
        await deleteStoreMutation.mutateAsync(storeId)
        alert('Store deleted successfully')
        router.push('/stores')
      } catch (error) {
        alert('Failed to delete store')
      }
    }
  }

  const handleGenerateApiKey = async () => {
    try {
      await generateApiKeyMutation.mutateAsync(storeId)
      setIsApiKeyModalOpen(true)
    } catch (error) {
      alert('Failed to generate API key')
    }
  }

  const handleTestConnection = async () => {
    try {
      const result = await testConnectionMutation.mutateAsync(storeId)
      alert(`Connection test: ${result?.data?.status} - ${result?.data?.message}`)
    } catch (error) {
      alert('Connection test failed')
    }
  }

  if (isLoading) {
    return (
      <Center p={8}>
        <VStack gap={4}>
          <Spinner size="xl" />
          <Text>Loading store details...</Text>
        </VStack>
      </Center>
    )
  }

  if (isError || !storeResponse?.data) {
    return (
      <Box p={6}>
        <Button onClick={() => router.back()} mb={4}>
          <FiArrowLeft />
          <Text ml={2}>Back</Text>
        </Button>
        <Box bg="red.50" p={4} borderRadius="md" borderColor="red.200" borderWidth="1px">
          <Text color="red.600">
            Error loading store: {error instanceof Error ? error.message : 'Store not found'}
          </Text>
        </Box>
      </Box>
    )
  }

  const store = storeResponse.data

  return (
    <Box p={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <HStack gap={4}>
          <Button onClick={() => router.back()} variant="outline">
            <FiArrowLeft />
            <Text ml={2}>Back</Text>
          </Button>
          <Box>
            <Heading size="xl">{store.name}</Heading>
            <Text color="gray.600">
              Created on {formatDate(store.createdAt)}
            </Text>
          </Box>
        </HStack>
        
        <HStack gap={2}>
          <Button
            onClick={() => setIsEditModalOpen(true)}
            colorScheme="blue"
            variant="outline"
          >
            <FiEdit />
            <Text ml={2}>Edit Store</Text>
          </Button>
          <Button
            onClick={handleGenerateApiKey}
            variant="outline"
            loading={generateApiKeyMutation.isPending}
          >
            <FiKey />
            <Text ml={2}>Generate API Key</Text>
          </Button>
          <Button
            onClick={handleTestConnection}
            variant="outline"
            loading={testConnectionMutation.isPending}
          >
            <FiRefreshCw />
            <Text ml={2}>Test Connection</Text>
          </Button>
          <Button
            onClick={() => window.open(store.url, '_blank')}
            variant="outline"
          >
            <FiExternalLink />
            <Text ml={2}>Visit Store</Text>
          </Button>
          <Button
            onClick={handleDeleteStore}
            colorScheme="red"
            variant="outline"
            loading={deleteStoreMutation.isPending}
          >
            <FiTrash2 />
            <Text ml={2}>Delete</Text>
          </Button>
        </HStack>
      </Flex>

      {/* Store Overview */}
      <Box bg="white" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.200" shadow="sm" mb={6}>
        <Flex justify="space-between" align="start" mb={4}>
          <VStack align="start" gap={2}>
            <Text fontSize="lg" fontWeight="semibold">Store Overview</Text>
            <HStack gap={4}>
              <Badge colorScheme={getStatusColor(store.status, store.isActive)}>
                {store.isActive ? store.status.toLowerCase() : 'inactive'}
              </Badge>
              <Text fontSize="sm" color="gray.600">
                URL: {store.url}
              </Text>
            </HStack>
          </VStack>
        </Flex>

        {store.description && (
          <Box mt={4} p={3} bg="gray.50" borderRadius="md">
            <Text fontSize="sm" fontWeight="medium" mb={1}>Description:</Text>
            <Text fontSize="sm" color="gray.700">{store.description}</Text>
          </Box>
        )}
      </Box>

      {/* Main Content Grid */}
      <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
        {/* Left Column - Store Details */}
        <VStack flex="2" gap={6} align="stretch">
          <Box bg="white" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.200" shadow="sm">
            <Text fontSize="lg" fontWeight="semibold" mb={4}>Store Configuration</Text>
            <VStack gap={4} align="stretch">
              <Flex justify="space-between">
                <Text fontWeight="medium">Store Name:</Text>
                <Text>{store.name}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontWeight="medium">Store URL:</Text>
                <Link color="blue.500" href={store.url} target="_blank" rel="noopener noreferrer">
                  {store.url}
                </Link>
              </Flex>
              <Flex justify="space-between">
                <Text fontWeight="medium">Currency:</Text>
                <Text>{store.currency}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontWeight="medium">Timezone:</Text>
                <Text>{store.timezone}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontWeight="medium">Status:</Text>
                <Badge colorScheme={getStatusColor(store.status, store.isActive)}>
                  {store.isActive ? store.status.toLowerCase() : 'inactive'}
                </Badge>
              </Flex>
            </VStack>
          </Box>
        </VStack>

        {/* Right Column - Contact & Stats */}
        <VStack flex="1" gap={6} align="stretch">
          {/* Contact Information */}
          <Box bg="white" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.200" shadow="sm">
            <Text fontSize="lg" fontWeight="semibold" mb={4}>Contact Information</Text>
            <VStack gap={3} align="stretch">
              {store.contactEmail ? (
                <Flex justify="space-between">
                  <Text fontWeight="medium">Email:</Text>
                  <Link color="blue.500" href={`mailto:${store.contactEmail}`}>
                    {store.contactEmail}
                  </Link>
                </Flex>
              ) : (
                <Text color="gray.500" fontSize="sm">No contact email provided</Text>
              )}
              
              {store.contactPhone ? (
                <Flex justify="space-between">
                  <Text fontWeight="medium">Phone:</Text>
                  <Text>{store.contactPhone}</Text>
                </Flex>
              ) : (
                <Text color="gray.500" fontSize="sm">No contact phone provided</Text>
              )}
            </VStack>
          </Box>

          {/* Store Timestamps */}
          <Box bg="white" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.200" shadow="sm">
            <Text fontSize="lg" fontWeight="semibold" mb={4}>Store Timeline</Text>
            <VStack gap={3} align="stretch">
              <Flex justify="space-between">
                <Text fontWeight="medium">Created:</Text>
                <Text fontSize="sm">{formatDate(store.createdAt)}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontWeight="medium">Last Updated:</Text>
                <Text fontSize="sm">{formatDate(store.updatedAt)}</Text>
              </Flex>
            </VStack>
          </Box>
        </VStack>
      </Flex>

      {/* Modals */}
      <StoreApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        store={store}
      />

      <StoreEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        store={store}
      />
    </Box>
  )
}
