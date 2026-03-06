import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import type { AdminUser, Order } from '../types'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Beklemede',
  paid: 'Ödendi',
  shipped: 'Kargoda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal',
}

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [userLoading, setUserLoading] = useState(true)

  const { items: orders, loading, loadingMore, hasMore, sentinelRef } = useInfiniteScroll<Order>({
    fetchPage: (page) =>
      id
        ? api.admin.users.getOrders(id, { page, limit: 20 }).then((res) => ({
            items: res.orders,
            pagination: res.pagination,
          }))
        : Promise.resolve({ items: [], pagination: { page: 1, pages: 0, total: 0, limit: 20 } }),
    deps: [id],
  })

  useEffect(() => {
    if (!id) return
    setUserLoading(true)
    api.admin.users
      .get(id)
      .then((res) => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setUserLoading(false))
  }, [id])

  if (userLoading || !id) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  const userEmail = user?.email ?? '-'

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <Link to="/users" className="text-zinc-400 hover:text-white">
          ← Üyeler
        </Link>
        <h1 className="font-display text-2xl font-bold text-white">
          Üye: {userEmail}
        </h1>
      </div>

      <div className="space-y-6">
        {user && (
          <div className="rounded-xl border border-zinc-600 bg-zinc-800 p-6">
            <h3 className="mb-4 font-semibold text-white">Üye Bilgisi</h3>
            <div className="grid gap-2 text-sm">
              <p><span className="text-zinc-500">E-posta:</span> <span className="text-white">{user.email}</span></p>
              <p><span className="text-zinc-500">Rol:</span> <span className="text-white">{user.role === 'admin' ? 'Admin' : 'Müşteri'}</span></p>
              <p>
                <span className="text-zinc-500">Durum:</span>{' '}
                <span className={user.isBlocked ? 'text-red-400' : 'text-green-400'}>
                  {user.isBlocked ? 'Engelli' : 'Aktif'}
                </span>
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <Link
                to="/users"
                className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-700 hover:text-white"
              >
                Üye listesine dön
              </Link>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-zinc-600 bg-zinc-800 p-6">
          <h3 className="mb-4 font-semibold text-white">Siparişler</h3>
          {loading && orders.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-zinc-400">Bu üyenin siparişi yok.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-600">
                      <th className="px-4 py-2 text-left text-sm font-medium text-zinc-400">Sipariş</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-zinc-400">Tarih</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-zinc-400">Toplam</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-zinc-400">Durum</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-zinc-400">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id} className="border-b border-zinc-700 last:border-0">
                        <td className="px-4 py-3 font-mono text-sm text-zinc-300">
                          #{o._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-400">
                          {new Date(o.createdAt).toLocaleString('tr-TR')}
                        </td>
                        <td className="px-4 py-3 text-white">
                          ₺{o.totalTry.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              o.status === 'delivered'
                                ? 'bg-green-500/20 text-green-400'
                                : o.status === 'cancelled'
                                  ? 'bg-zinc-600 text-zinc-400'
                                  : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {STATUS_LABELS[o.status] ?? o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to={`/orders/${o._id}`}
                            className="text-sm text-primary-500 hover:underline"
                          >
                            Siparişe git →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
      </div>
    </div>
  )
}
