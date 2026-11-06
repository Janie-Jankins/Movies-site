import { useCallback, useEffect, useRef, useState } from 'react'

export function usePagedMovies(fetcher) {
  const [movies, setMovies] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)
  const generation = useRef(0)
  const loadingMoreRef = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    const current = ++generation.current
    loadingMoreRef.current = false
    setLoading(true)
    setLoadingMore(false)
    setError(null)
    setMovies([])

    fetcher(1, controller.signal)
      .then((data) => {
        if (current !== generation.current) return
        setMovies(data.results || [])
        setPage(data.page || 1)
        setTotalPages(data.total_pages || 0)
        setTotalResults(data.total_results || 0)
        setLoading(false)
      })
      .catch((err) => {
        if (controller.signal.aborted || err?.name === 'AbortError') return
        if (current !== generation.current) return
        setError(err)
        setMovies([])
        setLoading(false)
      })

    return () => controller.abort()
  }, [fetcher, reloadToken])

  const hasMore = page < totalPages && page < 500

  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMoreRef.current) return
    const next = page + 1
    const current = generation.current
    loadingMoreRef.current = true
    setLoadingMore(true)
    setError(null)

    fetcher(next)
      .then((data) => {
        if (current !== generation.current) return
        setMovies((prev) => {
          const seen = new Set(prev.map((movie) => movie.id))
          const incoming = (data.results || []).filter((movie) => !seen.has(movie.id))
          return [...prev, ...incoming]
        })
        setPage(data.page || next)
        setTotalPages(data.total_pages || 0)
        setTotalResults(data.total_results || 0)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        if (current !== generation.current) return
        setError(err)
      })
      .finally(() => {
        if (current !== generation.current) return
        loadingMoreRef.current = false
        setLoadingMore(false)
      })
  }, [fetcher, hasMore, loading, page])

  const retry = useCallback(() => setReloadToken((token) => token + 1), [])

  return { movies, page, totalPages, totalResults, loading, loadingMore, error, hasMore, loadMore, retry }
}
