import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-surface-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="font-display text-xl font-semibold text-primary-600">
          Mousepad Mağaza
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-surface-500 transition-colors hover:text-primary-600"
          >
            Ana Sayfa
          </Link>
          <Link
            to="/products"
            className="text-sm font-medium text-surface-500 transition-colors hover:text-primary-600"
          >
            Ürünler
          </Link>
        </nav>
      </div>
    </header>
  )
}
