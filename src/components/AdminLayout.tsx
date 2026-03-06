import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const STORE_URL = import.meta.env.VITE_FRONTEND_URL ?? 'http://localhost:8000'

export function AdminLayout() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    navigate('/login', { state: { from: '/' }, replace: true })
    return null
  }

  return (
    <div className="flex min-h-screen bg-zinc-900">
      <aside className="w-56 shrink-0 border-r border-zinc-700 bg-zinc-800">
        <div className="sticky top-0 flex flex-col gap-1 p-4">
          <h2 className="mb-4 px-3 font-display text-lg font-semibold text-white">
            Admin Panel
          </h2>
          <Link
            to="/"
            className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            to="/products"
            className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white"
          >
            Ürünler
          </Link>
          <Link
            to="/orders"
            className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white"
          >
            Siparişler
          </Link>
          <Link
            to="/users"
            className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white"
          >
            Üyeler
          </Link>
          <Link
            to="/categories"
            className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white"
          >
            Kategoriler
          </Link>
          <Link
            to="/exchange-rate"
            className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white"
          >
            Dolar Kuru
          </Link>
          <a
            href={STORE_URL}
            className="mt-4 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-700 hover:text-white"
          >
            ← Mağazaya Dön
          </a>
          <div className="mt-4 border-t border-zinc-700 pt-4">
            <p className="px-3 py-1 text-xs text-zinc-500">Giriş yapan</p>
            <p className="px-3 py-1 text-sm font-medium text-white truncate" title={user?.email}>
              {user?.email}
            </p>
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-400 hover:bg-zinc-700 hover:text-white"
            >
              Çıkış yap
            </button>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
