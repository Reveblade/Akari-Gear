import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const STORE_URL = import.meta.env.VITE_FRONTEND_URL ?? 'http://localhost:4000'

export function LoginPage() {
  const { login, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(email, password)
      if ('requiresTwoFactor' in result && result.requiresTwoFactor) {
        navigate('/verify-2fa', { state: { email: result.email, from } })
        return
      }
      const authRes = result as { success: true; user?: { role: string } }
      if (authRes.success && authRes.user?.role !== 'admin') {
        logout()
        setError('Bu panel sadece admin hesapları içindir. Mağaza girişine yönlendiriliyorsunuz.')
        setTimeout(() => {
          window.location.href = `${STORE_URL}/login`
        }, 2000)
        return
      }
      navigate(from)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-600 bg-zinc-800 p-8 shadow-lg">
        <h1 className="font-display text-2xl font-bold text-white">Admin Girişi</h1>
        <p className="mt-2 text-sm text-zinc-400">Yönetim paneline erişmek için giriş yapın</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/20 p-3 text-sm text-red-400">{error}</div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-700 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-700 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary-500 py-3 font-semibold text-white transition hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-500">
          Müşteri hesabınızla mı giriş yapmak istiyorsunuz?{' '}
          <a href={`${STORE_URL}/login`} className="font-medium text-primary-500 hover:underline">
            Mağaza girişi
          </a>
        </p>
      </div>
    </div>
  )
}
