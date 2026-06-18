'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Text, Spinner, Center } from '@chakra-ui/react'

export default function DashboardSettingsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the working settings page
    router.push('/settings')
  }, [router])

  return (
    <Center h="100vh">
      <Box textAlign="center">
        <Spinner size="lg" mb={4} />
        <Text>Redirecting to Settings...</Text>
      </Box>
    </Center>
  )
}
