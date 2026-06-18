'use client'

import { useState } from 'react'
import { Box } from '@chakra-ui/react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <ProtectedRoute>
      <Box minH="100vh" bg="gray.50">
        {/* Desktop sidebar */}
        <Box display={{ base: 'none', md: 'block' }}>
          <Sidebar />
        </Box>
        
        {/* Mobile sidebar overlay */}
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <Box
              position="fixed"
              top="0"
              left="0"
              w="100vw"
              h="100vh"
              bg="blackAlpha.600"
              zIndex="overlay"
              display={{ base: 'block', md: 'none' }}
              onClick={toggleMobileMenu}
            />
            {/* Mobile sidebar */}
            <Box
              position="fixed"
              top="0"
              left="0"
              h="100vh"
              w="full"
              maxW="sm"
              zIndex="modal"
              display={{ base: 'block', md: 'none' }}
            >
              <Sidebar />
            </Box>
          </>
        )}
        
        {/* Header */}
        <Header onMobileMenuToggle={toggleMobileMenu} />
        
        {/* Main content */}
        <Box ml={{ base: 0, md: 60 }} p="4">
          {children}
        </Box>
      </Box>
    </ProtectedRoute>
  )
}
