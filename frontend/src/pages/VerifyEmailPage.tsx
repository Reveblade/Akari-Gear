import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { api } from '../api/client'
import { setStoredToken } from '../api/client'
import { useAuth } from '../context/AuthContext'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const tokenFromUrl = searchParams.get('token') ?? ''
  const emailFromState = (location.state as { email?: string } | null)?.email ?? ''
  const { user, refreshUser } = useAuth()
  const [email, setEmail] = useState(emailFromState)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const autoVerified = useRef(false)

  useEffect(() => {
    if (!tokenFromUrl || autoVerified.current) return
    autoVerified.current = true
    setError('')
    setLoading(true)
    api.auth.verifyEmail(tokenFromUrl)
      .then(({ token: authToken }) => {
        setStoredToken(authToken)
        return refreshUser()
      })
      .then(() => setVerified(true))
      .catch((err) => setError(err instanceof Error ? err.message : 'Doğrulama başarısız'))
      .finally(() => setLoading(false))
  }, [tokenFromUrl, refreshUser])

  useEffect(() => {
    if (emailFromState) setEmail(emailFromState)
  }, [emailFromState])

  async function handleResend() {
    const emailToUse = user?.email ?? email
    if (!emailToUse) return
    setResendLoading(true)
    setResendSent(false)
    setError('')
    try {
      await api.auth.resendVerification(emailToUse)
      setResendSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'E-posta gönderilemedi')
    } finally {
      setResendLoading(false)
    }
  }

  if (verified) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-sm text-center dark:border-zinc-600 dark:bg-zinc-800">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
            ✓
          </div>
          <h1 className="font-display text-2xl font-bold text-surface-800 dark:text-zinc-100">
            E-posta Doğrulandı
          </h1>
          <p className="mt-2 text-sm text-surface-500 dark:text-zinc-400">
            Hesabınız başarıyla doğrulandı. Artık tüm özellikleri kullanabilirsiniz.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-xl bg-primary-500 px-6 py-3 font-semibold text-white transition hover:bg-primary-600"
          >
            Ana Sayfaya Git
          </Link>
        </div>
      </div>
    )
  }

  if (tokenFromUrl && loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-sm text-center dark:border-zinc-600 dark:bg-zinc-800">
          <p className="text-surface-600 dark:text-zinc-300">Doğrulanıyor...</p>
        </div>
      </div>
    )
  }

  if (tokenFromUrl && error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-sm text-center dark:border-zinc-600 dark:bg-zinc-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Link to="/" className="mt-4 inline-block font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-sm dark:border-zinc-600 dark:bg-zinc-800">
        <h1 className="font-display text-2xl font-bold text-surface-800 dark:text-zinc-100">E-posta Doğrulama</h1>
        <p className="mt-2 text-sm text-surface-500">
          {user?.emailVerified
            ? 'E-postanız zaten doğrulanmış.'
            : 'E-postanızdaki doğrulama linkine tıklayın.'}
        </p>
        {!user?.emailVerified && (
          <div className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}
            {emailFromState && (
              <p className="text-sm text-surface-600 dark:text-zinc-300">
                Bağlantı şu adrese gönderildi: <strong>{email}</strong>
              </p>
            )}
            {!emailFromState && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-surface-700 dark:text-zinc-300">
                  E-posta (tekrar göndermek için)
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresiniz"
                  className="mt-1 w-full rounded-lg border border-surface-200 px-4 py-2.5 text-surface-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                />
              </div>
            )}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50 dark:text-primary-400"
              >
                {resendLoading ? 'Gönderiliyor...' : 'Doğrulama e-postasını tekrar gönder'}
              </button>
              {resendSent && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">E-posta gönderildi</p>
              )}
            </div>
          </div>
        )}
        {user?.emailVerified && (
          <Link
            to="/"
            className="mt-6 inline-block w-full rounded-xl bg-primary-500 py-3 text-center font-semibold text-white transition hover:bg-primary-600"
          >
            Ana Sayfaya Git
          </Link>
        )}
        <p className="mt-6 text-center text-sm text-surface-500 dark:text-zinc-400">
          <Link to="/" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
            Ana sayfaya dön
          </Link>
        </p>
      </div>
    </div>
  )
}
