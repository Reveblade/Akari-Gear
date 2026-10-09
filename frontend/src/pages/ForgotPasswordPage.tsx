import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.auth.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İşlem başarısız')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-sm text-center dark:border-zinc-600 dark:bg-zinc-800">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-2xl text-primary-600">
            ✓
          </div>
          <h1 className="font-display text-2xl font-bold text-surface-800 dark:text-zinc-100">
            E-posta Gönderildi
          </h1>
          <p className="mt-2 text-sm text-surface-500 dark:text-zinc-400">
            E-posta adresinize şifre sıfırlama bağlantısı gönderdik. Lütfen gelen kutunuzu kontrol edin.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-surface-800">Şifremi Unuttum</h1>
        <p className="mt-2 text-sm text-surface-500">
          E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
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
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary-500 py-3 font-semibold text-white transition hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
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
