import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

export function Verify2FAPage() {
  const { verify2FA } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const tokenFromUrl = searchParams.get('token') ?? ''
  const locationState = location.state as { email?: string; from?: string } | null
  const emailFromState = locationState?.email ?? ''
  const from = locationState?.from ?? '/'
  const [email, setEmail] = useState(emailFromState)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const autoVerified = useRef(false)

  useEffect(() => {
    if (emailFromState) setEmail(emailFromState)
  }, [emailFromState])

  useEffect(() => {
    if (!tokenFromUrl || autoVerified.current) return
    autoVerified.current = true
    setError('')
    setLoading(true)
    verify2FA(tokenFromUrl)
      .then(() => navigate(from))
      .catch((err) => setError(err instanceof Error ? err.message : 'Doğrulama başarısız'))
      .finally(() => setLoading(false))
  }, [tokenFromUrl, verify2FA, navigate, from])

  async function handleResend() {
    if (!email) {
      setError('E-posta gerekli')
      return
    }
    setResendLoading(true)
    setResendSent(false)
    setError('')
    try {
      await api.auth.resend2FA(email)
      setResendSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bağlantı gönderilemedi')
    } finally {
      setResendLoading(false)
    }
  }

  if (tokenFromUrl) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-zinc-600 bg-zinc-800 p-8 text-center">
          {loading ? (
            <p className="text-zinc-300">Doğrulanıyor...</p>
          ) : error ? (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-2xl text-red-400">
                ✕
              </div>
              <h1 className="font-display text-2xl font-bold text-white">Doğrulama Başarısız</h1>
              <p className="mt-2 text-sm text-red-400">{error}</p>
              <Link to="/login" className="mt-6 inline-block font-medium text-primary-500 hover:underline">
                Giriş sayfasına dön
              </Link>
            </>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-zinc-600 bg-zinc-800 p-8">
        <h1 className="font-display text-2xl font-bold text-white">İki Faktörlü Doğrulama</h1>
        <p className="mt-2 text-sm text-zinc-400">
          E-postanıza doğrulama bağlantısı gönderdik. Gelen kutunuzu kontrol edin ve bağlantıya tıklayın.
        </p>
        {error && (
          <div className="mt-4 rounded-lg bg-red-500/20 p-3 text-sm text-red-400">{error}</div>
        )}
        {emailFromState ? (
          <p className="mt-4 text-sm text-zinc-300">
            Bağlantı şu adrese gönderildi: <strong>{email}</strong>
          </p>
        ) : (
          <div className="mt-4">
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
              E-posta (tekrar göndermek için)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresiniz"
              className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-700 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        )}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="text-sm text-primary-500 hover:underline disabled:opacity-50"
          >
            {resendLoading ? 'Gönderiliyor...' : 'Bağlantıyı tekrar gönder'}
          </button>
          {resendSent && <p className="mt-2 text-sm text-green-400">E-posta gönderildi</p>}
        </div>
        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link to="/login" className="font-medium text-primary-500 hover:underline">
            Giriş sayfasına dön
          </Link>
        </p>
      </div>
    </div>
  )
}
