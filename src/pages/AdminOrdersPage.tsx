import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import type { Order } from '../types'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Beklemede',
  paid: 'Ödendi',
  shipped: 'Kargoda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal',
}

export function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [codeSearch, setCodeSearch] = useState('')
  const [codeInput, setCodeInput] = useState('')

  const { items: orders, loading, loadingMore, hasMore, sentinelRef } = useInfiniteScroll<Order>({
    fetchPage: (page) =>
      api.admin.orders
        .list({
          page,
          limit: 20,
          status: statusFilter || undefined,
          code: codeSearch.trim() || undefined,
        })
        .then((res) => ({
          items: res.orders,
          pagination: res.pagination,
        })),
    deps: [statusFilter, codeSearch],
  })

  function handleCodeSearch(e: React.FormEvent) {
    e.preventDefault()
    setCodeSearch(codeInput.trim())
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Siparişler</h1>
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleCodeSearch} className="flex gap-2">
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Sipariş kodu (örn: A1B2C3D4)"
              className="w-40 rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-primary-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary-500 px-3 py-2 text-sm font-medium text-white hover:bg-primary-600"
            >
              Ara
            </button>
          </form>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
          >
            <option value="">Tümü</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          {(codeSearch || codeInput) && (
            <button
              onClick={() => {
                setCodeSearch('')
                setCodeInput('')
              }}
              className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-700 hover:text-white"
            >
              Filtreleri temizle
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-zinc-700" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-zinc-600 bg-zinc-800 p-12 text-center">
          <p className="text-zinc-400">Henüz sipariş yok.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => {
              const userEmail = typeof order.user === 'object' ? order.user?.email : '-'
              return (
                <Link
                  key={order._id}
                  to={`/orders/${order._id}`}
                  className="block rounded-xl border border-zinc-600 bg-zinc-800 p-4 transition hover:border-primary-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">
                        #{order._id.slice(-8).toUpperCase()} — {userEmail}
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {order.items.length} ürün · ₺{order.totalTry.toLocaleString()} ·{' '}
                        {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        order.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-400'
                          : order.status === 'paid' || order.status === 'shipped'
                          ? 'bg-green-500/20 text-green-400'
                          : order.status === 'delivered'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-zinc-600 text-zinc-400'
                      }`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
          <div ref={sentinelRef} className="h-4" />
          {loadingMore && (
            <div className="mt-4 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          )}
          {!hasMore && orders.length > 0 && (
            <p className="mt-4 text-center text-sm text-zinc-400">Tüm siparişler görüntülendi</p>
          )}
        </>
      )}
    </div>
  )
}
