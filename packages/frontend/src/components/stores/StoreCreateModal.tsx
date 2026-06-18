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
import type { CreateStoreData } from '@/lib/stores-api'

interface StoreCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateStoreData) => Promise<any>
  isLoading: boolean
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

export function StoreCreateModal({ isOpen, onClose, onSubmit, isLoading }: StoreCreateModalProps) {
  const [formData, setFormData] = useState<CreateStoreData>({
    name: '',
    url: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    timezone: 'UTC',
    currency: 'USD',
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const handleInputChange = (field: keyof CreateStoreData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Store name is required'
    }

    if (!formData.url.trim()) {
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
      await onSubmit(formData)
      onClose()
      setFormData({
        name: '',
        url: '',
        description: '',
        contactEmail: '',
        contactPhone: '',
        timezone: 'UTC',
        currency: 'USD',
      })
      setErrors({})
    } catch (error) {
      console.error('Failed to create store:', error)
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
          Connect New Store
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
              <select
                style={{
                  width: '100%',
                  padding: '8px',
                  borderWidth: '1px',
                  borderColor: 'var(--chakra-colors-gray-200)',
                  borderRadius: '6px',
                  borderStyle: 'solid',
                  backgroundColor: 'white',
                  fontSize: '14px'
                }}
                value={formData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </Box>
            
            <Box flex="1">
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Currency
              </Text>
              <select
                style={{
                  width: '100%',
                  padding: '8px',
                  borderWidth: '1px',
                  borderColor: 'var(--chakra-colors-gray-200)',
                  borderRadius: '6px',
                  borderStyle: 'solid',
                  backgroundColor: 'white',
                  fontSize: '14px'
                }}
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
              >
                {currencies.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
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
            loading={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Connect Store'}
          </Button>
        </HStack>
      </Box>
    </Box>
  )
}
