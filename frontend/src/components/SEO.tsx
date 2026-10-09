import { Helmet } from 'react-helmet-async'

const SITE_URL = import.meta.env.VITE_SITE_URL ?? (typeof window !== 'undefined' ? window.location.origin : 'https://akarigear.com')

export interface SEOProps {
  title?: string
  description?: string
  image?: string
  path?: string
  type?: 'website' | 'product'
  jsonLd?: object
}

export function SEO({ title, description, image, path = '', type = 'website', jsonLd }: SEOProps) {
  const fullUrl = `${SITE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
  const fullImage = image?.startsWith('http') ? image : image ? `${SITE_URL.replace(/\/$/, '')}${image.startsWith('/') ? image : `/${image}`}` : `${SITE_URL}/transparent-logo.png`
  const siteName = 'Akari Gear'
  const defaultTitle = `${siteName} — Premium Oyun & Verimlilik`
  const defaultDesc = "Oyun ve verimlilik için premium mousepad'ler. Hassas yüzeyler, dayanıklı malzemeler."
  const finalTitle = title ? `${title} — ${siteName}` : defaultTitle
  const finalDesc = description ?? defaultDesc

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      <link rel="canonical" href={fullUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="tr_TR" />
      <meta name="twitter:card" content={type === 'product' ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={fullImage} />
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  )
}
