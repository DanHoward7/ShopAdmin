'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Flex,
} from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'
import { useOrders, useDeleteOrder, useExportOrders, useCreateOrder } from '@/hooks/useOrders'
import { useStores } from '@/hooks/useStores'
import type { OrderStatus, OrderQueryParams } from '@/types/api'
import { OrdersTable } from '@/components/orders/OrdersTable'
import { OrdersFilters } from '@/components/orders/OrdersFilters'
import { OrdersStats } from '@/components/orders/OrdersStats'
import { OrderCreateModal } from '@/components/orders/OrderCreateModal'

export default function OrdersPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  // Build query parameters
  const queryParams: OrderQueryParams = {
    page: currentPage,
    limit: 10,
    status: selectedStatus,
    orderNumber: searchTerm || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }

  // Fetch orders with React Query
  const { data, isLoading, isError, error } = useOrders(queryParams)
  const deleteOrderMutation = useDeleteOrder()
  const exportOrdersMutation = useExportOrders()
  const createOrderMutation = useCreateOrder()
  
  // Fetch stores for the create modal
  const { data: storesData } = useStores({ page: 1, limit: 100 })

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleStatusChange = (status?: OrderStatus) => {
    setSelectedStatus(status)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}`)
  }

  const handleEditOrder = (orderId: string) => {
    // TODO: Open edit modal or navigate to edit page
    console.log('Edit order:', orderId)
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrderMutation.mutateAsync(orderId)
        alert('Order deleted successfully')
      } catch (error) {
        alert('Failed to delete order')
      }
    }
  }

  const handleExport = async () => {
    try {
      const blob = await exportOrdersMutation.mutateAsync(queryParams)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'orders.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert('Failed to export orders')
    }
  }

  if (isError) {
    return (
      <Box p={6}>
        <Heading size="xl" mb={4}>Orders</Heading>
        <Box bg="red.50" p={4} borderRadius="md" borderColor="red.200" borderWidth="1px">
          <Text color="red.600">
            Error loading orders: {error instanceof Error ? error.message : 'Unknown error'}
          </Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="xl" mb={2}>Orders</Heading>
          <Text color="gray.600">
            Manage orders from all your stores
          </Text>
        </Box>
        <Button colorScheme="blue" onClick={() => setIsCreateModalOpen(true)}>
          <FiPlus />
          <Text ml={2}>Create Order</Text>
        </Button>
      </Flex>

      <VStack gap={6} align="stretch">
        <OrdersStats />
        
        <OrdersFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          onExport={handleExport}
        />

        <OrdersTable
          orders={data?.orders || []}
          isLoading={isLoading}
          onViewOrder={handleViewOrder}
          onEditOrder={handleEditOrder}
          onDeleteOrder={handleDeleteOrder}
        />

        {data?.pagination && data.pagination.totalPages > 1 && (
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

      {/* Create Order Modal */}
      <OrderCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (data) => {
          await createOrderMutation.mutateAsync(data)
          setIsCreateModalOpen(false)
        }}
        isLoading={createOrderMutation.isPending}
        stores={storesData?.data || []}
      />
    </Box>
  )
}
