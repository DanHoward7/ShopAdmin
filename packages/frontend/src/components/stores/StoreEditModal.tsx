'use client'

import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Input,
  Textarea,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useUpdateStore } from '@/hooks/useStores'
import type { Store } from '@/types/api'
import type { UpdateStoreData } from '@/lib/stores-api'

interface StoreEditModalProps {
  isOpen: boolean
  onClose: () => void
  store: Store
}

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
]

const currencies = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CAD',
  'AUD',
  'CHF',
  'CNY',
]

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'INACTIVE', label: 'Inactive' },
]

export function StoreEditModal({ isOpen, onClose, store }: StoreEditModalProps) {
  const [formData, setFormData] = useState<UpdateStoreData>({
    name: store.name,
    url: store.url,
    description: store.description || '',
    contactEmail: store.contactEmail || '',
    contactPhone: store.contactPhone || '',
    timezone: store.timezone,
    currency: store.currency,
    status: store.status,
    isActive: store.isActive,
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const updateStoreMutation = useUpdateStore()

  if (!isOpen) return null

  const handleInputChange = (field: keyof UpdateStoreData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Store name is required'
    }

    if (!formData.url?.trim()) {
      newErrors.url = 'Store URL is required'
    } else if (!/^https?:\/\/.+/.test(formData.url)) {
      newErrors.url = 'URL must start with http:// or https://'
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      await updateStoreMutation.mutateAsync({ id: store.id, data: formData })
      onClose()
      alert('Store updated successfully')
    } catch (error) {
      alert('Failed to update store')
    }
  }

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
    >
      <Box
        bg="white"
        borderRadius="lg"
        p={6}
        maxW="lg"
        w="full"
        mx={4}
        shadow="xl"
        maxH="90vh"
        overflowY="auto"
      >
        <Text fontSize="lg" fontWeight="semibold" mb={6}>
          Edit Store: {store.name}
        </Text>
        
        <VStack gap={4} align="stretch">
          {/* Store Name */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Store Name *
            </Text>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="My Awesome Store"
            />
            {errors.name && (
              <Text fontSize="sm" color="red.500" mt={1}>
                {errors.name}
              </Text>
            )}
          </Box>

          {/* Store URL */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Store URL *
            </Text>
            <Input
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://mystore.com"
            />
            {errors.url && (
              <Text fontSize="sm" color="red.500" mt={1}>
                {errors.url}
              </Text>
            )}
          </Box>

          {/* Description */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Description
            </Text>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of your store..."
              rows={3}
            />
          </Box>

          {/* Contact Information */}
          <HStack gap={4}>
            <Box flex="1">
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Contact Email
              </Text>
              <Input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="contact@store.com"
              />
              {errors.contactEmail && (
                <Text fontSize="sm" color="red.500" mt={1}>
                  {errors.contactEmail}
                </Text>
              )}
            </Box>
            
            <Box flex="1">
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Contact Phone
              </Text>
              <Input
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </Box>
          </HStack>

          {/* Timezone and Currency */}
          <HStack gap={4}>
            <Box flex="1">
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Timezone
              </Text>
              <Box
                as="select"
                w="full"
                p={2}
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                value={formData.timezone}
                onChange={(e: any) => handleInputChange('timezone', e.target.value)}
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </Box>
            </Box>
            
            <Box flex="1">
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Currency
              </Text>
              <Box
                as="select"
                w="full"
                p={2}
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                value={formData.currency}
                onChange={(e: any) => handleInputChange('currency', e.target.value)}
              >
                {currencies.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </Box>
            </Box>
          </HStack>

          {/* Status and Active */}
          <HStack gap={4}>
            <Box flex="1">
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Status
              </Text>
              <Box
                as="select"
                w="full"
                p={2}
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                value={formData.status}
                onChange={(e: any) => handleInputChange('status', e.target.value)}
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </Box>
            </Box>
            
            <Box flex="1">
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Active
              </Text>
              <Box
                as="select"
                w="full"
                p={2}
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e: any) => handleInputChange('isActive', e.target.value === 'true')}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Box>
            </Box>
          </HStack>
        </VStack>
        
        <HStack justify="end" gap={3} mt={8}>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            colorScheme="blue"
            loading={updateStoreMutation.isPending}
          >
            {updateStoreMutation.isPending ? 'Updating...' : 'Update Store'}
          </Button>
        </HStack>
      </Box>
    </Box>
  )
}
