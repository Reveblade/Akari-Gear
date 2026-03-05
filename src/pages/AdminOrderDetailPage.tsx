import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Order } from '../types'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Beklemede' },
  { value: 'paid', label: 'Ödendi (Onayla - stoktan düşer)' },
  { value: 'shipped', label: 'Kargoda' },
  { value: 'delivered', label: 'Teslim Edildi' },
  { value: 'cancelled', label: 'İptal' },
]

export function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.admin.orders
      .get(id)
      .then((res) => setOrder(res.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [id])

  async function handleStatusChange(newStatus: string) {
    if (!id || !order) return
    setUpdating(true)
    try {
      const { order: updated } = await api.admin.orders.updateStatus(id, newStatus)
      setOrder(updated)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Güncelleme başarısız')
    } finally {
      setUpdating(false)
    }
  }

  if (loading || !id) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center">
        <p className="text-zinc-400">Sipariş bulunamadı.</p>
        <Link to="/orders" className="mt-4 inline-block text-primary-500 hover:underline">
          Siparişlere dön
        </Link>
      </div>
    )
  }

  const userEmail = typeof order.user === 'object' ? order.user?.email : '-'

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <Link to="/orders" className="text-zinc-400 hover:text-white">
          ← Siparişler
        </Link>
        <h1 className="font-display text-2xl font-bold text-white">
          Sipariş #{order._id.slice(-6).toUpperCase()}
        </h1>
      </div>

      <div className="space-y-6">
        {/* Durum */}
        <div className="rounded-xl border border-zinc-600 bg-zinc-800 p-6">
          <h3 className="mb-4 font-semibold text-white">Durum</h3>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                disabled={updating || order.status === opt.value}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  order.status === opt.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:opacity-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {order.status === 'pending' && (
            <p className="mt-3 text-xs text-amber-400">
              "Ödendi" seçildiğinde stoktan düşülür.
            </p>
          )}
        </div>

        {/* Müşteri & Adres */}
        <div className="rounded-xl border border-zinc-600 bg-zinc-800 p-6">
          <h3 className="mb-4 font-semibold text-white">Müşteri & Adres</h3>
          <p className="text-zinc-300">{userEmail}</p>
          <div className="mt-3 text-sm text-zinc-400">
            <p>{order.address.fullName}</p>
            <p>{order.address.phone}</p>
            <p>
              {order.address.neighborhood}, {order.address.address}
            </p>
            <p>
              {order.address.district} / {order.address.city}
            </p>
          </div>
        </div>

        {/* Ürünler */}
        <div className="rounded-xl border border-zinc-600 bg-zinc-800 p-6">
          <h3 className="mb-4 font-semibold text-white">Ürünler</h3>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-zinc-700 pb-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  {typeof item.product === 'object' && item.product?.images?.[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt=""
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-zinc-600 text-zinc-400">
                      ⌨
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="text-sm text-zinc-500">
                      {item.quantity} x ₺{item.unitPriceTry.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="font-medium text-white">
                  ₺{item.subtotalTry.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-zinc-700 pt-4">
            <span className="text-zinc-400">Ara Toplam</span>
            <span className="text-white">₺{order.subtotalTry.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Kargo</span>
            <span className="text-white">₺{order.shippingCostTry.toLocaleString()}</span>
          </div>
          <div className="mt-2 flex justify-between text-lg font-semibold">
            <span className="text-white">Toplam</span>
            <span className="text-primary-400">₺{order.totalTry.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
