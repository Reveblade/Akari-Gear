import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { setStoredToken } from '../api/client'
import { useAuth } from '../context/AuthContext'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const { refreshUser } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor')
      return
    }
    if (!token) {
      setError('Geçersiz veya eksik sıfırlama bağlantısı')
      return
    }
    setLoading(true)
    try {
      const { token: authToken } = await api.auth.resetPassword(token, password)
      setStoredToken(authToken)
      await refreshUser()
      setSuccess(true)
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Şifre sıfırlama başarısız')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-sm text-center dark:border-zinc-600 dark:bg-zinc-800">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
            ✓
          </div>
          <h1 className="font-display text-2xl font-bold text-surface-800">
            Şifre Sıfırlandı
          </h1>
          <p className="mt-2 text-sm text-surface-500 dark:text-zinc-400">
            Yeni şifrenizle giriş yapabilirsiniz. Ana sayfaya yönlendiriliyorsunuz...
          </p>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-sm text-center dark:border-zinc-600 dark:bg-zinc-800">
          <h1 className="font-display text-2xl font-bold text-surface-800">
            Geçersiz Bağlantı
          </h1>
          <p className="mt-2 text-sm text-surface-500 dark:text-zinc-400">
            Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen yeni bir bağlantı isteyin.
          </p>
          <Link
            to="/forgot-password"
            className="mt-6 inline-block font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Yeni bağlantı iste
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-sm dark:border-zinc-600 dark:bg-zinc-800">
        <h1 className="font-display text-2xl font-bold text-surface-800">Yeni Şifre Belirle</h1>
        <p className="mt-2 text-sm text-surface-500">
          Hesabınız için yeni bir şifre girin
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-surface-700 dark:text-zinc-300">
              Yeni Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-surface-200 px-4 py-2.5 text-surface-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
            />
            <p className="mt-1 text-xs text-surface-500 dark:text-zinc-500">
              En az 8 karakter, bir harf ve bir rakam içermelidir
            </p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-surface-700 dark:text-zinc-300">
              Şifre (tekrar)
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-surface-200 px-4 py-2.5 text-surface-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary-500 py-3 font-semibold text-white transition hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : 'Şifreyi Sıfırla'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-surface-500 dark:text-zinc-400">
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
            Giriş sayfasına dön
          </Link>
        </p>
      </div>
    </div>
  )
}
