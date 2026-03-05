import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'

export function Header() {
  const { user, loading, logout, enable2FA, disable2FA, refreshUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { items } = useCart()
  const navigate = useNavigate()
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [twoFALoading, setTwoFALoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-surface-200/80 bg-white/95 backdrop-blur-sm dark:border-zinc-700/80 dark:bg-zinc-900/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="font-display text-xl font-semibold text-primary-600 dark:text-primary-400">
          Mousepad Mağaza
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-surface-500 transition-colors hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400"
          >
            Ana Sayfa
          </Link>
          <Link
            to="/products"
            className="text-sm font-medium text-surface-500 transition-colors hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400"
          >
            Ürünler
          </Link>
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            title={theme === 'light' ? 'Karanlık mod' : 'Aydınlık mod'}
          >
            {theme === 'light' ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => {
              if (user) navigate('/cart')
              else navigate('/login', { state: { from: '/cart' } })
            }}
            className="relative flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Sepetim
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
          {!loading && (
            user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-800 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                >
                  <span className="max-w-[120px] truncate">{user.email}</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-52 rounded-lg border border-surface-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                    {user.twoFactorEnabled ? (
                      <button
                        onClick={async () => {
                          setTwoFALoading(true)
                          try {
                            await disable2FA()
                            await refreshUser()
                          } finally {
                            setTwoFALoading(false)
                            setMenuOpen(false)
                          }
                        }}
                        disabled={twoFALoading}
                        className="block w-full px-4 py-2 text-left text-sm text-surface-700 hover:bg-surface-50 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        {twoFALoading ? '...' : '2FA Kapat'}
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          setTwoFALoading(true)
                          try {
                            await enable2FA()
                            await refreshUser()
                          } finally {
                            setTwoFALoading(false)
                            setMenuOpen(false)
                          }
                        }}
                        disabled={twoFALoading}
                        className="block w-full px-4 py-2 text-left text-sm text-surface-700 hover:bg-surface-50 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        {twoFALoading ? '...' : '2FA Aç'}
                      </button>
                    )}
                    <button
                      onClick={() => { logout(); setMenuOpen(false) }}
                      className="block w-full px-4 py-2 text-left text-sm text-surface-700 hover:bg-surface-50 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-surface-500 transition-colors hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600"
                >
                  Kayıt Ol
                </Link>
              </div>
            )
          )}
        </nav>
      </div>
    </header>
  )
}
