'use client'

import {
  Box,
  Flex,
  VStack,
  Text,
  Link
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FiHome, 
  FiShoppingCart, 
  FiPackage, 
  FiShoppingBag,
  FiBarChart2, 
  FiSettings, 
  FiUsers,
} from 'react-icons/fi'

interface NavItemProps {
  icon: React.ElementType
  children: string
  href: string
  isActive?: boolean
}

const NavItem = ({ icon: IconComponent, children, href, isActive }: NavItemProps) => {
  return (
    <Link 
      as={NextLink}
      href={href}
      style={{ textDecoration: 'none' }}
    >
      <Flex
        align="center"
        p={4}
        mx={4}
        borderRadius="lg"
        cursor="pointer"
        bg={isActive ? 'blue.50' : 'transparent'}
        color={isActive ? 'blue.700' : 'gray.600'}
        _hover={{
          bg: 'blue.50',
          color: 'blue.700',
        }}
        transition="all 0.2s"
      >
        <Box mr={4} fontSize="16px">
          <IconComponent />
        </Box>
        <Text fontWeight={isActive ? 'medium' : 'normal'}>
          {children}
        </Text>
      </Flex>
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', icon: FiHome, href: '/dashboard' },
    { name: 'Orders', icon: FiShoppingCart, href: '/dashboard/orders' },
    { name: 'Products', icon: FiPackage, href: '/dashboard/products' },
    { name: 'Stores', icon: FiShoppingBag, href: '/dashboard/stores' },
    { name: 'Customers', icon: FiUsers, href: '/dashboard/customers' },
    { name: 'Analytics', icon: FiBarChart2, href: '/analytics' },
    { name: 'Settings', icon: FiSettings, href: '/settings' },
  ]

  return (
    <Box
      bg="white"
      borderRight="1px"
      borderRightColor="gray.200"
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold" color="gray.800">
          ShopAdmin
        </Text>
      </Flex>
      <VStack gap={1} align="stretch">
        {navItems.map((item) => (
          <NavItem 
            key={item.name} 
            icon={item.icon} 
            href={item.href}
            isActive={pathname === item.href}
          >
            {item.name}
          </NavItem>
        ))}
      </VStack>
      <Box h="1px" bg="gray.200" my={6} />
      <Box px={8} pb={4}>
        <Text fontSize="xs" color="gray.500">
          ShopAdmin v1.0.0
        </Text>
      </Box>
    </Box>
  )
}
