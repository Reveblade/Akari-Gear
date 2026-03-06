import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'
import { setStoredToken, clearStoredToken, getStoredToken } from '../api/client'
import type { User } from '../types'

type LoginResult =
  | { success: true; user: User }
  | { requiresTwoFactor: true; email: string }

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  verify2FA: (token: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
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
    return { success: true, user: authRes.user }
  }, [])

  const verify2FA = useCallback(async (token: string) => {
    const { user, token: authToken } = await api.auth.verify2FA(token)
    setStoredToken(authToken)
    setUser(user)
  }, [])

  const logout = useCallback(() => {
    clearStoredToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, loading, login, verify2FA, logout, refreshUser }}
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
