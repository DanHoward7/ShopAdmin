'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  AuthContextType, 
  LoginCredentials, 
  ROLE_PERMISSIONS,
  UserRole,
  checkPermission
} from '@/types/auth'
import { authAPI, AuthAPIError } from '@/lib/auth-api'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Simple notification function (can be replaced with proper toast later)
  const showNotification = (title: string, description: string, status: 'success' | 'error' | 'info') => {
    console.log(`${status.toUpperCase()}: ${title} - ${description}`)
    // TODO: Replace with proper Chakra UI v3 toast implementation
  }

  // Check if user is authenticated
  const isAuthenticated = !!user

  // Initialize authentication state
  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Check if we have a valid token
      if (!authAPI.hasValidToken()) {
        setIsLoading(false)
        return
      }

      // Try to get current user
      const userData = await authAPI.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Auth initialization failed:', error)
      
      // If token is invalid, try to refresh
      if (error instanceof AuthAPIError && error.status === 401) {
        try {
          await authAPI.refreshToken()
          const userData = await authAPI.getCurrentUser()
          setUser(userData)
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          // Clear invalid tokens
          await authAPI.logout()
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      const response = await authAPI.login(credentials)
      
      if (response.success) {
        setUser(response.data.user)
        
        showNotification(
          'Login Successful',
          `Welcome back, ${response.data.user.name}!`,
          'success'
        )
        
        // Redirect to dashboard
        router.push('/')
      }
    } catch (error) {
      console.error('Login failed:', error)
      
      let errorMessage = 'Login failed. Please try again.'
      
      if (error instanceof AuthAPIError) {
        switch (error.code) {
          case 'INVALID_CREDENTIALS':
            errorMessage = 'Invalid email or password.'
            break
          case 'ACCOUNT_INACTIVE':
            errorMessage = 'Your account has been deactivated.'
            break
          case 'RATE_LIMIT_EXCEEDED':
          case 'AUTH_RATE_LIMIT_EXCEEDED':
            errorMessage = 'Too many login attempts. Please try again later.'
            break
          default:
            errorMessage = error.message
        }
      }
      
      showNotification(
        'Login Failed',
        errorMessage,
        'error'
      )
      
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [router, showNotification])

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      router.push('/login')
      
      showNotification(
        'Logged Out',
        'You have been successfully logged out.',
        'info'
      )
    }
  }, [router, showNotification])

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      await authAPI.refreshToken()
      // Optionally refresh user data
      const userData = await authAPI.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Token refresh failed:', error)
      // If refresh fails, logout user
      await logout()
      throw error
    }
  }, [logout])

  // Check if user has specific role(s)
  const hasRole = useCallback((roles: string | string[]): boolean => {
    if (!user) return false
    
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role)
  }, [user])

  // Check if user has permission for specific resource and action
  const hasPermission = useCallback((resource: string, action: string): boolean => {
    if (!user) return false
    
    return checkPermission(user.role as UserRole, resource, action)
  }, [user])

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // Set up token refresh interval
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(async () => {
      if (authAPI.isTokenExpired()) {
        try {
          await refreshToken()
        } catch (error) {
          // Token refresh failed, user will be logged out
          console.error('Automatic token refresh failed:', error)
        }
      }
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [isAuthenticated, refreshToken])

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
    hasRole,
    hasPermission
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

// Helper hooks for common auth checks
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  return { isAuthenticated, isLoading }
}

export function useRequireRole(requiredRoles: string | string[]) {
  const { hasRole, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const hasRequiredRole = hasRole(requiredRoles)

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRequiredRole) {
      router.push('/unauthorized')
    }
  }, [isAuthenticated, isLoading, hasRequiredRole, router])

  return { hasRequiredRole, isAuthenticated, isLoading }
}
