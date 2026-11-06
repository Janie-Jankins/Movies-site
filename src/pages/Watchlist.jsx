import MovieCard from '../components/MovieCard'
import { EmptyState } from '../components/Status'
import { usePageTitle } from '../hooks/usePageTitle'
import { useWatchlist } from '../hooks/useWatchlist'

export default function Watchlist() {
  const { items } = useWatchlist()
  usePageTitle('Watchlist')

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">Saved on this device</p>
      <h1 className="mt-2 font-display text-5xl sm:text-6xl">Watchlist</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-mist">
        {items.length
          ? `${items.length} ${items.length === 1 ? 'film stays' : 'films stay'} in this browser until you remove them. Saving and removing updates the rest of the site immediately.`
          : 'Nothing is saved yet. Add a film from its card, the featured carousel, or its details page.'}
      </p>
      <div className="mt-8">
        {items.length === 0 ? (
          <EmptyState
            title="Your list is a blank screen"
            message="Browse the catalogue and save the films you want to come back to. The list remains after a refresh."
            actionLabel="Browse movies"
            actionTo="/movies"
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
