import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import type { Order } from '../types'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Beklemede',
  paid: 'Ödendi',
  shipped: 'Kargoda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal',
}

export function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const { items: orders, loading, loadingMore, hasMore, sentinelRef } = useInfiniteScroll<Order>({
    fetchPage: (page) => {
      if (!user) return Promise.resolve({ items: [], pagination: { page: 1, pages: 0, total: 0, limit: 20 } })
      return api.orders.getMyOrders({ page, limit: 20 }).then((res) => ({
        items: res.orders,
        pagination: res.pagination,
      }))
    },
    deps: [!!user],
  })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: '/orders' } })
    }
  }, [user, authLoading, navigate])

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-surface-500 dark:text-zinc-400">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold text-surface-800 dark:text-zinc-100">
        Geçmiş Siparişlerim
      </h1>

      {loading ? (
        <div className="mt-8 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-surface-100 dark:bg-zinc-700"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-surface-200 bg-white p-16 text-center dark:border-zinc-600 dark:bg-zinc-800">
          <p className="text-surface-500 dark:text-zinc-400">Henüz siparişiniz yok.</p>
          <Link
            to="/products"
            className="mt-4 inline-block font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Alışverişe başla
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="block rounded-2xl border border-surface-200 bg-white p-6 transition hover:border-primary-200 hover:shadow-md dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-primary-600"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-surface-800 dark:text-zinc-100">
                      Sipariş #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="mt-1 text-sm text-surface-500 dark:text-zinc-400">
                      {order.items.length} ürün · {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        order.status === 'pending'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : order.status === 'paid' || order.status === 'shipped'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : order.status === 'delivered'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-surface-100 text-surface-600 dark:bg-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                    <span className="font-semibold text-surface-800 dark:text-zinc-100">
                      ₺{order.totalTry.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div ref={sentinelRef} className="h-4" />
          {loadingMore && (
            <div className="mt-4 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          )}
          {!hasMore && orders.length > 0 && (
            <p className="mt-4 text-center text-sm text-surface-500 dark:text-zinc-400">
              Tüm siparişler görüntülendi
            </p>
          )}
        </>
      )}
    </div>
  )
}
