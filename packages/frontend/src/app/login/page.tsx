'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Text,
  VStack,
  Flex
} from '@chakra-ui/react'
import { useAuth } from '@/contexts/AuthContext'
import { LoginCredentials } from '@/types/auth'

// Simple form validation
interface LoginFormData {
  email: string
  password: string
}

const validateForm = (data: LoginFormData) => {
  const errors: Partial<LoginFormData> = {}
  if (!data.email) errors.email = 'Email is required'
  if (!data.email.includes('@')) errors.email = 'Invalid email format'
  if (!data.password) errors.password = 'Password is required'
  return errors
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<LoginFormData>>({})
  
  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = { email, password }
    const validationErrors = validateForm(formData)
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    try {
      setIsSubmitting(true)
      setLoginError(null)
      setErrors({})
      await login(formData as LoginCredentials)
    } catch (error) {
      setLoginError('Login failed. Please check your credentials and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Container maxW="md" h="100vh" display="flex" alignItems="center" justifyContent="center">
        <Text>Loading...</Text>
      </Container>
    )
  }

  return (
    <Box minH="100vh" bg="gray.50" py={12} px={6}>
      <Container maxW="md">
        <VStack gap={8}>
          {/* Logo/Brand */}
          <Flex direction="column" align="center" mb={8}>
            <Box p={4} bg="blue.500" borderRadius="lg" mb={4}>
              <Box color="white" fontSize="2xl" fontWeight="bold">🔒</Box>
            </Box>
            <Heading size="xl" textAlign="center" color="blue.500">
              ShopAdmin
            </Heading>
            <Text color="gray.600" textAlign="center">
              Multi-Store Order Management System
            </Text>
          </Flex>

          {/* Login Card */}
          <Box bg="white" shadow="xl" borderRadius="xl" p={8} w="full">
            <VStack gap={6}>
              <Box textAlign="center">
                <Heading size="lg" mb={2}>Sign In</Heading>
                <Text color="gray.600">
                  Enter your credentials to access your dashboard
                </Text>
              </Box>

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <VStack gap={6}>
                  {/* Login Error */}
                  {loginError && (
                    <Box p={4} bg="red.50" border="1px" borderColor="red.200" borderRadius="md" w="full">
                      <Text color="red.700" fontSize="sm">{loginError}</Text>
                    </Box>
                  )}

                  {/* Email Field */}
                  <Box w="full">
                    <Text mb={2} fontWeight="medium">Email Address</Text>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      size="lg"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      borderColor={errors.email ? 'red.300' : 'gray.300'}
                    />
                    {errors.email && (
                      <Text color="red.500" fontSize="sm" mt={1}>{errors.email}</Text>
                    )}
                  </Box>

                  {/* Password Field */}
                  <Box w="full">
                    <Text mb={2} fontWeight="medium">Password</Text>
                    <Box position="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        size="lg"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        borderColor={errors.password ? 'red.300' : 'gray.300'}
                        pr="4.5rem"
                      />
                      <Button
                        position="absolute"
                        right="0.5rem"
                        top="50%"
                        transform="translateY(-50%)"
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </Button>
                    </Box>
                    {errors.password && (
                      <Text color="red.500" fontSize="sm" mt={1}>{errors.password}</Text>
                    )}
                  </Box>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    width="full"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </Button>
                </VStack>
              </form>

              {/* Demo Credentials */}
              <Box w="full" pt={4} borderTop="1px" borderColor="gray.200">
                <Text fontSize="sm" color="gray.600" mb={3} textAlign="center">
                  Demo Credentials:
                </Text>
                <VStack gap={2} fontSize="sm" color="gray.700">
                  <Text><strong>Admin:</strong> admin@shopadmin.com / admin123</Text>
                  <Text><strong>Manager:</strong> manager@shopadmin.com / manager123</Text>
                  <Text><strong>Viewer:</strong> viewer@shopadmin.com / viewer123</Text>
                </VStack>
              </Box>
            </VStack>
          </Box>

          {/* Footer */}
          <Text fontSize="sm" color="gray.500" textAlign="center">
            © 2024 ShopAdmin. All rights reserved.
          </Text>
        </VStack>
      </Container>
    </Box>
  )
}
