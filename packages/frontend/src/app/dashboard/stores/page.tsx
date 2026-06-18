'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Badge,
  HStack,
  VStack,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { FiPlus, FiShoppingBag } from 'react-icons/fi'
import { useStores, useCreateStore, useDeleteStore } from '@/hooks/useStores'
import { StoresTable } from '@/components/stores/StoresTable'
import { StoreCreateModal } from '@/components/stores/StoreCreateModal'
import { StoreStatsCard } from '@/components/stores/StoreStatsCard'
import type { StoreQueryParams } from '@/lib/stores-api'

export default function StoresPage() {
  const router = useRouter()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Build query parameters
  const queryParams: StoreQueryParams = {
    page: currentPage,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }

  // Fetch stores with React Query
  const { data, isLoading, isError, error } = useStores(queryParams)
  const createStoreMutation = useCreateStore()
  const deleteStoreMutation = useDeleteStore()

  const handleViewStore = (storeId: string) => {
    router.push(`/dashboard/stores/${storeId}`)
  }

  const handleEditStore = (storeId: string) => {
    router.push(`/dashboard/stores/${storeId}`)
  }

  const handleDeleteStore = async (storeId: string) => {
    if (confirm('Are you sure you want to delete this store? This will also delete all associated orders.')) {
      try {
        await deleteStoreMutation.mutateAsync(storeId)
        alert('Store deleted successfully')
      } catch (error) {
        alert('Failed to delete store')
      }
    }
  }

  const handleGenerateApiKey = (storeId: string) => {
    router.push(`/dashboard/stores/${storeId}`)
  }

  if (isError) {
    return (
      <Box p={6}>
        <Heading size="xl" mb={4}>Stores</Heading>
        <Box bg="red.50" p={4} borderRadius="md" borderColor="red.200" borderWidth="1px">
          <Text color="red.600">
            Error loading stores: {error instanceof Error ? error.message : 'Unknown error'}
          </Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box p={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="xl" mb={2}>Stores</Heading>
          <Text color="gray.600">
            Manage your connected ecommerce stores
          </Text>
        </Box>
        <Button 
          colorScheme="blue"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <FiPlus />
          <Text ml={2}>Connect Store</Text>
        </Button>
      </Flex>

      {/* Stats Overview */}
      {data?.data && data.data.length > 0 && (
        <HStack gap={6} mb={6} overflowX="auto">
          <StoreStatsCard
            title="Total Stores"
            value={data.data.length}
            icon={FiShoppingBag}
            color="blue"
          />
          <StoreStatsCard
            title="Active Stores"
            value={data.data.filter(store => store.isActive).length}
            icon={FiShoppingBag}
            color="green"
          />
          <StoreStatsCard
            title="Inactive Stores"
            value={data.data.filter(store => !store.isActive).length}
            icon={FiShoppingBag}
            color="gray"
          />
        </HStack>
      )}

      {/* Stores Content */}
      {isLoading ? (
        <Center p={8}>
          <VStack gap={4}>
            <Spinner size="xl" />
            <Text>Loading stores...</Text>
          </VStack>
        </Center>
      ) : data?.data && data.data.length > 0 ? (
        <VStack gap={6} align="stretch">
          <StoresTable
            stores={data.data}
            onViewStore={handleViewStore}
            onEditStore={handleEditStore}
            onDeleteStore={handleDeleteStore}
            onGenerateApiKey={handleGenerateApiKey}
          />

          {/* Pagination */}
          {data.pagination && data.pagination.totalPages > 1 && (
            <Flex justify="center" mt={6}>
              <HStack gap={2}>
                <Button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                
                <Text px={4} py={2}>
                  Page {currentPage} of {data.pagination.totalPages}
                </Text>
                
                <Button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === data.pagination.totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </HStack>
            </Flex>
          )}
        </VStack>
      ) : (
        /* Empty State */
        <Center p={12}>
          <VStack gap={6} maxW="md" textAlign="center">
            <Box
              w={20}
              h={20}
              borderRadius="full"
              bg="gray.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FiShoppingBag size={40} color="var(--chakra-colors-gray-400)" />
            </Box>
            <VStack gap={2}>
              <Heading size="lg">No stores connected</Heading>
              <Text color="gray.600">
                Connect your first ecommerce store to start managing orders in one place
              </Text>
            </VStack>
            <Button 
              colorScheme="blue" 
              size="lg"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <FiPlus />
              <Text ml={2}>Connect Your First Store</Text>
            </Button>
          </VStack>
        </Center>
      )}

      {/* Create Store Modal */}
      <StoreCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createStoreMutation.mutateAsync}
        isLoading={createStoreMutation.isPending}
      />
    </Box>
  )
}
