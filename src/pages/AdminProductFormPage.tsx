import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'
import { AdminProductForm } from '../components/AdminProductForm'
import type { Product, Category } from '../types'

export function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    api.admin.categories.list().then((res) => setCategories(res.categories)).catch(() => {})
  }, [])

  useEffect(() => {
    if (isNew) return
    if (!id) return
    setLoading(true)
    api.admin.products
      .get(id)
      .then((res) => setProduct(res.product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id, isNew])

  if (loading && !isNew) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (!isNew && !product) {
    return (
      <div className="text-center">
        <p className="text-zinc-400">Ürün bulunamadı.</p>
        <Link to="/products" className="mt-4 inline-block text-primary-500 hover:underline">
          Ürünlere dön
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <Link to="/products" className="text-zinc-400 hover:text-white">
          ← Ürünler
        </Link>
        <h1 className="font-display text-2xl font-bold text-white">
          {isNew ? 'Yeni Ürün' : 'Ürün Düzenle'}
        </h1>
      </div>

      <AdminProductForm
        product={product ?? undefined}
        categories={categories}
        onSuccess={() => navigate('/products')}
        onCancel={() => navigate('/products')}
      />
    </div>
  )
}
