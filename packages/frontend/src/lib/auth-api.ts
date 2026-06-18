import { 
  LoginCredentials, 
  LoginResponse, 
  User, 
  UpdateProfileData, 
  ChangePasswordData,
  AuthTokens 
} from '@/types/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

class AuthAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: any
  ) {
    super(message)
    this.name = 'AuthAPIError'
  }
}

class AuthAPI {
  private getAuthHeaders(): HeadersInit {
    const token = this.getStoredToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
  }

  private getStoredRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refreshToken')
  }

  private storeTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    localStorage.setItem('tokenExpiresAt', tokens.expiresAt)
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('tokenExpiresAt')
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json()

    if (!response.ok) {
      throw new AuthAPIError(
        data.error || 'An error occurred',
        data.code || 'UNKNOWN_ERROR',
        response.status,
        data.details
      )
    }

    return data
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const url = `${API_BASE_URL}/auth/login`
    console.log('🔐 Login URL:', url)
    console.log('📦 API_BASE_URL:', API_BASE_URL)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })

    const data = await this.handleResponse<LoginResponse>(response)
    
    // Store tokens
    if (data.success && data.data.tokens) {
      this.storeTokens(data.data.tokens)
    }

    return data
  }

  async logout(): Promise<void> {
    const refreshToken = this.getStoredRefreshToken()
    
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ refreshToken })
      })
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error)
    } finally {
      this.clearTokens()
    }
  }

  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = this.getStoredRefreshToken()
    
    if (!refreshToken) {
      throw new AuthAPIError('No refresh token available', 'NO_REFRESH_TOKEN', 401)
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })

    const data = await this.handleResponse<{ success: boolean; data: { tokens: AuthTokens } }>(response)
    
    if (data.success && data.data.tokens) {
      this.storeTokens(data.data.tokens)
      return data.data.tokens
    }

    throw new AuthAPIError('Failed to refresh token', 'REFRESH_FAILED', 401)
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders()
    })

    const data = await this.handleResponse<{ success: boolean; data: { user: User } }>(response)
    
    if (data.success && data.data.user) {
      return data.data.user
    }

    throw new AuthAPIError('Failed to get user data', 'USER_FETCH_FAILED', 401)
  }

  async updateProfile(profileData: UpdateProfileData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData)
    })

    const data = await this.handleResponse<{ success: boolean; data: { user: User } }>(response)
    
    if (data.success && data.data.user) {
      return data.data.user
    }

    throw new AuthAPIError('Failed to update profile', 'PROFILE_UPDATE_FAILED', 400)
  }

  async changePassword(passwordData: ChangePasswordData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(passwordData)
    })

    await this.handleResponse<{ success: boolean; message: string }>(response)
    
    // Clear tokens as user needs to re-login after password change
    this.clearTokens()
  }

  async getSessions(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/auth/sessions`, {
      headers: this.getAuthHeaders()
    })

    const data = await this.handleResponse<{ success: boolean; data: { sessions: any[] } }>(response)
    
    if (data.success && data.data.sessions) {
      return data.data.sessions
    }

    return []
  }

  async revokeSession(sessionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    await this.handleResponse<{ success: boolean; message: string }>(response)
  }

  // Token validation
  isTokenExpired(): boolean {
    if (typeof window === 'undefined') return true
    
    const expiresAt = localStorage.getItem('tokenExpiresAt')
    if (!expiresAt) return true
    
    return new Date() >= new Date(expiresAt)
  }

  hasValidToken(): boolean {
    return !!this.getStoredToken() && !this.isTokenExpired()
  }
}

export const authAPI = new AuthAPI()
export { AuthAPIError }
