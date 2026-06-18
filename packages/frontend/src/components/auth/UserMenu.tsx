'use client'

import {
  Box,
  Text,
  HStack,
  Button
} from '@chakra-ui/react'
import { useAuth } from '@/contexts/AuthContext'

export function UserMenu() {
  const { user, logout } = useAuth()

  // Simple logout confirmation
  const handleLogoutClick = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout()
    }
  }

  if (!user) return null

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'red'
      case 'MANAGER':
        return 'blue'
      case 'VIEWER':
        return 'green'
      default:
        return 'gray'
    }
  }

  return (
    <HStack gap={4} p={2}>
      {/* User Info */}
      <HStack gap={3}>
        {/* Simple Avatar Alternative */}
        <Box
          w="32px"
          h="32px"
          borderRadius="full"
          bg={getRoleBadgeColor(user.role) + '.500'}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          fontSize="sm"
          fontWeight="bold"
        >
          {user.name.charAt(0).toUpperCase()}
        </Box>
        <Box>
          <Text fontSize="sm" fontWeight="medium">
            {user.name}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {user.email}
          </Text>
        </Box>
        {/* Simple Badge Alternative */}
        <Box
          px={2}
          py={1}
          borderRadius="md"
          bg={getRoleBadgeColor(user.role) + '.100'}
          color={getRoleBadgeColor(user.role) + '.800'}
          fontSize="xs"
          fontWeight="medium"
        >
          {user.role}
        </Box>
      </HStack>

      {/* Logout Button */}
      <Button
        size="sm"
        colorScheme="red"
        variant="outline"
        onClick={handleLogoutClick}
      >
        Sign Out
      </Button>
    </HStack>
  )
}
