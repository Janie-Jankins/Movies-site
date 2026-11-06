import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import { EmptyState, ErrorState, InfiniteScroll, MovieSkeletonGrid, Spinner } from '../components/Status'
import { usePageTitle } from '../hooks/usePageTitle'
import { usePagedMovies } from '../hooks/usePagedMovies'
import { searchMovies } from '../services/movieApi'
import { ghostBtn } from '../utils/styles'

export default function SearchResults() {
  const [params] = useSearchParams()
  const query = (params.get('q') || '').trim()
  usePageTitle(query ? `Search: ${query}` : 'Search')

  const fetcher = useCallback((page, signal) => {
    if (!query) return Promise.resolve({ results: [], page: 1, total_pages: 0, total_results: 0 })
    return searchMovies(query, page, signal)
  }, [query])

  const results = usePagedMovies(fetcher)

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">Search</p>
      <h1 className="mt-2 font-display text-5xl sm:text-6xl">{query ? `Results for “${query}”` : 'Search movies'}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-mist">
        {query
          ? `${results.totalResults.toLocaleString()} matching titles from TMDB. Partial titles are included, across older and newer releases.`
          : 'Use the search bar to look up a film by title. Matches open on their own details page.'}
      </p>
      {query && (
        <Link to="/search" className={`${ghostBtn} mt-6 px-4 py-2`}>Clear search</Link>
      )}

      <div className="mt-8">
        {!query && (
          <EmptyState
            title="The lights are up"
            message="Type a title in the search bar. Suggestions appear as you type, and this page keeps the full result list."
            actionLabel="Browse movies"
            actionTo="/movies"
          />
        )}
        {query && results.loading && <MovieSkeletonGrid />}
        {query && !results.loading && results.error && results.movies.length === 0 && (
          <ErrorState error={results.error} onRetry={results.retry} />
        )}
        {query && !results.loading && !results.error && results.movies.length === 0 && (
          <EmptyState
            title="No movies match"
            message={`Nothing in the TMDB index matched “${query}”. Try a shorter or alternate title.`}
            actionLabel="Browse movies"
            actionTo="/movies"
          />
        )}
        {results.movies.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
        <InfiniteScroll
          enabled={Boolean(query) && results.hasMore && !results.loading && !results.loadingMore && !results.error}
          onLoadMore={results.loadMore}
        />
        {results.loadingMore && (
          <div className="mt-6 flex justify-center"><Spinner /></div>
        )}
        {results.error && results.movies.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button type="button" className={ghostBtn} onClick={results.loadMore}>
              Could not load more. Try again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
