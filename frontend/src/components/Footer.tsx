import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-surface-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="font-display text-lg font-semibold text-primary-600 dark:text-primary-400">
              Akari Gear
            </Link>
            <p className="mt-2 text-sm text-surface-400">
              Oyun ve verimlilik için premium mousepad'ler.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-surface-600 dark:text-zinc-400">Mağaza</h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="/products" className="text-sm text-surface-400 hover:text-primary-600 dark:text-zinc-500 dark:hover:text-primary-400">
                  Tüm Ürünler
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-surface-600 dark:text-zinc-400">Destek</h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="/iletisim" className="text-sm text-surface-400 hover:text-primary-600 dark:text-zinc-500 dark:hover:text-primary-400">
                  İletişim
                </Link>
              </li>
              <li>
                <Link to="/sss" className="text-sm text-surface-400 hover:text-primary-600 dark:text-zinc-500 dark:hover:text-primary-400">
                  SSS
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-surface-600 dark:text-zinc-400">Yasal</h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="/gizlilik" className="text-sm text-surface-400 hover:text-primary-600 dark:text-zinc-500 dark:hover:text-primary-400">
                  Gizlilik
                </Link>
              </li>
              <li>
                <Link to="/kosullar" className="text-sm text-surface-400 hover:text-primary-600 dark:text-zinc-500 dark:hover:text-primary-400">
                  Koşullar
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-surface-200 pt-8 text-center text-sm text-surface-400 dark:border-zinc-700 dark:text-zinc-500">
          © {new Date().getFullYear()} Akari Gear. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  )
}
