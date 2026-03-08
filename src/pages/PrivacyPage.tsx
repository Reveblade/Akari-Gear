import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SEO
        title="Gizlilik Politikası"
        description="Akari Gear gizlilik politikası ve kişisel verilerin korunması."
        path="/gizlilik"
      />
      <nav className="mb-8 text-sm text-surface-400 dark:text-zinc-500">
        <Link to="/" className="hover:text-primary-600">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <span className="text-surface-600 dark:text-zinc-300">Gizlilik Politikası</span>
      </nav>

      <h1 className="font-display text-3xl font-bold text-surface-800 dark:text-zinc-100">Gizlilik Politikası</h1>
      <p className="mt-4 text-sm text-surface-500 dark:text-zinc-400">
        Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
      </p>

      <div className="mt-8 space-y-6 text-surface-600 dark:text-zinc-400">
        <section>
          <h2 className="text-lg font-semibold text-surface-700 dark:text-zinc-200">1. Toplanan Veriler</h2>
          <p className="mt-2 leading-relaxed">
            Sipariş ve hesap işlemleriniz sırasında ad, e-posta adresi, telefon numarası, teslimat adresi ve ödeme bilgileri toplanabilir. Bu veriler siparişinizin işlenmesi ve size hizmet sunmamız için gereklidir.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-surface-700 dark:text-zinc-200">2. Verilerin Kullanımı</h2>
          <p className="mt-2 leading-relaxed">
            Topladığımız veriler siparişlerinizi işlemek, müşteri hizmetleri sunmak, yasal yükümlülüklerimizi yerine getirmek ve sizinle iletişim kurmak amacıyla kullanılır.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-surface-700 dark:text-zinc-200">3. Veri Güvenliği</h2>
          <p className="mt-2 leading-relaxed">
            Kişisel verilerinizi korumak için uygun teknik ve idari önlemler alıyoruz. Ödeme bilgileri güvenli ödeme sistemleri üzerinden işlenir.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-surface-700 dark:text-zinc-200">4. Haklarınız</h2>
          <p className="mt-2 leading-relaxed">
            6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında verilerinize erişim, düzeltme, silme ve itiraz haklarınız bulunmaktadır. Talepleriniz için bizimle iletişime geçebilirsiniz.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-surface-700 dark:text-zinc-200">5. İletişim</h2>
          <p className="mt-2 leading-relaxed">
            Gizlilik politikamız hakkında sorularınız için{' '}
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
