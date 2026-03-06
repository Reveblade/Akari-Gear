import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import type { AdminUser } from '../types'

export function AdminUsersPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [patched, setPatched] = useState<Record<string, AdminUser>>({})

  const { items: users, loading, loadingMore, hasMore, sentinelRef, reset } = useInfiniteScroll<AdminUser>({
    fetchPage: (page) =>
      api.admin.users
        .list({ page, limit: 20, search: search || undefined, role: roleFilter || undefined })
        .then((res) => ({
          items: res.users,
          pagination: res.pagination,
        })),
    deps: [search, roleFilter],
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  async function handleBlock(id: string) {
    if (!confirm('Bu kullanıcıyı engellemek istediğinize emin misiniz?')) return
    try {
      const { user } = await api.admin.users.block(id)
      setPatched((p) => ({ ...p, [id]: user }))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Engelleme başarısız')
    }
  }

  async function handleUnblock(id: string) {
    try {
      const { user } = await api.admin.users.unblock(id)
      setPatched((p) => ({ ...p, [id]: user }))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Engel kaldırma başarısız')
    }
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`"${email}" hesabını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`))
      return
    try {
      await api.admin.users.delete(id)
      reset()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Silme başarısız')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white">Üyeler</h1>
        <p className="mt-1 text-sm text-zinc-400">Üyeleri görüntüleyin, engelleyin veya silin</p>
      </div>

      {/* Arama ve Filtreler */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-zinc-600 bg-zinc-800 p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="E-posta ile ara..."
            className="flex-1 rounded-lg border border-zinc-600 bg-zinc-700 px-4 py-2 text-white placeholder-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-600"
          >
            Ara
          </button>
        </form>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Rol</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
            >
              <option value="">Tümü</option>
              <option value="customer">Müşteri</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-zinc-700" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-zinc-600 bg-zinc-800 p-12 text-center">
          <p className="text-zinc-400">Üye bulunamadı.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-zinc-600 bg-zinc-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-600">
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">E-posta</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Rol</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Durum</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Kayıt</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const u2 = patched[u._id] ?? u
                  return (
                  <tr key={u._id} className="border-b border-zinc-700 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        to={`/users/${u2._id}`}
                        className="font-medium text-primary-400 hover:text-primary-300 hover:underline"
                      >
                        {u2.email}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          u2.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-600 text-zinc-400'
                        }`}
                      >
                        {u2.role === 'admin' ? 'Admin' : 'Müşteri'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          u2.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {u2.isBlocked ? 'Engelli' : 'Aktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500">
                      {new Date(u2.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/users/${u2._id}`}
                        className="mr-2 text-sm text-primary-500 hover:underline"
                      >
                        Siparişler
                      </Link>
                      {u2.role !== 'admin' && (
                        <>
                          {u2.isBlocked ? (
                            <button
                              onClick={() => handleUnblock(u2._id)}
                              className="mr-2 text-sm text-green-400 hover:underline"
                            >
                              Engeli kaldır
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBlock(u2._id)}
                              className="mr-2 text-sm text-amber-400 hover:underline"
                            >
                              Engelle
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(u2._id, u2.email)}
                            className="text-sm text-red-400 hover:underline"
                          >
                            Sil
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )
                })}
              </tbody>
            </table>
          </div>
          <div ref={sentinelRef} className="h-4" />
          {loadingMore && (
            <div className="mt-4 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          )}
          {!hasMore && users.length > 0 && (
            <p className="mt-4 text-center text-sm text-zinc-400">Tüm üyeler görüntülendi</p>
          )}
        </>
      )}
    </div>
  )
}
