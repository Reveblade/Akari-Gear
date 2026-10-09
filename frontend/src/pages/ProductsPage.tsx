import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { SEO } from '../components/SEO'
import { api } from '../api/client'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import type { Product, Category } from '../types'

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name'

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])

  const category = searchParams.get('category') ?? ''
  const subcategory = searchParams.get('subcategory') ?? ''
  const search = searchParams.get('search') ?? ''
  const sort = (searchParams.get('sort') as SortOption) || 'newest'

  const selectedCategory = categories.find((c) => c._id === category)
  const subcategories = selectedCategory?.subcategories ?? []

  const { items: products, loading, loadingMore, hasMore, sentinelRef } = useInfiniteScroll<Product>({
    fetchPage: (page) =>
      api.getProducts({
        category: category || undefined,
        subcategory: subcategory || undefined,
        search: search || undefined,
        page,
        limit: 20,
        currency: 'TRY',
        sort,
      }).then((res) => ({
        items: res.products,
        pagination: res.pagination,
      })),
    deps: [category, subcategory, search, sort],
  })

  useEffect(() => {
    api.getCategories().then((res) => setCategories(res.categories)).catch(() => {})
  }, [])

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([k, v]) => {
      if (v) next.set(k, v)
      else next.delete(k)
    })
    if ('category' in updates) next.delete('subcategory')
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="mx-auto max-w-7xl min-w-0 px-4 py-8 sm:px-6 lg:px-8">
      <SEO
        title="Ürünler"
        description="Premium oyun ve verimlilik mousepad'leri. Kategorilere göre filtreleyin, en uygun fiyatlı ürünleri keşfedin."
        path="/products"
      />
      <div className="flex min-w-0 flex-col gap-8 lg:flex-row">
        {/* Filters Sidebar */}
        <aside className="w-full min-w-0 shrink-0 lg:w-64">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto space-y-6 rounded-2xl border border-surface-200 bg-white p-6 dark:border-zinc-600 dark:bg-zinc-800">
            <h3 className="font-display font-semibold text-surface-700 dark:text-zinc-200">Filtreler</h3>

            {/* Search */}
            <form
              key={`search-${search}`}
              onSubmit={(e) => {
                e.preventDefault()
                const q = (new FormData(e.currentTarget).get('q') as string) || ''
                updateParams({ search: q })
              }}
            >
              <label className="mb-2 block text-sm font-medium text-surface-600 dark:text-zinc-400">Ara</label>
              <div className="flex min-w-0 gap-2">
                <input
                  name="q"
                  type="search"
                  placeholder="Ürün ara..."
                  defaultValue={search}
                  className="min-w-0 flex-1 rounded-lg border border-surface-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:focus:border-primary-500"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
                >
                  Ara
                </button>
              </div>
            </form>

            {/* Category */}
            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium text-surface-600 dark:text-zinc-400">Kategori</label>
              <select
                value={category}
                onChange={(e) => updateParams({ category: e.target.value })}
                className="w-full min-w-0 rounded-lg border border-surface-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
              >
                <option value="">Tüm kategoriler</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Subcategory - only when category has subcategories */}
            {subcategories.length > 0 && (
              <div className="min-w-0">
                <label className="mb-2 block text-sm font-medium text-surface-600 dark:text-zinc-400">Alt Kategori</label>
                <select
                  value={subcategory}
                  onChange={(e) => updateParams({ subcategory: e.target.value })}
                  className="w-full min-w-0 rounded-lg border border-surface-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                >
                  <option value="">Tüm alt kategoriler</option>
                  {subcategories.map((s) => (
                    <option key={s.slug} value={s.slug}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort */}
            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium text-surface-600 dark:text-zinc-400">Sırala</label>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="w-full min-w-0 rounded-lg border border-surface-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
              >
                <option value="newest">En yeniler</option>
                <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
                <option value="name">İsim A–Z</option>
              </select>
            </div>

            {/* Clear filters */}
            <button
              onClick={() => setSearchParams({})}
              className="w-full rounded-lg border border-surface-200 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              Filtreleri temizle
            </button>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-surface-800 dark:text-zinc-100">Ürünler</h1>
            {!loading && (
              <span className="text-sm text-surface-400 dark:text-zinc-500">
                {products.length} ürün
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-surface-200 bg-white dark:border-zinc-600 dark:bg-zinc-800">
                  <div className="aspect-square bg-surface-100 dark:bg-zinc-700" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-surface-200 rounded w-3/4" />
                    <div className="h-3 bg-surface-100 rounded w-full" />
                    <div className="h-3 bg-surface-100 rounded w-1/2" />
                    <div className="h-5 bg-surface-200 rounded w-1/4 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-surface-200 bg-white p-16 text-center dark:border-zinc-600 dark:bg-zinc-800">
              <p className="text-surface-500 dark:text-zinc-400">Ürün bulunamadı.</p>
              <button
                onClick={() => setSearchParams({})}
                className="mt-4 text-primary-600 font-medium hover:underline dark:text-primary-400"
              >
                Filtreleri temizle
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              <div ref={sentinelRef} className="h-4" />
              {loadingMore && (
                <div className="mt-4 flex justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                </div>
              )}
              {!hasMore && products.length > 0 && (
                <p className="mt-4 text-center text-sm text-surface-500 dark:text-zinc-400">
                  Tüm ürünler görüntülendi
                </p>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
