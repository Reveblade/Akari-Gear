import { useState, useCallback } from 'react'
import { api } from '../api/client'
import type { Product, Category } from '../types'
import type { CreateProductRequest, UpdateProductRequest } from '../types'

interface AdminProductFormProps {
  product?: Product
  categories: Category[]
  onSuccess: () => void
  onCancel: () => void
}

export function AdminProductForm({
  product,
  categories,
  onSuccess,
  onCancel,
}: AdminProductFormProps) {
  const [name, setName] = useState(product?.name ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.price?.toString() ?? '')
  const [categoryId, setCategoryId] = useState(
    (typeof product?.category === 'object' ? product.category?._id : product?.category) ?? ''
  )
  const [subcategory, setSubcategory] = useState(product?.subcategory ?? '')

  const selectedCategory = categories.find((c) => c._id === categoryId)
  const subcategories = selectedCategory?.subcategories ?? []
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [stock, setStock] = useState(product?.stock?.toString() ?? '0')
  const [isActive, setIsActive] = useState(product?.isActive ?? true)
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const slugify = useCallback((text: string) =>
    text
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
  [])

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const { url } = await api.admin.uploadImage(file)
      setImages((prev) => [...prev, url])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yükleme başarısız')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        name,
        slug,
        description: description || undefined,
        price: parseFloat(price),
        category: categoryId,
        subcategory: subcategory || undefined,
        images,
        stock: parseInt(stock, 10) || 0,
        isActive,
        isFeatured,
      }
      if (product) {
        await api.admin.products.update(product._id, payload as UpdateProductRequest)
      } else {
        await api.admin.products.create(payload as CreateProductRequest)
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İşlem başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-lg bg-red-500/20 p-3 text-sm text-red-400">{error}</div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Ürün adı</label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setSlug(slugify(e.target.value))
          }}
          required
          className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          placeholder="urun-adi (ad yazınca otomatik)"
          className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Açıklama</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Fiyat (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Stok</label>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Kategori</label>
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value)
            setSubcategory('')
          }}
          required
          className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="">Kategori seçin</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Alt kategori</label>
        <select
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="">Alt kategori seçin (opsiyonel)</option>
          {subcategories.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Görseller</label>
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative">
              <img
                src={url}
                alt=""
                className="h-20 w-20 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
          <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-zinc-600 text-zinc-400 transition hover:border-primary-500 hover:text-primary-500">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? (
              <span className="text-xs">...</span>
            ) : (
              <span className="text-2xl">+</span>
            )}
          </label>
        </div>
        <p className="mt-1 text-xs text-zinc-500">JPEG, PNG, WebP, GIF (max 5MB)</p>
      </div>

      <div className="flex gap-6">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-zinc-600 bg-zinc-800 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-zinc-300">Aktif</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="rounded border-zinc-600 bg-zinc-800 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-zinc-300">Öne çıkan</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary-500 px-6 py-2 font-medium text-white hover:bg-primary-600 disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : product ? 'Güncelle' : 'Oluştur'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-600 px-6 py-2 text-zinc-300 hover:bg-zinc-700"
        >
          İptal
        </button>
      </div>
    </form>
  )
}
