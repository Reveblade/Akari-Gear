import { useState, useEffect, useCallback } from 'react'

interface CarouselProps {
  children: React.ReactNode[]
  autoPlay?: boolean
  interval?: number
  className?: string
}

export function Carousel({ children, autoPlay = true, interval = 5000, className = '' }: CarouselProps) {
  const [active, setActive] = useState(0)
  const items = Array.isArray(children) ? children : [children]

  const next = useCallback(() => {
    setActive((a) => (a + 1) % items.length)
  }, [items.length])

  const prev = useCallback(() => {
    setActive((a) => (a - 1 + items.length) % items.length)
  }, [items.length])

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return
    const id = setInterval(next, interval)
    return () => clearInterval(id)
  }, [autoPlay, interval, next, items.length])

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {items.map((child, i) => (
          <div key={i} className="min-w-full flex-shrink-0">
            {child}
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition hover:bg-white"
            aria-label="Önceki"
          >
            <svg className="h-5 w-5 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition hover:bg-white"
            aria-label="Sonraki"
          >
            <svg className="h-5 w-5 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all ${
                  i === active ? 'w-6 bg-primary-500' : 'w-2 bg-white/70 hover:bg-white'
                }`}
                aria-label={`Slayt ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
