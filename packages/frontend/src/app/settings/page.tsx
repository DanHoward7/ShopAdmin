'use client'

import {
  Box,
  Heading,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Flex,
} from '@chakra-ui/react'
import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  const handleSave = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      console.log('Settings saved successfully!')
      // TODO: Replace with proper notification system
    }, 1000)
  }

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'api', label: 'API Keys' },
    { id: 'users', label: 'Users' }
  ]

  return (
    <DashboardLayout>
      <Box p={8}>
        <Heading size="xl" mb={2}>Settings</Heading>
        <Text color="gray.600" mb={6}>
          Manage your application settings and preferences
        </Text>

        {/* Custom Tab Navigation */}
        <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
          {/* Tab Headers */}
          <Flex borderBottom="1px" borderColor="gray.200">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                px={6}
                py={4}
                borderRadius="none"
                borderBottom="2px"
                borderColor={activeTab === tab.id ? 'blue.500' : 'transparent'}
                color={activeTab === tab.id ? 'blue.600' : 'gray.600'}
                fontWeight={activeTab === tab.id ? 'semibold' : 'normal'}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </Flex>

          {/* Tab Content */}
          <Box p={6}>
            {activeTab === 'general' && (
              <VStack gap={6} align="start">
                <Heading size="md">General Settings</Heading>
                
                <Box w="full">
                  <Text mb={2} fontWeight="medium">Company Name</Text>
                  <Input defaultValue="ShopAdmin Inc." />
                </Box>

                <Box w="full">
                  <Text mb={2} fontWeight="medium">Time Zone</Text>
                  <Box as="select" w="full" p={2} border="1px" borderColor="gray.300" borderRadius="md">
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </Box>
                </Box>

                <Box w="full">
                  <Text mb={2} fontWeight="medium">Currency</Text>
                  <Box as="select" w="full" p={2} border="1px" borderColor="gray.300" borderRadius="md">
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </Box>
                </Box>

                <Flex align="center" justify="space-between" w="full">
                  <Text fontWeight="medium">Enable automatic order sync</Text>
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    style={{ width: '16px', height: '16px' }}
                  />
                </Flex>

                <Box h="1px" bg="gray.200" w="full" />

                <Button 
                  colorScheme="blue" 
                  onClick={handleSave}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </VStack>
            )}

            {activeTab === 'notifications' && (
              <VStack gap={6} align="start">
                <Heading size="md">Notification Preferences</Heading>
                
                <Flex align="center" justify="space-between" w="full">
                  <Text fontWeight="medium">Email notifications for new orders</Text>
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    style={{ width: '16px', height: '16px' }}
                  />
                </Flex>

                <Flex align="center" justify="space-between" w="full">
                  <Text fontWeight="medium">SMS notifications for urgent issues</Text>
                  <input 
                    type="checkbox" 
                    style={{ width: '16px', height: '16px' }}
                  />
                </Flex>

                <Flex align="center" justify="space-between" w="full">
                  <Text fontWeight="medium">Weekly summary reports</Text>
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    style={{ width: '16px', height: '16px' }}
                  />
                </Flex>

                <Box w="full">
                  <Text mb={2} fontWeight="medium">Notification Email</Text>
                  <Input defaultValue="admin@shopadmin.com" type="email" />
                </Box>

                <Box h="1px" bg="gray.200" w="full" />

                <Button 
                  colorScheme="blue" 
                  onClick={handleSave}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </VStack>
            )}

            {activeTab === 'api' && (
              <VStack gap={6} align="start">
                <Heading size="md">API Configuration</Heading>
                
                <Box w="full">
                  <Text mb={2} fontWeight="medium">API Key</Text>
                  <Input defaultValue="sk_live_..." readOnly bg="gray.50" />
                </Box>

                <Box w="full">
                  <Text mb={2} fontWeight="medium">Webhook URL</Text>
                  <Input defaultValue="https://api.shopadmin.com/webhooks" />
                </Box>

                <Box w="full">
                  <Text mb={2} fontWeight="medium">Webhook Secret</Text>
                  <textarea 
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: '#f9fafb',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                    readOnly
                    rows={3}
                    defaultValue="whsec_..."
                  />
                </Box>

                <Box h="1px" bg="gray.200" w="full" />

                <Button 
                  colorScheme="blue" 
                  onClick={handleSave}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </VStack>
            )}

            {activeTab === 'users' && (
              <VStack gap={6} align="start">
                <Heading size="md">User Management</Heading>
                <Text>
                  Manage users and permissions for your ShopAdmin dashboard.
                </Text>
                <Text color="gray.500" fontSize="sm">
                  User management features will be available in a future update.
                </Text>
              </VStack>
            )}
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  )
}
