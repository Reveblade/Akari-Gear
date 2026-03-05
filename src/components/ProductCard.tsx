import { Link } from 'react-router-dom'
import type { Product } from '../types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const price = product.priceTry != null
    ? `₺${product.priceTry.toLocaleString()}`
    : `₺${(product.price * 34.5).toLocaleString()}`

  const categoryName = typeof product.category === 'object' && product.category?.name
    ? product.category.name
    : ''

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-xl border border-surface-200 bg-white transition-all hover:border-primary-200 hover:shadow-lg"
    >
      <div className="aspect-square bg-surface-100 flex items-center justify-center">
        <div className="text-surface-300 text-6xl group-hover:text-primary-200 transition-colors">⌨</div>
      </div>
      <div className="p-4">
        {categoryName && (
          <span className="text-xs font-medium text-primary-500 uppercase tracking-wide">{categoryName}</span>
        )}
        <h3 className="mt-1 font-display font-semibold text-surface-700 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-surface-400">{product.description}</p>
        <p className="mt-3 font-semibold text-primary-600">{price}</p>
      </div>
    </Link>
  )
}
