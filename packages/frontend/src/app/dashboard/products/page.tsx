'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  Input,
  Flex,
  VStack,
  Spinner,
  Center,
  Badge,
} from '@chakra-ui/react'
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiEye, FiPackage } from 'react-icons/fi'
import { useProducts, useDeleteProduct } from '@/hooks/useProducts'
import { useStores } from '@/hooks/useStores'

const getStockStatusColor = (stock: number) => {
  if (stock === 0) return { bg: 'red.100', color: 'red.800', label: 'Out of Stock' }
  if (stock < 10) return { bg: 'orange.100', color: 'orange.800', label: 'Low Stock' }
  return { bg: 'green.100', color: 'green.800', label: 'In Stock' }
}

export default function ProductsPage() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStore, setSelectedStore] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const { data: productsData, isLoading, isError } = useProducts({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
    storeId: selectedStore || undefined,
    category: selectedCategory || undefined,
  })

  const { data: storesData } = useStores({ page: 1, limit: 100 })
  const deleteProductMutation = useDeleteProduct()

  const handleViewProduct = (productId: string) => {
    router.push(`/products/${productId}`)
  }

  const handleEditProduct = (productId: string) => {
    router.push(`/products/${productId}/edit`)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProductMutation.mutateAsync(productId)
        alert('Product deleted successfully')
      } catch (error) {
        alert('Failed to delete product')
      }
    }
  }

  const handleCreateProduct = () => {
    router.push('/products/new')
  }

  if (isError) {
    return (
      <Box p={8}>
        <Box bg="red.50" p={4} borderRadius="md">
          <Text color="red.600">Failed to load products. Please try again.</Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box p={8}>
        <Flex justify="space-between" align="center" mb={8}>
          <Box>
            <Heading size="xl" mb={2}>Products</Heading>
            <Text color="gray.600">
              Manage your product inventory
            </Text>
          </Box>
          <Button colorScheme="blue" onClick={handleCreateProduct}>
            <Box mr={2}><FiPlus /></Box>
            Add Product
          </Button>
        </Flex>

        {/* Search and Filters */}
        <Box bg="white" p={6} borderRadius="lg" shadow="sm" mb={6}>
          <Flex gap={4} align="center" wrap="wrap">
            <Box position="relative" maxW="400px" flex={1}>
              <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400">
                <FiSearch />
              </Box>
              <Input 
                pl={10} 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Box>
            
            <HStack gap={4}>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #D1D5DB',
                  fontSize: '0.875rem',
                }}
              >
                <option value="">All Stores</option>
                {storesData?.data?.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #D1D5DB',
                  fontSize: '0.875rem',
                }}
              >
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Footwear">Footwear</option>
                <option value="Home & Garden">Home & Garden</option>
                <option value="Office">Office</option>
                <option value="Clothing">Clothing</option>
              </select>
            </HStack>
          </Flex>
        </Box>

        {/* Products Table */}
        {isLoading ? (
          <Center p={12}>
            <VStack gap={4}>
              <Spinner size="xl" />
              <Text>Loading products...</Text>
            </VStack>
          </Center>
        ) : !productsData?.data || productsData.data.length === 0 ? (
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
                <FiPackage size={40} color="var(--chakra-colors-gray-400)" />
              </Box>
              <VStack gap={2}>
                <Heading size="lg">No products found</Heading>
                <Text color="gray.600">
                  {searchTerm || selectedStore || selectedCategory
                    ? 'Try adjusting your filters'
                    : 'Add your first product to get started'}
                </Text>
              </VStack>
              <Button colorScheme="blue" size="lg" onClick={handleCreateProduct}>
                <FiPlus />
                <Text ml={2}>Add Your First Product</Text>
              </Button>
            </VStack>
          </Center>
        ) : (
          <>
            <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
              {/* Table Header */}
              <Box bg="gray.50" p={4} borderBottom="1px" borderColor="gray.200">
                <Flex>
                  <Box flex="3" fontWeight="semibold" fontSize="sm" color="gray.600">Product</Box>
                  <Box flex="1" fontWeight="semibold" fontSize="sm" color="gray.600">SKU</Box>
                  <Box flex="1" fontWeight="semibold" fontSize="sm" color="gray.600">Price</Box>
                  <Box flex="1" fontWeight="semibold" fontSize="sm" color="gray.600">Stock</Box>
                  <Box flex="1" fontWeight="semibold" fontSize="sm" color="gray.600">Category</Box>
                  <Box flex="1" fontWeight="semibold" fontSize="sm" color="gray.600">Store</Box>
                  <Box flex="1" fontWeight="semibold" fontSize="sm" color="gray.600">Status</Box>
                  <Box flex="1" fontWeight="semibold" fontSize="sm" color="gray.600">Actions</Box>
                </Flex>
              </Box>

              {/* Table Body */}
              {productsData.data.map((product, index) => {
                const stockStatus = getStockStatusColor(product.stock)
                return (
                  <Box 
                    key={product.id} 
                    p={4} 
                    borderBottom={index < productsData.data.length - 1 ? "1px" : "none"} 
                    borderColor="gray.200"
                    _hover={{ bg: 'gray.50' }}
                  >
                    <Flex align="center">
                      <Box flex="3">
                        <HStack gap={3}>
                          <Box 
                            width="40px" 
                            height="40px" 
                            borderRadius="md" 
                            bg="gray.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="xs"
                            fontWeight="bold"
                            color="gray.500"
                          >
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.375rem' }} />
                            ) : (
                              'IMG'
                            )}
                          </Box>
                          <Text fontWeight="medium" fontSize="sm">{product.name}</Text>
                        </HStack>
                      </Box>
                      <Box flex="1" fontSize="sm" color="gray.600">{product.sku || '-'}</Box>
                      <Box flex="1" fontSize="sm" fontWeight="medium">${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price || '0').toFixed(2)}</Box>
                      <Box flex="1" fontSize="sm">{product.stock}</Box>
                      <Box flex="1">
                        {product.category && (
                          <Badge colorPalette="blue" size="sm">
                            {product.category}
                          </Badge>
                        )}
                      </Box>
                      <Box flex="1" fontSize="sm" color="gray.600">{product.store?.name || '-'}</Box>
                      <Box flex="1">
                        <Box
                          display="inline-block"
                          px={2}
                          py={1}
                          borderRadius="md"
                          fontSize="xs"
                          fontWeight="medium"
                          {...stockStatus}
                        >
                          {stockStatus.label}
                        </Box>
                      </Box>
                      <Box flex="1">
                        <HStack gap={1}>
                          <Button size="sm" variant="ghost" onClick={() => handleViewProduct(product.id)}>
                            <FiEye />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleEditProduct(product.id)}>
                            <FiEdit />
                          </Button>
                          <Button size="sm" variant="ghost" colorScheme="red" onClick={() => handleDeleteProduct(product.id)}>
                            <FiTrash2 />
                          </Button>
                        </HStack>
                      </Box>
                    </Flex>
                  </Box>
                )
              })}
            </Box>

            {/* Pagination */}
            {productsData.pagination && productsData.pagination.totalPages > 1 && (
              <Flex justify="space-between" align="center" mt={6}>
                <Text fontSize="sm" color="gray.500">
                  Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, productsData.pagination.total)} of {productsData.pagination.total} products
                </Text>
                <HStack gap={2}>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Text fontSize="sm" px={2}>
                    Page {currentPage} of {productsData.pagination.totalPages}
                  </Text>
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled={currentPage === productsData.pagination.totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </HStack>
              </Flex>
            )}
          </>
        )}
      </Box>
    )
}
