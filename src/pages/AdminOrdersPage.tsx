import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Order } from '../types'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Beklemede',
  paid: 'Ödendi',
  shipped: 'Kargoda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal',
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    api.admin.orders
      .list(statusFilter ? { status: statusFilter } : undefined)
      .then((res) => setOrders(res.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [statusFilter])

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Siparişler</h1>
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
                      #{order._id.slice(-6).toUpperCase()} — {userEmail}
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
      )}
    </div>
  )
}
