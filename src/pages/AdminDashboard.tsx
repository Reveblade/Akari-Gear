import { Link } from 'react-router-dom'

export function AdminDashboard() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
      <p className="mt-2 text-zinc-400">Yönetim paneline hoş geldiniz.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          to="/products"
          className="rounded-xl border border-zinc-600 bg-zinc-800 p-6 transition hover:border-primary-500 hover:bg-zinc-700"
        >
          <h3 className="font-semibold text-white">Ürünler</h3>
          <p className="mt-1 text-sm text-zinc-400">Ürün ekle, düzenle veya sil</p>
        </Link>
        <Link
          to="/orders"
          className="rounded-xl border border-zinc-600 bg-zinc-800 p-6 transition hover:border-primary-500 hover:bg-zinc-700"
        >
          <h3 className="font-semibold text-white">Siparişler</h3>
          <p className="mt-1 text-sm text-zinc-400">Siparişleri görüntüle, onayla</p>
        </Link>
      </div>
    </div>
  )
}
