import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Order } from '../types'

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return
    api.orders.getOrder(orderId)
      .then((res) => setOrder(res.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-surface-500 dark:text-zinc-400">Yükleniyor...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-surface-800 dark:text-zinc-100">Sipariş bulunamadı</h1>
        <Link to="/cart" className="mt-4 inline-block text-primary-600 hover:underline dark:text-primary-400">
          Sepete dön
        </Link>
      </div>
    )
  }

  const statusLabels: Record<string, string> = {
    pending: 'Beklemede',
    paid: 'Ödendi',
    shipped: 'Kargoya Verildi',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal',
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-surface-800 dark:text-zinc-100">
          Sipariş #{order._id.slice(-8).toUpperCase()}
        </h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-zinc-400">
          {new Date(order.createdAt).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
        <span className="mt-2 inline-block rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
          {statusLabels[order.status] ?? order.status}
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Sipariş Kalemleri */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-zinc-600 dark:bg-zinc-800">
          <h2 className="font-display text-lg font-semibold text-surface-800 dark:text-zinc-100">Sipariş Özeti</h2>
          <div className="mt-4 space-y-4">
            {order.items.map((item, idx) => (
              <div
                key={`${item.slug}-${idx}`}
                className="flex justify-between border-b border-surface-100 pb-4 last:border-0 dark:border-zinc-700"
              >
                <div>
                  <p className="font-medium text-surface-800 dark:text-zinc-200">{item.name}</p>
                  <p className="text-sm text-surface-500 dark:text-zinc-400">
                    ₺{item.unitPriceTry.toLocaleString()} x {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-surface-800 dark:text-zinc-100">
                  ₺{item.subtotalTry.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-surface-200 pt-4 dark:border-zinc-600">
            <span className="font-semibold text-surface-800 dark:text-zinc-100">Toplam</span>
            <span className="font-semibold text-surface-800 dark:text-zinc-100">
              ₺{order.totalTry.toLocaleString()}
            </span>
          </div>
          <p className="mt-2 text-xs text-surface-500 dark:text-zinc-500">
            Kur: {order.exchangeRateUsdToTry.toFixed(2)} (sipariş anındaki döviz kuru)
          </p>
        </div>

        {/* Teslimat Adresi */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-zinc-600 dark:bg-zinc-800">
          <h2 className="font-display text-lg font-semibold text-surface-800 dark:text-zinc-100">Teslimat Adresi</h2>
          <div className="mt-4 text-sm text-surface-600 dark:text-zinc-400">
            <p className="font-medium text-surface-800 dark:text-zinc-200">{order.address.fullName}</p>
            <p>{order.address.phone}</p>
            <p className="mt-2">
              {order.address.neighborhood}, {order.address.address}
            </p>
            <p>
              {order.address.district} / {order.address.city}
            </p>
            {order.address.postalCode && <p>{order.address.postalCode}</p>}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link
          to="/products"
          className="inline-flex rounded-xl border border-surface-200 px-6 py-3 font-medium text-surface-700 transition hover:bg-surface-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Alışverişe devam
        </Link>
      </div>
    </div>
  )
}
