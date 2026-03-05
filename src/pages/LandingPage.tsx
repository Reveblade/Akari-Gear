import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Carousel } from '../components/Carousel'
import { ProductCard } from '../components/ProductCard'
import { api } from '../api/client'
import type { Product, Category } from '../types'

const HERO_SLIDES = [
  {
    title: 'Hassasiyet Konforla Buluşuyor',
    subtitle: 'En iyisini talep eden oyuncular ve profesyoneller için tasarlandı.',
    cta: 'Alışverişe Başla',
  },
  {
    title: 'Premium Hammadde Seçimi',
    subtitle: 'Dayanıklı yüzeyler. Pürüzsüz kayma, tutarlı takip.',
    cta: 'Ürünleri Keşfet',
  },
  {
    title: 'Performans İçin Tasarlandı',
    subtitle: 'Özenle seçilmiş koleksiyonumuzla kurulumunuzu optimize edin.',
    cta: 'Koleksiyonu Gör',
  },
]

const FEATURES = [
  { icon: '📦', title: 'Hızlı Kargo', desc: '1.500₺ üzeri siparişlerde ücretsiz teslimat' },
  { icon: '🏆', title: 'Kalite Garantisi', desc: '30 gün sorunsuz iade' },
  { icon: '🔒', title: 'Güvenli Ödeme', desc: 'Verileriniz korunuyor' },
  { icon: '📞', title: '7/24 Destek', desc: 'Size yardımcı olmak için buradayız' },
]

const TESTIMONIALS = [
  { quote: 'Kullandığım en iyi mousepad. Yüzey inanılmaz pürüzsüz.', author: 'Alex K.', role: 'Pro Oyuncu' },
  { quote: 'Uzun kodlama seansları için mükemmel. Bilek yorgunluğu yok.', author: 'Sarah M.', role: 'Yazılım Mühendisi' },
  { quote: 'Kaliteye göre harika fiyat. Kesinlikle tavsiye ederim.', author: 'James L.', role: 'Tasarımcı' },
]

export function LandingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    Promise.all([
      api.getProducts({ featured: true, limit: 20, currency: 'TRY' }),
      api.getCategories(),
    ]).then(([res, catRes]) => {
      setProducts(res.products)
      setCategories(catRes.categories)
    }).catch(() => {})
  }, [])

  return (
    <div>
      {/* Hero Carousel */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Carousel autoPlay interval={5000}>
          {HERO_SLIDES.map((slide, i) => (
            <div
              key={i}
              className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 via-white to-primary-100/50 px-8 py-16 text-center dark:from-primary-900/30 dark:via-zinc-800 dark:to-primary-800/20"
            >
              <h1 className="font-display text-4xl font-bold text-surface-800 sm:text-5xl dark:text-zinc-100">
                {slide.title}
              </h1>
              <p className="mt-4 max-w-xl text-lg text-surface-500 dark:text-zinc-400">{slide.subtitle}</p>
              <Link
                to="/products"
                className="mt-8 inline-flex items-center rounded-xl bg-primary-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-primary-600"
              >
                {slide.cta}
              </Link>
            </div>
          ))}
        </Carousel>
      </section>

      {/* Features Strip */}
      <section className="border-y border-surface-200 bg-white dark:border-zinc-700 dark:bg-zinc-800/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-2xl dark:bg-primary-900/40">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-surface-700 dark:text-zinc-200">{f.title}</h3>
                  <p className="text-sm text-surface-400 dark:text-zinc-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-surface-800 dark:text-zinc-100">Kategoriye Göre Alışveriş</h2>
          <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="flex-shrink-0 rounded-xl border border-surface-200 bg-white px-6 py-4 transition hover:border-primary-300 hover:bg-primary-50 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-primary-600 dark:hover:bg-primary-900/30"
              >
                <span className="font-medium text-surface-700 dark:text-zinc-200">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Carousel */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold text-surface-800 dark:text-zinc-100">Öne Çıkan Ürünler</h2>
        {products.length > 0 ? (
          <div className="mt-8">
            <Carousel autoPlay interval={6000}>
              {[...Array(Math.ceil(products.length / 4))].map((_, chunk) => (
                <div key={chunk} className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                  {products.slice(chunk * 4, chunk * 4 + 4).map((p) => (
                    <ProductCard key={p._id} product={p} compact />
                  ))}
                </div>
              ))}
            </Carousel>
          </div>
        ) : (
          <p className="mt-8 text-surface-400 dark:text-zinc-500">Henüz ürün yok. Backend seed script'ini çalıştırın.</p>
        )}
      </section>

      {/* Testimonials Carousel */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold text-surface-800 dark:text-zinc-100">Müşterilerimiz Ne Diyor</h2>
        <div className="mt-8">
          <Carousel autoPlay interval={5000}>
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="rounded-2xl border border-surface-200 bg-white p-8 text-center dark:border-zinc-600 dark:bg-zinc-800"
              >
                <p className="text-lg text-surface-600 italic dark:text-zinc-300">"{t.quote}"</p>
                <p className="mt-4 font-semibold text-surface-700 dark:text-zinc-200">{t.author}</p>
                <p className="text-sm text-surface-400 dark:text-zinc-500">{t.role}</p>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-primary-500 px-8 py-16 text-center text-white dark:bg-primary-600">
          <h2 className="font-display text-3xl font-bold">Yükseltmeye Hazır mısınız?</h2>
          <p className="mt-2 text-primary-100">Binlerce memnun müşterimize katılın.</p>
          <Link
            to="/products"
            className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 font-semibold text-primary-600 transition hover:bg-primary-50"
          >
            Ürünlerimize Göz Atın
          </Link>
        </div>
      </section>
    </div>
  )
}
