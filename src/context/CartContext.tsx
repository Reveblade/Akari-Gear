import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'
import { useAuth } from './AuthContext'
import type { CartItem } from '../types'

interface CartContextValue {
  items: CartItem[]
  loading: boolean
  addToCart: (productId: string, quantity?: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { cart } = await api.cart.get('TRY')
      setItems(cart.items ?? [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    const { cart } = await api.cart.addItem(productId, quantity)
    setItems(cart.items ?? [])
  }, [])

  const removeFromCart = useCallback(async (productId: string) => {
    await api.cart.removeItem(productId)
    setItems((prev) => prev.filter((i) => i.product._id !== productId))
  }, [])

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    await api.cart.updateItem(productId, quantity)
    setItems((prev) =>
      prev.map((i) =>
        i.product._id === productId ? { ...i, quantity } : i
      )
    )
  }, [])

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
