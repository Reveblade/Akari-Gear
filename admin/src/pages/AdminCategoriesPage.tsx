import { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'
import type { Category } from '../types'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Category | null>(null)
  const [creating, setCreating] = useState(false)
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formSubcategories, setFormSubcategories] = useState<{ name: string; slug: string }[]>([])
  const [error, setError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const loadCategories = useCallback(() => {
    setLoading(true)
    api.admin.categories
      .list({ active: false })
      .then((res) => setCategories(res.categories))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  function openCreate() {
    setCreating(true)
    setEditing(null)
    setFormName('')
    setFormSlug('')
    setFormSubcategories([])
    setError('')
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setCreating(false)
    setFormName(cat.name)
    setFormSlug(cat.slug)
    setFormSubcategories(cat.subcategories ?? [])
    setError('')
  }

  function closeForm() {
    setCreating(false)
    setEditing(null)
    setFormName('')
    setFormSlug('')
    setFormSubcategories([])
    setError('')
  }

  function addSubcategory() {
    setFormSubcategories((prev) => [...prev, { name: '', slug: '' }])
  }

  function updateSubcategory(index: number, field: 'name' | 'slug', value: string) {
    setFormSubcategories((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      if (field === 'name') next[index].slug = slugify(value)
      return next
    })
  }

  function removeSubcategory(index: number) {
    setFormSubcategories((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setFormLoading(true)
    try {
      const subcats = formSubcategories.filter((s) => s.name.trim() && s.slug.trim())
      if (creating) {
        await api.admin.categories.create({
          name: formName.trim(),
          slug: formSlug.trim() || slugify(formName),
          subcategories: subcats,
        })
      } else if (editing) {
        await api.admin.categories.update(editing._id, {
          name: formName.trim(),
          slug: formSlug.trim() || slugify(formName),
          subcategories: subcats,
        })
      }
      loadCategories()
      closeForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İşlem başarısız')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) return
    try {
      await api.admin.categories.delete(id)
      loadCategories()
      if (editing?._id === id) closeForm()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Silme başarısız')
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Kategoriler</h1>
        <button
          onClick={openCreate}
          className="shrink-0 rounded-lg bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-600"
        >
          + Yeni Kategori
        </button>
      </div>

      {(creating || editing) && (
        <div className="mb-8 rounded-xl border border-zinc-600 bg-zinc-800 p-6">
          <h2 className="mb-4 font-semibold text-white">
            {creating ? 'Yeni Kategori' : 'Kategori Düzenle'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/20 p-3 text-sm text-red-400">{error}</div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">Ad</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value)
                    setFormSlug(slugify(e.target.value))
                  }}
                  required
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-700 px-4 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">Slug</label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="kategori-slug (ad yazınca otomatik)"
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-700 px-4 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-300">Alt kategoriler</label>
                <button
                  type="button"
                  onClick={addSubcategory}
                  className="text-sm text-primary-500 hover:underline"
                >
                  + Alt kategori ekle
                </button>
              </div>
              <div className="space-y-2">
                {formSubcategories.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => updateSubcategory(i, 'name', e.target.value)}
                      placeholder="Alt kategori adı"
                      className="flex-1 rounded-lg border border-zinc-600 bg-zinc-700 px-4 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      value={s.slug}
                      onChange={(e) => updateSubcategory(i, 'slug', e.target.value)}
                      placeholder="slug"
                      className="w-32 rounded-lg border border-zinc-600 bg-zinc-700 px-4 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeSubcategory(i)}
                      className="rounded-lg border border-zinc-600 px-3 py-2 text-red-400 hover:bg-zinc-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={formLoading}
                className="rounded-lg bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-600 disabled:opacity-50"
              >
                {formLoading ? 'Kaydediliyor...' : creating ? 'Oluştur' : 'Güncelle'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-zinc-600 px-4 py-2 text-zinc-300 hover:bg-zinc-700"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-zinc-700" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-zinc-600 bg-zinc-800 p-12 text-center">
          <p className="text-zinc-400">Henüz kategori yok.</p>
          <button
            onClick={openCreate}
            className="mt-4 text-primary-500 hover:underline"
          >
            İlk kategoriyi oluştur
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-600 bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-600">
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Kategori</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Alt kategoriler</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Durum</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id} className="border-b border-zinc-700 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{c.name}</p>
                    <p className="text-xs text-zinc-500">{c.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {(c.subcategories ?? []).length > 0
                      ? (c.subcategories ?? []).map((s) => s.name).join(', ')
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        c.isActive ? 'bg-green-500/20 text-green-400' : 'bg-zinc-600 text-zinc-400'
                      }`}
                    >
                      {c.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(c)}
                      className="mr-2 text-sm text-primary-500 hover:underline"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(c._id, c.name)}
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
