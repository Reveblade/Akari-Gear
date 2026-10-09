import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'

export function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SEO
        title="Kullanım Koşulları"
        description="Akari Gear kullanım koşulları ve satış şartları."
        path="/kosullar"
      />
      <nav className="mb-8 text-sm text-surface-400 dark:text-zinc-500">
        <Link to="/" className="hover:text-primary-600">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <span className="text-surface-600 dark:text-zinc-300">Kullanım Koşulları</span>
      </nav>

      <h1 className="font-display text-3xl font-bold text-surface-800 dark:text-zinc-100">Kullanım Koşulları</h1>
      <p className="mt-4 text-sm text-surface-500 dark:text-zinc-400">
        Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
      </p>

      <div className="mt-8 space-y-6 text-surface-600 dark:text-zinc-400">
        <section>
          <h2 className="text-lg font-semibold text-surface-700 dark:text-zinc-200">1. Genel Hükümler</h2>
          <p className="mt-2 leading-relaxed">
            Bu web sitesini kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Akari Gear ürün ve hizmetlerinin satışı bu koşullara tabidir.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-surface-700 dark:text-zinc-200">2. Sipariş ve Ödeme</h2>
          <p className="mt-2 leading-relaxed">
            Siparişleriniz onaylandıktan sonra işleme alınır. Fiyatlar Türk Lirası (₺) cinsindendir. Ödeme, sipariş sırasında seçtiğiniz yöntemle alınır.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-surface-700 dark:text-zinc-200">3. Teslimat</h2>
          <p className="mt-2 leading-relaxed">
            Belirli tutarın üzerindeki siparişlerde ücretsiz kargo uygulanır. Teslimat süreleri stok durumuna ve adresinize göre değişiklik gösterebilir.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-surface-700 dark:text-zinc-200">4. İade ve Değişim</h2>
          <p className="mt-2 leading-relaxed">
            Ürünlerimiz 30 gün içinde sorunsuz iade edilebilir. İade koşulları ve süreçleri hakkında detaylı bilgi için müşteri hizmetlerimizle iletişime geçebilirsiniz.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-surface-700 dark:text-zinc-200">5. Fikri Mülkiyet</h2>
          <p className="mt-2 leading-relaxed">
            Sitedeki tüm içerik, logo ve tasarımlar Akari Gear'a aittir. İzinsiz kullanım yasaktır.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-surface-700 dark:text-zinc-200">6. İletişim</h2>
          <p className="mt-2 leading-relaxed">
            Sorularınız için{' '}
            <Link to="/iletisim" className="text-primary-600 hover:underline dark:text-primary-400">
              İletişim
            </Link>{' '}
            sayfamızdan bize ulaşabilirsiniz.
          </p>
        </section>
      </div>
    </div>
  )
}
