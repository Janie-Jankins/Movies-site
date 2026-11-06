import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { COLLECTIONS, defaultSort, GENRES, SORTS } from '../config'
import { usePagedMovies } from '../hooks/usePagedMovies'
import { usePageTitle } from '../hooks/usePageTitle'
import { fetchCatalogue } from '../services/movieApi'
import { fieldClass, ghostBtn } from '../utils/styles'
import MovieCard from './MovieCard'
import { EmptyState, ErrorState, InfiniteScroll, MovieSkeletonGrid, Spinner } from './Status'

export default function CatalogBrowser({
  title,
  eyebrow = 'Catalogue',
  lockedGenreId = '',
  syncUrl = false,
}) {
  const [params, setParams] = useSearchParams()
  const list = syncUrl ? params.get('list') || 'popular' : params.get('list') || 'popular'
  const genreId = lockedGenreId || (syncUrl ? params.get('genre') || '' : '')
  const sort = params.get('sort') || defaultSort(list)
  const genre = GENRES.find((item) => String(item.id) === String(genreId))

  const fetcher = useCallback(
    (page, signal) => fetchCatalogue({ list, sort, genreId, page }, signal),
    [list, sort, genreId],
  )
  const catalog = usePagedMovies(fetcher)
  usePageTitle(title)

  function apply(next) {
    const nextParams = {}
    if (next.list && next.list !== 'popular') nextParams.list = next.list
    if (next.sort && next.sort !== defaultSort(next.list || 'popular')) nextParams.sort = next.sort
    if (!lockedGenreId && next.genreId) nextParams.genre = String(next.genreId)
    if (lockedGenreId && next.list && next.list !== 'popular') nextParams.list = next.list
    if (lockedGenreId && next.sort && next.sort !== defaultSort(next.list || 'popular')) nextParams.sort = next.sort
    setParams(nextParams, { replace: true })
  }

  const usingTrending = list === 'trending' && !genreId && sort === 'popularity.desc'
  const countLabel = catalog.totalResults
    ? `${catalog.totalResults.toLocaleString()} titles in this TMDB slice`
    : 'Results appear as TMDB responds'

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">{eyebrow}</p>
        <h1 className="mt-2 font-display text-5xl sm:text-6xl">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-mist">
          {genre ? `${genre.name}. ` : ''}
          {list === 'classics' ? 'Classics here means films released in 1989 or earlier with a solid vote count. ' : ''}
          {usingTrending
            ? "This view follows TMDB's weekly trending order. "
            : 'Sorted from the TMDB catalogue. '}
          {countLabel}. The service returns a large index, not every film ever released.
        </p>
      </div>

      <form className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap" onSubmit={(event) => event.preventDefault()}>
        <label className="text-xs text-mist">
          Collection
          <select
            className={`${fieldClass} mt-1 block w-full sm:w-auto`}
            value={COLLECTIONS.some((item) => item.id === list) ? list : 'popular'}
            onChange={(event) => apply({ list: event.target.value, sort: defaultSort(event.target.value), genreId })}
          >
            {COLLECTIONS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
        {!lockedGenreId && (
          <label className="text-xs text-mist">
            Genre
            <select
              className={`${fieldClass} mt-1 block w-full sm:w-auto`}
              value={genreId}
              onChange={(event) => apply({ list, sort, genreId: event.target.value })}
            >
              <option value="">All genres</option>
              {GENRES.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
        )}
        <label className="text-xs text-mist">
          Sort
          <select
            className={`${fieldClass} mt-1 block w-full sm:w-auto`}
            value={sort}
            onChange={(event) => apply({ list, sort: event.target.value, genreId })}
          >
            {SORTS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className={`${ghostBtn} self-end px-4 py-2.5`}
          onClick={() => apply({ list: 'popular', sort: defaultSort('popular'), genreId: '' })}
        >
          Reset
        </button>
      </form>

      <div className="mt-8">
        {catalog.loading && <MovieSkeletonGrid />}
        {!catalog.loading && catalog.error && catalog.movies.length === 0 && (
          <ErrorState error={catalog.error} onRetry={catalog.retry} />
        )}
        {!catalog.loading && !catalog.error && catalog.movies.length === 0 && (
          <EmptyState
            title="No titles in this slice"
            message="Try another collection, genre, or sort. Some filters, especially upcoming releases, can be sparse."
          />
        )}
        {catalog.movies.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {catalog.movies.map((movie, index) => (
              <MovieCard key={movie.id} movie={movie} priority={index < 6} />
            ))}
          </div>
        )}
        <InfiniteScroll
          enabled={catalog.hasMore && !catalog.loading && !catalog.loadingMore && !catalog.error}
          onLoadMore={catalog.loadMore}
        />
        <div className="mt-6 flex flex-col items-center gap-3">
          {catalog.loadingMore && <Spinner />}
          {catalog.error && catalog.movies.length > 0 && (
            <button type="button" className={ghostBtn} onClick={catalog.loadMore}>
              Could not load more. Try again
            </button>
          )}
          {!catalog.loading && catalog.hasMore && !catalog.loadingMore && (
            <button type="button" className={ghostBtn} onClick={catalog.loadMore}>
              Load more
            </button>
          )}
          {!catalog.loading && !catalog.hasMore && catalog.movies.length > 0 && (
            <p className="text-sm text-mist">You have reached the end of this list.</p>
          )}
        </div>
      </div>
    </div>
  )
}
