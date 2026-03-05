import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import type { Product } from '../types'

interface ProductCardProps {
  product: Product
  compact?: boolean
}

export function ProductCard({ product, compact }: ProductCardProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [adding, setAdding] = useState(false)

  const price = product.priceTry != null
    ? `₺${product.priceTry.toLocaleString()}`
    : null

  const categoryName = typeof product.category === 'object' && product.category?.name
    ? product.category.name
    : ''

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      navigate('/login', { state: { from: `/products/${product.slug}` } })
      return
    }
    if (product.stock === 0) return
    setAdding(true)
    try {
      await addToCart(product._id)
    } finally {
      setAdding(false)
    }
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-xl border border-surface-200 bg-white transition-all hover:border-primary-200 hover:shadow-lg dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-primary-600"
    >
      <div className={`flex items-center justify-center overflow-hidden bg-surface-100 dark:bg-zinc-700 ${compact ? 'aspect-[4/3]' : 'aspect-square'}`}>
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={`text-surface-300 group-hover:text-primary-200 transition-colors dark:text-zinc-500 dark:group-hover:text-primary-400 ${compact ? 'text-4xl' : 'text-6xl'}`}>⌨</div>
        )}
      </div>
      <div className={compact ? 'p-3' : 'p-4'}>
        {categoryName && (
          <span className={`font-medium text-primary-500 uppercase tracking-wide ${compact ? 'text-[10px]' : 'text-xs'}`}>{categoryName}</span>
        )}
        <h3 className={`font-display font-semibold text-surface-700 group-hover:text-primary-600 transition-colors dark:text-zinc-200 dark:group-hover:text-primary-400 line-clamp-1 ${compact ? 'mt-0.5 text-sm' : 'mt-1'}`}>
          {product.name}
        </h3>
        {!compact && (
          <p className="mt-1 line-clamp-2 text-sm text-surface-400 dark:text-zinc-500">{product.description}</p>
        )}
        <div className={`flex items-center justify-between gap-2 ${compact ? 'mt-2' : 'mt-3'}`}>
          {price != null ? (
            <p className={`font-semibold text-primary-600 ${compact ? 'text-sm' : ''}`}>{price}</p>
          ) : (
            <p className={`font-semibold text-surface-400 ${compact ? 'text-sm' : ''}`}>—</p>
          )}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            className={`shrink-0 rounded-lg bg-primary-500 font-medium text-white transition hover:bg-primary-600 disabled:opacity-50 ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}`}
          >
            {adding ? '...' : 'Sepete Ekle'}
          </button>
        </div>
      </div>
    </Link>
  )
}
