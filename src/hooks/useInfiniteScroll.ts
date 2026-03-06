import { useEffect, useRef, useCallback, useState } from 'react'

interface Pagination {
  page: number
  pages: number
  total: number
  limit: number
}

interface UseInfiniteScrollOptions<T> {
  fetchPage: (page: number) => Promise<{ items: T[]; pagination: Pagination }>
  deps?: unknown[]
}

export function useInfiniteScroll<T>({
  fetchPage,
  deps = [],
}: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const loadPage = useCallback(
    async (pageNum: number, append: boolean) => {
      if (append) setLoadingMore(true)
      else setLoading(true)
      try {
        const { items: newItems, pagination } = await fetchPage(pageNum)
        setItems((prev) => (append ? [...prev, ...newItems] : newItems))
        setHasMore(pageNum < pagination.pages)
      } catch {
        setItems((prev) => (append ? prev : []))
        setHasMore(false)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [fetchPage]
  )

  const pageRef = useRef(1)
  pageRef.current = page

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return
    const nextPage = pageRef.current + 1
    setPage(nextPage)
    loadPage(nextPage, true)
  }, [loading, loadingMore, hasMore, loadPage])

  useEffect(() => {
    setPage(1)
    setHasMore(true)
    loadPage(1, false)
  }, deps)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore || loading || loadingMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: '100px', threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loading, loadingMore, loadMore])

  const reset = useCallback(() => {
    setPage(1)
    setHasMore(true)
    loadPage(1, false)
  }, [loadPage])

  return { items, loading, loadingMore, hasMore, sentinelRef, reset }
}
