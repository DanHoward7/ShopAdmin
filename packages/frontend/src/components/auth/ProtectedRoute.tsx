'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Box, 
  Spinner, 
  Text, 
  VStack, 
  Button,
  Container
} from '@chakra-ui/react'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string | string[]
  fallback?: React.ReactNode
}

export function ProtectedRoute({ 
  children, 
  requiredRoles, 
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return fallback || (
      <Container maxW="md" h="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack gap={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">Loading...</Text>
        </VStack>
      </Container>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null // Router will handle redirect
  }

  // Check role permissions if required
  if (requiredRoles && !hasRole(requiredRoles)) {
    return (
      <Container maxW="md" h="100vh" display="flex" alignItems="center" justifyContent="center">
        <Box
          p={8}
          borderRadius="lg"
          bg="red.50"
          border="1px"
          borderColor="red.200"
          textAlign="center"
          maxW="sm"
        >
          {/* Error Icon Alternative */}
          <Box
            w="40px"
            h="40px"
            borderRadius="full"
            bg="red.500"
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="xl"
            fontWeight="bold"
            mx="auto"
            mb={4}
          >
            !
          </Box>
          
          <Text fontSize="lg" fontWeight="bold" color="red.800" mb={2}>
            Access Denied
          </Text>
          
          <Text color="red.700" mb={4}>
            You don't have permission to access this page.
            {user && (
              <Text mt={2} fontSize="sm" color="gray.600">
                Current role: <strong>{user.role}</strong>
              </Text>
            )}
          </Text>
          
          <Button
            colorScheme="blue"
            onClick={() => router.push('/')}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Container>
    )
  }

  return <>{children}</>
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: string | string[]
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requiredRoles={requiredRoles}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

// Role-based component wrapper
interface RoleGuardProps {
  children: React.ReactNode
  roles: string | string[]
  fallback?: React.ReactNode
}

export function RoleGuard({ children, roles, fallback }: RoleGuardProps) {
  const { hasRole } = useAuth()

  if (!hasRole(roles)) {
    return fallback || null
  }

  return <>{children}</>
}

// Permission-based component wrapper
interface PermissionGuardProps {
  children: React.ReactNode
  resource: string
  action: string
  fallback?: React.ReactNode
}

export function PermissionGuard({ 
  children, 
  resource, 
  action, 
  fallback 
}: PermissionGuardProps) {
  const { hasPermission } = useAuth()

  if (!hasPermission(resource, action)) {
    return fallback || null
  }

  return <>{children}</>
}
