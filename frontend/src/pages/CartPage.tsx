import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { CartSummary } from '../components/CartSummary'
import { AddressForm } from '../components/AddressForm'
import { api } from '../api/client'
import type { AddressData } from '../components/AddressForm'

function getProductImageUrl(images: string[] | undefined): string | null {
  const src = images?.[0]
  if (!src) return null
  if (src.startsWith('http://') || src.startsWith('https://')) return src
  return src.startsWith('/') ? src : `/${src}`
}

export function CartPage() {
  const { user, loading: authLoading } = useAuth()
  const { items, loading, removeFromCart, updateQuantity, refreshCart } = useCart()
  const navigate = useNavigate()
  const [address, setAddress] = useState<AddressData | null>(null)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [placeError, setPlaceError] = useState<string | null>(null)

  async function handlePlaceOrder(addr: AddressData) {
    setPlaceError(null)
    setPlacingOrder(true)
    try {
      const { order } = await api.orders.create({
        fullName: addr.fullName.trim(),
        phone: addr.phone.trim(),
        city: addr.city.trim(),
        district: addr.district.trim(),
        neighborhood: addr.neighborhood.trim(),
        address: addr.address.trim(),
        postalCode: addr.postalCode?.trim() || undefined,
      })
      await refreshCart()
      navigate(`/orders/${order._id}`)
    } catch (err) {
      setPlaceError(err instanceof Error ? err.message : 'Sipariş oluşturulamadı')
    } finally {
      setPlacingOrder(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: '/cart' } })
    }
  }, [user, authLoading, navigate])

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-surface-500 dark:text-zinc-400">Yükleniyor...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="font-display text-2xl font-bold text-surface-800 dark:text-zinc-100">Sepetim</h1>
        <div className="mt-8 animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-surface-100 dark:bg-zinc-700" />
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="font-display text-2xl font-bold text-surface-800 dark:text-zinc-100">Sepetim</h1>
        <div className="mt-8 rounded-2xl border border-surface-200 bg-white p-16 text-center dark:border-zinc-600 dark:bg-zinc-800">
          <p className="text-surface-500 dark:text-zinc-400">Sepetiniz boş.</p>
          <Link
            to="/products"
            className="mt-4 inline-block font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Alışverişe başla
          </Link>
        </div>
      </div>
    )
  }

  const total = items.reduce((sum, i) => {
    const p = i.product as { priceTry?: number }
    const price = p.priceTry ?? 0
    return sum + price * i.quantity
  }, 0)

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold text-surface-800 dark:text-zinc-100">Sepetim</h1>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Cart items - left side */}
        <div className="min-w-0 flex-1 space-y-4">
          {items.map((item) => {
            const p = item.product as {
              _id: string
              name: string
              slug: string
              priceTry?: number
              images?: string[]
            }
            const price = p.priceTry ?? 0
            const subtotal = price * item.quantity
            const imgUrl = getProductImageUrl(p.images)

            return (
              <div
                key={p._id}
                className="flex gap-4 rounded-xl border border-surface-200 bg-white p-4 dark:border-zinc-600 dark:bg-zinc-800"
              >
                <Link
                  to={`/products/${p.slug}`}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-100 dark:bg-zinc-700"
                >
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl text-surface-300 dark:text-zinc-500">
                      ⌨
                    </div>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/products/${p.slug}`}
                    className="font-semibold text-surface-800 hover:text-primary-600 dark:text-zinc-200 dark:hover:text-primary-400 line-clamp-2"
                  >
                    {p.name}
                  </Link>
                  <p className="mt-1 text-sm text-surface-500 dark:text-zinc-400">
                    ₺{price.toLocaleString()} x {item.quantity} = ₺{subtotal.toLocaleString()}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <div className="flex items-center rounded-lg border border-surface-200 dark:border-zinc-600">
                      <button
                        type="button"
                        onClick={() => updateQuantity(p._id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                        className="flex h-9 w-9 items-center justify-center rounded-l-lg text-surface-600 transition hover:bg-surface-100 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-700"
                        aria-label="Azalt"
                      >
                        −
                      </button>
                      <select
                        value={item.quantity}
                        onChange={(e) => updateQuantity(p._id, Number(e.target.value))}
                        className="h-9 min-w-[3rem] border-0 border-x border-surface-200 bg-transparent px-2 text-center text-sm focus:outline-none focus:ring-0 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                      >
                        {(() => {
                          const opts = [1, 2, 3, 5, 10, 20, 30, 40, 50]
                          const options = opts.includes(item.quantity)
                            ? opts
                            : [...opts, item.quantity].sort((a, b) => a - b)
                          return options.map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))
                        })()}
                      </select>
                      <button
                        type="button"
                        onClick={() => updateQuantity(p._id, item.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-r-lg text-surface-600 transition hover:bg-surface-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                        aria-label="Artır"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(p._id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                    >
                      Kaldır
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Address + Summary - right side, sticky */}
        <aside className="flex w-full shrink-0 flex-col gap-6 lg:sticky lg:top-24 lg:w-80">
          <AddressForm value={address ?? undefined} onChange={setAddress} />
          {placeError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {placeError}
            </div>
          )}
          <CartSummary
            total={total}
            itemCount={itemCount}
            address={address}
            onPlaceOrder={handlePlaceOrder}
            placingOrder={placingOrder}
          />
        </aside>
      </div>
    </div>
  )
}
