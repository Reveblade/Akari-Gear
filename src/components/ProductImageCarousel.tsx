import { useState, useCallback, useRef } from 'react'

interface ProductImageCarouselProps {
  images: string[]
  alt: string
  className?: string
}

export function ProductImageCarousel({ images, alt, className = '' }: ProductImageCarouselProps) {
  const [active, setActive] = useState(0)
  const touchStart = useRef(0)
  const hasMultiple = images.length > 1

  const next = useCallback(() => {
    setActive((a) => (a + 1) % images.length)
  }, [images.length])

  const prev = useCallback(() => {
    setActive((a) => (a - 1 + images.length) % images.length)
  }, [images.length])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev()
    }
  }

  if (images.length === 0) {
    return (
      <div className={`flex aspect-square items-center justify-center rounded-2xl border border-surface-200 bg-surface-100 dark:border-zinc-600 dark:bg-zinc-700 ${className}`}>
        <div className="text-surface-300 text-9xl dark:text-zinc-500">⌨</div>
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-surface-200 bg-surface-100 dark:border-zinc-600 dark:bg-zinc-700 ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="aspect-square overflow-hidden">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {images.map((src, i) => (
            <div key={i} className="h-full w-full flex-shrink-0">
              <img
                src={src}
                alt={`${alt} - ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {hasMultiple && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 p-2 shadow-lg transition hover:bg-white dark:bg-zinc-800/90 dark:hover:bg-zinc-600"
            aria-label="Önceki görsel"
          >
            <svg className="h-5 w-5 text-surface-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 p-2 shadow-lg transition hover:bg-white dark:bg-zinc-800/90 dark:hover:bg-zinc-600"
            aria-label="Sonraki görsel"
          >
            <svg className="h-5 w-5 text-surface-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all ${
                  i === active ? 'w-6 bg-primary-500' : 'w-2 bg-white/70 hover:bg-white dark:bg-zinc-600 dark:hover:bg-zinc-500'
                }`}
                aria-label={`Görsel ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
