import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Product } from '../types'

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.admin.products
      .list({ limit: 50, active: false })
      .then((res) => setProducts(res.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) return
    try {
      await api.admin.products.delete(id)
      setProducts((prev) => prev.filter((p) => p._id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Silme başarısız')
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Ürünler</h1>
        <Link
          to="/products/new"
          className="rounded-lg bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-600"
        >
          + Yeni Ürün
        </Link>
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
      )}
    </div>
  )
}
