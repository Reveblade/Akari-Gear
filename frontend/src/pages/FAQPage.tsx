import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'

const FAQ_ITEMS = [
  {
    q: 'Siparişim ne zaman kargoya verilir?',
    a: 'Siparişleriniz genellikle 1-2 iş günü içinde kargoya teslim edilir. Stok durumuna bağlı olarak bu süre değişebilir.',
  },
  {
    q: 'Ücretsiz kargo şartı nedir?',
    a: '1.500₺ ve üzeri siparişlerde kargo ücretsizdir. Altındaki siparişlerde kargo ücreti uygulanır.',
  },
  {
    q: 'İade nasıl yapılır?',
    a: '30 gün içinde ürünü orijinal ambalajında, kullanılmamış halde iade edebilirsiniz. İade talebinizi müşteri hizmetlerimiz üzerinden oluşturabilirsiniz.',
  },
  {
    q: 'Mousepad nasıl temizlenir?',
    a: 'Hafif nemli bir bez ile silmeniz yeterlidir. Sert fırça veya ağartıcı kullanmayın. Kurumaya bırakın.',
  },
  {
    q: 'Extended mouse pad ne demek?',
    a: 'Extended (geniş) mouse pad, hem klavye hem de mouse için alan sunan büyük boyutlu masa altlığıdır. Ergonomik kullanım ve geniş hareket alanı sağlar.',
  },
  {
    q: 'Hangi ödeme yöntemleri kabul ediliyor?',
    a: 'Kredi kartı, banka kartı ve havale/EFT ile ödeme yapabilirsiniz. Tüm ödemeler güvenli ödeme altyapısı üzerinden işlenir.',
  },
]

export function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SEO
        title="Sıkça Sorulan Sorular"
        description="Akari Gear sipariş, teslimat, iade ve ürünler hakkında sık sorulan sorular."
        path="/sss"
      />
      <nav className="mb-8 text-sm text-surface-400 dark:text-zinc-500">
        <Link to="/" className="hover:text-primary-600">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <span className="text-surface-600 dark:text-zinc-300">Sıkça Sorulan Sorular</span>
      </nav>

      <h1 className="font-display text-3xl font-bold text-surface-800 dark:text-zinc-100">Sıkça Sorulan Sorular</h1>
      <p className="mt-2 text-surface-500 dark:text-zinc-400">
        Sipariş, teslimat ve ürünler hakkında merak ettikleriniz.
      </p>

      <div className="mt-10 space-y-6">
        {FAQ_ITEMS.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-surface-200 bg-white p-5 dark:border-zinc-600 dark:bg-zinc-800/50"
          >
            <h2 className="font-semibold text-surface-700 dark:text-zinc-200">{item.q}</h2>
            <p className="mt-2 text-surface-600 dark:text-zinc-400 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-surface-500 dark:text-zinc-400">
        Cevabını bulamadığınız sorular için{' '}
        <Link to="/iletisim" className="text-primary-600 hover:underline dark:text-primary-400">
          İletişim
        </Link>{' '}
        sayfamızdan bize ulaşabilirsiniz.
      </p>
    </div>
  )
}
