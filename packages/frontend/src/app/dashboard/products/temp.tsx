'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Text, Spinner, Center } from '@chakra-ui/react'

export default function DashboardProductsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the working products page
    router.push('/products')
  }, [router])

  return (
    <Center h="100vh">
      <Box textAlign="center">
        <Spinner size="lg" mb={4} />
        <Text>Redirecting to Products...</Text>
      </Box>
    </Center>
  )
}
