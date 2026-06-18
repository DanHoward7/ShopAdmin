'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  HStack,
  Flex,
  Textarea,
} from '@chakra-ui/react'
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi'
import type { OrderStatus } from '@/types/api'

interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
}

interface OrderCreateData {
  storeId: string
  customerId?: string
  customerEmail?: string
  status: OrderStatus
  items: OrderItem[]
  shippingCost?: number
  taxAmount?: number
  notes?: string
  paymentMethod?: string
  shippingAddress?: {
    line1: string
    line2?: string
    city: string
    state?: string
    postalCode: string
    country: string
  }
  billingAddress?: {
    line1: string
    line2?: string
    city: string
    state?: string
    postalCode: string
    country: string
  }
}

interface OrderCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: OrderCreateData) => Promise<void>
  isLoading?: boolean
  stores?: Array<{ id: string; name: string }>
}

export function OrderCreateModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  stores = [],
}: OrderCreateModalProps) {
  const [formData, setFormData] = useState<OrderCreateData>({
    storeId: '',
    customerEmail: '',
    status: 'PENDING',
    items: [{ productId: '', name: '', quantity: 1, price: 0 }],
    shippingCost: 0,
    taxAmount: 0,
    notes: '',
    paymentMethod: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', name: '', quantity: 1, price: 0 }],
    })
  }

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const calculateTotal = () => {
    const itemsTotal = formData.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return itemsTotal + (formData.shippingCost || 0) + (formData.taxAmount || 0)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.storeId) newErrors.storeId = 'Store is required'
    if (!formData.customerEmail) newErrors.customerEmail = 'Customer email is required'
    if (formData.items.length === 0) newErrors.items = 'At least one item is required'
    
    formData.items.forEach((item, index) => {
      if (!item.name) newErrors[`item_${index}_name`] = 'Item name is required'
      if (item.quantity <= 0) newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0'
      if (item.price <= 0) newErrors[`item_${index}_price`] = 'Price must be greater than 0'
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      await onSubmit(formData)
      handleClose()
    } catch (error) {
      console.error('Failed to create order:', error)
    }
  }

  const handleClose = () => {
    setFormData({
      storeId: '',
      customerEmail: '',
      status: 'PENDING',
      items: [{ productId: '', name: '', quantity: 1, price: 0 }],
      shippingCost: 0,
      taxAmount: 0,
      notes: '',
      paymentMethod: '',
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
      onClick={handleClose}
    >
      <Box
        bg="white"
        borderRadius="lg"
        boxShadow="xl"
        maxW="4xl"
        w="full"
        maxH="90vh"
        overflow="auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Flex justify="space-between" align="center" p={6} borderBottom="1px" borderColor="gray.200">
          <Text fontSize="xl" fontWeight="bold">Create New Order</Text>
          <Button onClick={handleClose} variant="ghost" size="sm">
            <FiX size={20} />
          </Button>
        </Flex>

        {/* Body */}
        <Box p={6}>
          <VStack gap={6} align="stretch">
            {/* Store Selection */}
            <Box>
              <Text fontWeight="medium" mb={2}>Store *</Text>
              <select
                value={formData.storeId}
                onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #D1D5DB',
                  fontSize: '1rem',
                }}
              >
                <option value="">Select store</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              {errors.storeId && <Text color="red.500" fontSize="sm" mt={1}>{errors.storeId}</Text>}
            </Box>

            {/* Customer Email */}
            <Box>
              <Text fontWeight="medium" mb={2}>Customer Email *</Text>
              <Input
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="customer@example.com"
              />
              {errors.customerEmail && <Text color="red.500" fontSize="sm" mt={1}>{errors.customerEmail}</Text>}
            </Box>

            {/* Order Status */}
            <Box>
              <Text fontWeight="medium" mb={2}>Status</Text>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as OrderStatus })}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #D1D5DB',
                  fontSize: '1rem',
                }}
              >
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </Box>

            {/* Order Items */}
            <Box>
              <Flex justify="space-between" align="center" mb={3}>
                <Text fontWeight="medium">Order Items *</Text>
                <Button onClick={handleAddItem} size="sm" colorScheme="blue" variant="outline">
                  <FiPlus />
                  <Text ml={2}>Add Item</Text>
                </Button>
              </Flex>

              <VStack gap={4} align="stretch">
                {formData.items.map((item, index) => (
                  <Box key={index} p={4} bg="gray.50" borderRadius="md">
                    <Flex justify="space-between" align="start" mb={3}>
                      <Text fontWeight="medium" fontSize="sm">Item {index + 1}</Text>
                      {formData.items.length > 1 && (
                        <Button
                          onClick={() => handleRemoveItem(index)}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                        >
                          <FiTrash2 />
                        </Button>
                      )}
                    </Flex>

                    <VStack gap={3} align="stretch">
                      <Box>
                        <Text fontSize="sm" mb={1}>Product Name *</Text>
                        <Input
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          placeholder="Product name"
                          size="sm"
                        />
                        {errors[`item_${index}_name`] && (
                          <Text color="red.500" fontSize="xs" mt={1}>{errors[`item_${index}_name`]}</Text>
                        )}
                      </Box>

                      <HStack gap={3}>
                        <Box flex={1}>
                          <Text fontSize="sm" mb={1}>Quantity *</Text>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                            min={1}
                            size="sm"
                          />
                          {errors[`item_${index}_quantity`] && (
                            <Text color="red.500" fontSize="xs" mt={1}>{errors[`item_${index}_quantity`]}</Text>
                          )}
                        </Box>

                        <Box flex={1}>
                          <Text fontSize="sm" mb={1}>Price *</Text>
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                            min={0}
                            step={0.01}
                            size="sm"
                          />
                          {errors[`item_${index}_price`] && (
                            <Text color="red.500" fontSize="xs" mt={1}>{errors[`item_${index}_price`]}</Text>
                          )}
                        </Box>

                        <Box flex={1}>
                          <Text fontSize="sm" mb={1}>Total</Text>
                          <Text fontWeight="bold" fontSize="sm" pt={2}>
                            ${(item.quantity * item.price).toFixed(2)}
                          </Text>
                        </Box>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Additional Costs */}
            <HStack gap={4}>
              <Box flex={1}>
                <Text fontWeight="medium" mb={2}>Shipping Cost</Text>
                <Input
                  type="number"
                  value={formData.shippingCost}
                  onChange={(e) => setFormData({ ...formData, shippingCost: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                />
              </Box>

              <Box flex={1}>
                <Text fontWeight="medium" mb={2}>Tax Amount</Text>
                <Input
                  type="number"
                  value={formData.taxAmount}
                  onChange={(e) => setFormData({ ...formData, taxAmount: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                />
              </Box>
            </HStack>

            {/* Payment Method */}
            <Box>
              <Text fontWeight="medium" mb={2}>Payment Method</Text>
              <Input
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                placeholder="Credit Card, PayPal, etc."
              />
            </Box>

            {/* Notes */}
            <Box>
              <Text fontWeight="medium" mb={2}>Notes</Text>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </Box>

            {/* Order Total */}
            <Box p={4} bg="blue.50" borderRadius="md">
              <Flex justify="space-between" align="center">
                <Text fontWeight="bold" fontSize="lg">Order Total:</Text>
                <Text fontWeight="bold" fontSize="2xl" color="blue.600">
                  ${calculateTotal().toFixed(2)}
                </Text>
              </Flex>
            </Box>
          </VStack>
        </Box>

        {/* Footer */}
        <Flex justify="flex-end" gap={3} p={6} borderTop="1px" borderColor="gray.200">
          <Button onClick={handleClose} variant="outline" disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} colorScheme="blue" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Order'}
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}
