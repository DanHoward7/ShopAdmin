'use client'

import {
  Box,
  Flex,
  Text,
  IconButton
} from '@chakra-ui/react'
import { FiMenu, FiBell } from 'react-icons/fi'
import { UserMenu } from '@/components/auth/UserMenu'

export function Header({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) {
  return (
    <Box>
      <Flex
        bg="white"
        color="gray.600"
        minH="60px"
        py={2}
        px={4}
        borderBottom="1px"
        borderStyle="solid"
        borderColor="gray.200"
        align="center"
        justify="space-between"
      >
        {/* Mobile Menu Toggle */}
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onMobileMenuToggle}
            aria-label="Toggle Navigation"
            variant="ghost"
          >
            <FiMenu />
          </IconButton>
        </Flex>
        
        {/* Logo/Brand */}
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Text
            textAlign={{ base: 'center', md: 'left' }}
            fontWeight="bold"
            color="gray.800"
            display={{ base: 'none', md: 'block' }}
            fontSize="xl"
          >
            ShopAdmin
          </Text>
        </Flex>

        {/* Right Side Actions */}
        <Flex
          flex={{ base: 1, md: 0 }}
          justify="flex-end"
          direction="row"
          gap={4}
          align="center"
        >
          {/* Notifications */}
          <IconButton
            aria-label="Notifications"
            variant="ghost"
            colorScheme="gray"
          >
            <FiBell />
          </IconButton>
          
          {/* User Menu */}
          <UserMenu />
        </Flex>
      </Flex>
    </Box>
  )
}
