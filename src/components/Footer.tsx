import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-surface-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="font-display text-lg font-semibold text-primary-600">
              Mousepad Mağaza
            </Link>
            <p className="mt-2 text-sm text-surface-400">
              Oyun ve verimlilik için premium mousepad'ler.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-surface-600">Mağaza</h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="/products" className="text-sm text-surface-400 hover:text-primary-600">
                  Tüm Ürünler
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-surface-600">Destek</h4>
            <ul className="mt-3 space-y-2">
              <li><span className="text-sm text-surface-400">İletişim</span></li>
              <li><span className="text-sm text-surface-400">SSS</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-surface-600">Yasal</h4>
            <ul className="mt-3 space-y-2">
              <li><span className="text-sm text-surface-400">Gizlilik</span></li>
              <li><span className="text-sm text-surface-400">Koşullar</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-surface-200 pt-8 text-center text-sm text-surface-400">
          © {new Date().getFullYear()} Mousepad Mağaza. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  )
}
