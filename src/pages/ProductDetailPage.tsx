import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Product } from '../types'

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    api.getProduct(slug, 'TRY')
      .then((res) => setProduct(res.product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="animate-pulse grid gap-8 md:grid-cols-2">
          <div className="aspect-square rounded-2xl bg-surface-200" />
          <div className="space-y-4">
            <div className="h-8 bg-surface-200 rounded w-3/4" />
            <div className="h-4 bg-surface-100 rounded w-1/2" />
            <div className="h-24 bg-surface-100 rounded" />
            <div className="h-10 bg-surface-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-surface-700">Ürün bulunamadı</h1>
        <Link to="/products" className="mt-4 inline-block text-primary-600 hover:underline">
          Ürünlere dön
        </Link>
      </div>
    )
  }

  const price = product.priceTry != null
    ? `₺${product.priceTry.toLocaleString()}`
    : `₺${(product.price * 34.5).toLocaleString()}`

  const categoryName = typeof product.category === 'object' && product.category?.name
    ? product.category.name
    : ''

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-8 text-sm text-surface-400">
        <Link to="/" className="hover:text-primary-600">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-primary-600">Ürünler</Link>
        <span className="mx-2">/</span>
        <span className="text-surface-600">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl border border-surface-200 bg-surface-100 flex items-center justify-center">
          <div className="text-surface-300 text-9xl">⌨</div>
        </div>

        <div>
          {categoryName && (
            <span className="text-xs font-medium text-primary-500 uppercase tracking-wide">
              {categoryName}
            </span>
          )}
          <h1 className="mt-2 font-display text-3xl font-bold text-surface-800">{product.name}</h1>
          <p className="mt-4 text-surface-500">{product.description}</p>

          <div className="mt-6">
            <span className="text-2xl font-bold text-primary-600">{price}</span>
          </div>

          <p className="mt-4 text-sm text-surface-400">
            {product.stock > 0 ? (
              <span className="text-green-600">Stokta ({product.stock} adet)</span>
            ) : (
              <span className="text-amber-600">Stokta yok</span>
            )}
          </p>

          <div className="mt-8">
            <button
              disabled={product.stock === 0}
              className="w-full rounded-xl bg-primary-500 py-3 font-semibold text-white transition hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sepete Ekle
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
