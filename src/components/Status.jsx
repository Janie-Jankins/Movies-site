import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { primaryBtn } from '../utils/styles'

export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-white/20 border-t-gold ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

export function ErrorState({ error, onRetry }) {
  const missingKey = error?.status === 401
  return (
    <div role="alert" className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
      <p className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">Lumina</p>
      <h2 className="mt-3 font-display text-4xl text-paper">
        {missingKey ? 'Connect The Movie Database' : 'Movies could not be loaded'}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-mist">
        {error?.message || 'The catalogue is temporarily unavailable.'}
      </p>
      {missingKey && (
        <ol className="mx-auto mt-6 max-w-lg list-decimal space-y-2 pl-5 text-left text-sm leading-6 text-paper/90">
          <li>
            Create a free account at{' '}
            <a className="text-gold underline" href="https://www.themoviedb.org/signup" target="_blank" rel="noreferrer">
              themoviedb.org
            </a>
            .
          </li>
          <li>Open Settings, then API, and create a developer key.</li>
          <li>
            In the project folder, copy <code>.env.example</code> to <code>.env</code> and set <code>TMDB_API_KEY</code>.
          </li>
          <li>Restart <code>npm run dev</code>. The key stays on the dev server and is not bundled into the site.</li>
        </ol>
      )}
      {onRetry && (
        <button type="button" className={`${primaryBtn} mt-8`} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, message, actionLabel, actionTo }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
      <h2 className="font-display text-4xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-mist">{message}</p>
      {actionTo && (
        <Link to={actionTo} className={`${primaryBtn} mt-8`}>
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

export function MovieSkeletonGrid({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          <div className="skeleton aspect-[2/3] rounded-2xl" />
          <div className="skeleton mt-3 h-4 rounded" />
          <div className="skeleton mt-2 h-3 w-2/3 rounded" />
        </div>
      ))}
    </div>
  )
}

export function RowSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 7 }, (_, index) => (
        <div key={index} className="w-[46%] shrink-0 sm:w-[30%] md:w-[23%] lg:w-[18%] xl:w-[15%]">
          <div className="skeleton aspect-[2/3] rounded-2xl" />
        </div>
      ))}
    </div>
  )
}

export function InfiniteScroll({ enabled, onLoadMore }) {
  const ref = useRef(null)
  const onLoadMoreRef = useRef(onLoadMore)
  onLoadMoreRef.current = onLoadMore

  useEffect(() => {
    const node = ref.current
    if (!node || !enabled) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMoreRef.current()
      },
      { rootMargin: '600px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [enabled])

  return <div ref={ref} className="h-8" />
}

export function ErrorBoundary({ children }) {
  return children
}
