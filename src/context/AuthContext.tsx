import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'
import { setStoredToken, clearStoredToken, getStoredToken } from '../api/client'
import type { User } from '../types'

type LoginResult =
  | { success: true }
  | { requiresTwoFactor: true; email: string }

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  verify2FA: (token: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  enable2FA: () => Promise<void>
  disable2FA: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = getStoredToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const { user } = await api.auth.getMe()
      setUser(user)
    } catch {
      clearStoredToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const res = await api.auth.login(email, password)
    if ('requiresTwoFactor' in res && res.requiresTwoFactor) {
      return { requiresTwoFactor: true, email: res.email }
    }
    const authRes = res as import('../types').AuthResponse
    setStoredToken(authRes.token)
    setUser(authRes.user)
    return { success: true }
  }, [])

  const verify2FA = useCallback(async (token: string) => {
    const { user, token: authToken } = await api.auth.verify2FA(token)
    setStoredToken(authToken)
    setUser(user)
  }, [])

  const enable2FA = useCallback(async () => {
    const { user } = await api.auth.enable2FA()
    setUser((prev) => (prev ? { ...prev, ...user } : null))
  }, [])

  const disable2FA = useCallback(async () => {
    const { user } = await api.auth.disable2FA()
    setUser((prev) => (prev ? { ...prev, ...user } : null))
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    await api.auth.register(email, password)
  }, [])

  const logout = useCallback(() => {
    clearStoredToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        verify2FA,
        register,
        logout,
        refreshUser,
        enable2FA,
        disable2FA,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
