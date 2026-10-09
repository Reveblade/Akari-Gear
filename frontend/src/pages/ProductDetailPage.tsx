import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { ProductImageCarousel } from '../components/ProductImageCarousel'
import { FormattedDescription } from '../components/FormattedDescription'
import { SEO } from '../components/SEO'
import type { Product } from '../types'

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)

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
          <div className="aspect-square rounded-2xl bg-surface-200 dark:bg-zinc-700" />
          <div className="space-y-4">
            <div className="h-8 bg-surface-200 rounded w-3/4 dark:bg-zinc-700" />
            <div className="h-4 bg-surface-100 rounded w-1/2 dark:bg-zinc-600" />
            <div className="h-24 bg-surface-100 rounded dark:bg-zinc-600" />
            <div className="h-10 bg-surface-200 rounded w-1/4 dark:bg-zinc-700" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-surface-700 dark:text-zinc-200">Ürün bulunamadı</h1>
        <Link to="/products" className="mt-4 inline-block text-primary-600 hover:underline">
          Ürünlere dön
        </Link>
      </div>
    )
  }

  const price = product.priceTry != null
    ? `₺${product.priceTry.toLocaleString()}`
    : null

  const categoryName = typeof product.category === 'object' && product.category?.name
    ? product.category.name
    : ''

  const SITE_URL = import.meta.env.VITE_SITE_URL ?? (typeof window !== 'undefined' ? window.location.origin : 'https://akarigear.com')
  const productUrl = `${SITE_URL.replace(/\/$/, '')}/products/${product.slug}`
  const productImage = product.images?.[0]?.startsWith('http') ? product.images[0] : product.images?.[0] ? `${SITE_URL.replace(/\/$/, '')}${product.images[0].startsWith('/') ? '' : '/'}${product.images[0]}` : undefined
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images ?? [],
    url: productUrl,
    offers: {
      '@type': 'Offer',
      price: product.priceTry ?? product.price,
      priceCurrency: 'TRY',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <SEO
        title={product.name}
        description={product.description}
        image={productImage}
        path={`/products/${product.slug}`}
        type="product"
        jsonLd={productJsonLd}
      />
      <nav className="mb-8 text-sm text-surface-400 dark:text-zinc-500">
        <Link to="/" className="hover:text-primary-600">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-primary-600">Ürünler</Link>
        <span className="mx-2">/</span>
        <span className="text-surface-600 dark:text-zinc-300">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductImageCarousel
          images={product.images ?? []}
          alt={product.name}
        />

        <div>
          {categoryName && (
            <span className="text-xs font-medium text-primary-500 uppercase tracking-wide">
              {categoryName}
            </span>
          )}
          <h1 className="mt-2 font-display text-3xl font-bold text-surface-800 dark:text-zinc-100">{product.name}</h1>
          <FormattedDescription text={product.description} className="mt-4 text-surface-500 dark:text-zinc-400" />

          <div className="mt-6">
            {price != null ? (
              <span className="text-2xl font-bold text-primary-600">{price}</span>
            ) : (
              <span className="text-2xl font-bold text-surface-400">—</span>
            )}
          </div>

          <p className="mt-4 text-sm text-surface-400 dark:text-zinc-500">
            {product.stock > 0 ? (
              <span className="text-green-600">Stokta ({product.stock} adet)</span>
            ) : (
              <span className="text-amber-600">Stokta yok</span>
            )}
          </p>

          <div className="mt-8">
            <button
              disabled={product.stock === 0 || addingToCart}
              onClick={async () => {
                if (!user) {
                  navigate('/login', { state: { from: `/products/${product.slug}` } })
                  return
                }
                setAddingToCart(true)
                try {
                  await addToCart(product._id)
                } finally {
                  setAddingToCart(false)
                }
              }}
              className="w-full rounded-xl bg-primary-500 py-3 font-semibold text-white transition hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingToCart ? 'Ekleniyor...' : 'Sepete Ekle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
