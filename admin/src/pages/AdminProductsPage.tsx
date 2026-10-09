import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import type { Product, Category } from '../types'

export function AdminProductsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [featuredFilter, setFeaturedFilter] = useState(false)

  useEffect(() => {
    api.admin.categories.list().then((res) => setCategories(res.categories)).catch(() => {})
  }, [])

  const { items: products, loading, loadingMore, hasMore, sentinelRef, reset } = useInfiniteScroll<Product>({
    fetchPage: (page) =>
      api.admin.products
        .list({
          page,
          limit: 20,
          active: statusFilter === 'all' ? false : undefined,
          inactive: statusFilter === 'inactive',
          search: search || undefined,
          category: categoryFilter || undefined,
          featured: featuredFilter || undefined,
        })
        .then((res) => ({
          items: res.products,
          pagination: res.pagination,
        })),
    deps: [search, categoryFilter, statusFilter, featuredFilter],
  })

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) return
    try {
      await api.admin.products.delete(id)
      reset()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Silme başarısız')
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Ürünler</h1>
        <Link
          to="/products/new"
          className="shrink-0 rounded-lg bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-600"
        >
          + Yeni Ürün
        </Link>
      </div>

      {/* Arama ve Filtreler */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-zinc-600 bg-zinc-800 p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Ürün adı veya açıklamada ara..."
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
            <label className="mb-1 block text-xs text-zinc-400">Kategori</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
            >
              <option value="">Tümü</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Durum</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="rounded-lg border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
            >
              <option value="all">Tümü</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.checked)}
                className="rounded border-zinc-600 bg-zinc-700 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-zinc-300">Öne çıkan</span>
            </label>
          </div>
          {(search || categoryFilter || statusFilter !== 'all' || featuredFilter) && (
            <button
              onClick={() => {
                setSearch('')
                setSearchInput('')
                setCategoryFilter('')
                setStatusFilter('all')
                setFeaturedFilter(false)
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
            <div key={i} className="h-14 animate-pulse rounded-lg bg-zinc-700" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-zinc-600 bg-zinc-800 p-12 text-center">
          <p className="text-zinc-400">Henüz ürün yok.</p>
          <Link
            to="/products/new"
            className="mt-4 inline-block text-primary-500 hover:underline"
          >
            İlk ürünü ekle
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-zinc-600 bg-zinc-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-600">
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Ürün</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Fiyat</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Stok</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Durum</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-zinc-700 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt=""
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-zinc-600 text-zinc-400">
                            ⌨
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">{p.name}</p>
                          <p className="text-xs text-zinc-500">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">${p.price}</td>
                    <td className="px-4 py-3 text-zinc-300">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-zinc-600 text-zinc-400'
                        }`}
                      >
                        {p.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/products/${p._id}/edit`}
                        className="mr-2 text-sm text-primary-500 hover:underline"
                      >
                        Düzenle
                      </Link>
                      <button
                        onClick={() => handleDelete(p._id, p.name)}
                        className="text-sm text-red-400 hover:underline"
                      >
                        Sil
                      </button>
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
          {!hasMore && products.length > 0 && (
            <p className="mt-4 text-center text-sm text-zinc-400">Tüm ürünler görüntülendi</p>
          )}
        </>
      )}
    </div>
  )
}
