'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Text,
  Badge,
  Spinner,
  HStack,
  VStack,
  Grid,
} from '@chakra-ui/react'
import { FiMail, FiPhone, FiShoppingBag, FiSearch, FiEye, FiUser } from 'react-icons/fi'
import { useCustomers } from '@/hooks/useCustomers'

export default function CustomersPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const { data, isLoading, error } = useCustomers({
    page,
    limit,
    search: debouncedSearch,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  // Debounce search input
  const handleSearchChange = (value: string) => {
    setSearch(value)
    const timer = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1) // Reset to first page on search
    }, 500)
    return () => clearTimeout(timer)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box bg="red.50" p={4} borderRadius="md">
          <Text color="red.600">Failed to load customers. Please try again.</Text>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg" mb={2}>
            Customers
          </Heading>
          <Text color="gray.600">
            Manage customer information and view purchase history
          </Text>
        </Box>
      </Flex>

      {/* Search Bar */}
      <Box bg="white" p={4} borderRadius="lg" boxShadow="sm" mb={6}>
        <Flex align="center" gap={2}>
          <Box color="gray.400">
            <FiSearch size={20} />
          </Box>
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            variant="outline"
            border="none"
            _focus={{ boxShadow: 'none' }}
            flex={1}
          />
        </Flex>
      </Box>

      {/* Customers Grid */}
      {isLoading ? (
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" colorPalette="blue" />
        </Flex>
      ) : !data?.data || data.data.length === 0 ? (
        <Flex direction="column" align="center" justify="center" minH="400px" p={8}>
          <Box mb={4} p={4} bg="gray.50" borderRadius="full">
            <FiUser size={48} color="gray" />
          </Box>
          <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={2}>
            No customers found
          </Text>
          <Text color="gray.500">
            {search ? 'Try adjusting your search criteria' : 'Customers will appear here when available'}
          </Text>
        </Flex>
      ) : (
        <>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
            {data.data.map((customer) => (
              <Box
                key={customer.id}
                bg="white"
                borderRadius="lg"
                boxShadow="sm"
                p={6}
                _hover={{ boxShadow: 'md', transform: 'translateY(-2px)', cursor: 'pointer' }}
                transition="all 0.2s"
                onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
              >
                  {/* Customer Name */}
                  <Flex align="start" justify="space-between" mb={4}>
                    <VStack align="start" gap={1}>
                      <Text fontWeight="bold" fontSize="lg">
                        {customer.firstName && customer.lastName
                          ? `${customer.firstName} ${customer.lastName}`
                          : customer.email.split('@')[0]}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Joined {formatDate(customer.createdAt)}
                      </Text>
                    </VStack>
                    <Box p={2} bg="blue.50" borderRadius="full">
                      <FiUser color="blue" size={20} />
                    </Box>
                  </Flex>

                  {/* Contact Info */}
                  <VStack align="stretch" gap={2} mb={4}>
                    <Flex align="center" gap={2}>
                      <FiMail size={14} color="gray" />
                      <Text fontSize="sm" color="gray.600" truncate>
                        {customer.email}
                      </Text>
                    </Flex>
                    {customer.phone && (
                      <Flex align="center" gap={2}>
                        <FiPhone size={14} color="gray" />
                        <Text fontSize="sm" color="gray.600">
                          {customer.phone}
                        </Text>
                      </Flex>
                    )}
                    <Flex align="center" gap={2}>
                      <FiShoppingBag size={14} color="gray" />
                      <Text fontSize="sm" color="gray.600" truncate>
                        {customer.store.name}
                      </Text>
                    </Flex>
                  </VStack>

                  {/* Stats */}
                  <Flex justify="space-between" pt={4} borderTop="1px" borderColor="gray.200">
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Orders
                      </Text>
                      <Badge colorPalette="blue" size="sm">
                        {customer.totalOrders || 0}
                      </Badge>
                    </Box>
                    <Box textAlign="right">
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Total Spent
                      </Text>
                      <Text fontWeight="bold" fontSize="md" color="green.600">
                        {formatCurrency(customer.totalSpent || 0)}
                      </Text>
                    </Box>
                  </Flex>
              </Box>
            ))}
          </Grid>

          {/* Pagination */}
          {data.pagination && data.pagination.totalPages > 1 && (
            <Flex justify="space-between" align="center" mt={8}>
              <Text fontSize="sm" color="gray.600">
                Showing {(page - 1) * limit + 1} to{' '}
                {Math.min(page * limit, data.pagination.total)} of {data.pagination.total} customers
              </Text>
              <HStack gap={2}>
                <Button size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                  Previous
                </Button>
                <Text fontSize="sm" px={2}>
                  Page {page} of {data.pagination.totalPages}
                </Text>
                <Button
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.pagination.totalPages}
                >
                  Next
                </Button>
              </HStack>
            </Flex>
          )}
        </>
      )}
    </Container>
  )
}
