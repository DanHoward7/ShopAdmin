export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'MANAGER' | 'VIEWER'
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    user: User
    tokens: AuthTokens
  }
}

export interface AuthError {
  success: false
  error: string
  code: string
  details?: any
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  hasRole: (roles: string | string[]) => boolean
  hasPermission: (resource: string, action: string) => boolean
}

export interface UpdateProfileData {
  name?: string
  email?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  ADMIN: {
    '*': ['*'] // Admin can do everything
  },
  MANAGER: {
    'orders': ['create', 'read', 'update', 'delete'],
    'stores': ['create', 'read', 'update', 'delete'],
    'products': ['create', 'read', 'update', 'delete'],
    'customers': ['read', 'update'],
    'users': ['read']
  },
  VIEWER: {
    'orders': ['read'],
    'stores': ['read'],
    'products': ['read'],
    'customers': ['read'],
    'users': ['read']
  }
} as const

// Helper function for type-safe permission checking
export function checkPermission(userRole: UserRole, resource: string, action: string): boolean {
  // Admin has all permissions
  if (userRole === 'ADMIN') {
    return true
  }
  
  const permissions = ROLE_PERMISSIONS[userRole]
  
  // For non-admin roles, check specific resource permissions
  if (userRole === 'MANAGER' || userRole === 'VIEWER') {
    const resourcePerms = permissions[resource as keyof typeof permissions]
    if (!resourcePerms) {
      return false
    }
    return resourcePerms.includes(action as any) || resourcePerms.includes('*' as any)
  }
  
  return false
}

export type UserRole = keyof typeof ROLE_PERMISSIONS
