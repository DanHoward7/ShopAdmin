'use client'

import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Input,
} from '@chakra-ui/react'
import { FiCopy, FiEye, FiEyeOff } from 'react-icons/fi'
import { useState } from 'react'
import type { Store } from '@/types/api'

interface StoreApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  store: Store
}

export function StoreApiKeyModal({ isOpen, onClose, store }: StoreApiKeyModalProps) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopyApiKey = async () => {
    if (store.apiKey) {
      try {
        await navigator.clipboard.writeText(store.apiKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy API key:', error)
      }
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
        maxW="md"
        w="full"
        mx={4}
        shadow="xl"
      >
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          API Key for {store.name}
        </Text>
        
        <VStack gap={4} align="stretch">
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              API Key
            </Text>
            <HStack>
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={store.apiKey || 'No API key generated'}
                readOnly
                bg="gray.50"
              />
              <Button
                onClick={() => setShowApiKey(!showApiKey)}
                variant="outline"
                size="sm"
              >
                {showApiKey ? <FiEyeOff /> : <FiEye />}
              </Button>
              <Button
                onClick={handleCopyApiKey}
                variant="outline"
                size="sm"
                colorScheme={copied ? 'green' : 'blue'}
                disabled={!store.apiKey}
              >
                <FiCopy />
                <Text ml={1}>{copied ? 'Copied!' : 'Copy'}</Text>
              </Button>
            </HStack>
          </Box>

          <Box p={4} bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200">
            <Text fontSize="sm" fontWeight="medium" mb={2} color="blue.800">
              Integration Instructions:
            </Text>
            <Text fontSize="sm" color="blue.700">
              Use this API key in your store's webhook configuration to send order data to ShopAdmin. 
              Include it in the Authorization header as "Bearer {store.apiKey || 'YOUR_API_KEY'}".
            </Text>
          </Box>

          <Box p={4} bg="orange.50" borderRadius="md" borderWidth="1px" borderColor="orange.200">
            <Text fontSize="sm" fontWeight="medium" mb={1} color="orange.800">
              Security Notice:
            </Text>
            <Text fontSize="sm" color="orange.700">
              Keep this API key secure and never share it publicly. If compromised, generate a new one immediately.
            </Text>
          </Box>
        </VStack>
        
        <HStack justify="end" gap={3} mt={6}>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </HStack>
      </Box>
    </Box>
  )
}
