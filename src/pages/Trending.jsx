import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import { EmptyState, ErrorState, InfiniteScroll, MovieSkeletonGrid, Spinner } from '../components/Status'
import { usePageTitle } from '../hooks/usePageTitle'
import { usePagedMovies } from '../hooks/usePagedMovies'
import { getTrending } from '../services/movieApi'
import { ghostBtn } from '../utils/styles'

export default function Trending() {
  const [span, setSpan] = useState('week')
  usePageTitle('Trending')
  const fetcher = useCallback((page, signal) => getTrending(span, page, signal), [span])
  const trending = usePagedMovies(fetcher)

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">Trending</p>
      <h1 className="mt-2 font-display text-5xl sm:text-6xl">What people are watching</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-mist">
        Ranked by TMDB's trending score. This is a live slice of the index, so it changes through the day and the week. For popularity, release date, and rating sorts, open the full catalogue.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className={span === 'week' ? ghostBtn : `${ghostBtn} opacity-60`} onClick={() => setSpan('week')}>
          This week
        </button>
        <button type="button" className={span === 'day' ? ghostBtn : `${ghostBtn} opacity-60`} onClick={() => setSpan('day')}>
          Today
        </button>
        <Link to="/movies?list=trending" className={ghostBtn}>Sort in the catalogue</Link>
      </div>
      <div className="mt-8">
        {trending.loading && <MovieSkeletonGrid />}
        {!trending.loading && trending.error && trending.movies.length === 0 && (
          <ErrorState error={trending.error} onRetry={trending.retry} />
        )}
        {!trending.loading && !trending.error && trending.movies.length === 0 && (
          <EmptyState title="No trending titles" message="TMDB did not return a trending list for this window." />
        )}
        {trending.movies.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {trending.movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
        <InfiniteScroll
          enabled={trending.hasMore && !trending.loading && !trending.loadingMore && !trending.error}
          onLoadMore={trending.loadMore}
        />
        {trending.loadingMore && <div className="mt-6 flex justify-center"><Spinner /></div>}
        {!trending.loading && !trending.hasMore && trending.movies.length > 0 && (
          <p className="mt-6 text-center text-sm text-mist">You have reached the end of this trending list.</p>
        )}
      </div>
    </div>
  )
}
