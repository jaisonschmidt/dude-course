'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import {
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  getStoredToken,
} from '@/services/auth-service'
import type { LoginResponse, UserInfo } from '@/services/auth-service'

interface AuthContextValue {
  user: UserInfo | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<LoginResponse>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  handleUnauthorized: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const USER_KEY = 'auth_user'

function parseJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp ?? null
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const exp = parseJwtExp(token)
  if (!exp) return true
  return Date.now() >= exp * 1000
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = getStoredToken()
    if (storedToken && !isTokenExpired(storedToken)) {
      const storedUser = localStorage.getItem(USER_KEY)
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
          setToken(storedToken)
        } catch {
          authLogout()
          localStorage.removeItem(USER_KEY)
        }
      }
    } else if (storedToken) {
      // Token expired — clean up
      authLogout()
      localStorage.removeItem(USER_KEY)
    }
    setIsLoading(false)
  }, [])

  const handleUnauthorized = useCallback(() => {
    setUser(null)
    setToken(null)
    authLogout()
    localStorage.removeItem(USER_KEY)
  }, [])

  // Auto-logout when token expires
  useEffect(() => {
    if (!token) return

    const exp = parseJwtExp(token)
    if (!exp) return

    const msUntilExpiry = exp * 1000 - Date.now()
    if (msUntilExpiry <= 0) return

    const timer = setTimeout(() => {
      handleUnauthorized()
    }, msUntilExpiry)

    return () => clearTimeout(timer)
  }, [token, handleUnauthorized])

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResponse> => {
      const data = await authLogin(email, password)
      setUser(data.user)
      setToken(data.accessToken)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      return data
    },
    [],
  )

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<void> => {
      await authRegister(name, email, password)
    },
    [],
  )

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    authLogout()
    localStorage.removeItem(USER_KEY)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!user && !!token,
      isLoading,
      login,
      register,
      logout,
      handleUnauthorized,
    }),
    [user, token, isLoading, login, register, logout, handleUnauthorized],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
