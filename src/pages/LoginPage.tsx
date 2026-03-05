import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
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
      navigate(from)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-sm dark:border-zinc-600 dark:bg-zinc-800">
        <h1 className="font-display text-2xl font-bold text-surface-800 dark:text-zinc-100">Giriş Yap</h1>
        <p className="mt-2 text-sm text-surface-500 dark:text-zinc-400">
          Hesabınıza giriş yapın
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-surface-700 dark:text-zinc-300">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-surface-200 px-4 py-2.5 text-surface-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-surface-700 dark:text-zinc-300">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-surface-200 px-4 py-2.5 text-surface-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
            />
          </div>
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Şifremi unuttum
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary-500 py-3 font-semibold text-white transition hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-surface-500">
          Hesabınız yok mu?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
            Kayıt olun
          </Link>
        </p>
      </div>
    </div>
  )
}
