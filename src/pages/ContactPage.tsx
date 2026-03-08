import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'

const CONTACT_PHONE = '+905052601345'
const MAP_URL = 'https://www.google.com/maps/place/Y%C4%B1ld%C4%B1z+Bili%C5%9Fim+Sistemleri/@38.9274444,27.8391738,72m/data=!3m1!1e3!4m7!3m6!1s0x14b9d3d91553d0ef:0x569e847dfade2731!4b1!8m2!3d38.9274704!4d27.8391933!16s%2Fg%2F11vj6q1f70?entry=ttu'

const DESCRIPTION = `Ulu Camii, 180. Sk no:16 D:1A, 45200 Akhisar/Manisa`

export function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SEO
        title="İletişim"
        description="Akari Gear iletişim bilgileri. Bize ulaşın."
        path="/iletisim"
      />
      <nav className="mb-8 text-sm text-surface-400 dark:text-zinc-500">
        <Link to="/" className="hover:text-primary-600">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <span className="text-surface-600 dark:text-zinc-300">İletişim</span>
      </nav>

      <h1 className="font-display text-3xl font-bold text-surface-800 dark:text-zinc-100">İletişim</h1>
      <p className="mt-4 leading-relaxed text-surface-600 dark:text-zinc-400 whitespace-pre-line">
        {DESCRIPTION}
      </p>

      <div className="mt-10 space-y-6 rounded-xl border border-surface-200 bg-surface-50 p-6 dark:border-zinc-600 dark:bg-zinc-800/50">
        <div>
          <h2 className="text-sm font-semibold text-surface-500 dark:text-zinc-400">Telefon</h2>
          <a
            href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`}
            className="mt-1 block text-lg font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {CONTACT_PHONE}
          </a>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-surface-500 dark:text-zinc-400">Adres</h2>
          <a
            href={MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Yıldız Bilişim Sistemleri — Haritada Göster
          </a>
        </div>
      </div>
    </div>
  )
}
