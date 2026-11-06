import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWatchlist } from '../hooks/useWatchlist'
import { formatRating, genreNames, imageUrl, movieTitle, yearOf } from '../utils/movies'
import { CheckIcon, FilmIcon, PlayIcon, PlusIcon, StarIcon } from './Icons'

export function WatchlistButton({ movie, variant = 'text' }) {
  const { has, toggle } = useWatchlist()
  const saved = has(movie.id)
  const label = saved ? 'Remove from Watchlist' : 'Add to Watchlist'
  const [message, setMessage] = useState('')

  return (
    <>
      <button
        type="button"
        aria-pressed={saved}
        aria-label={label}
        title={label}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          const willRemove = has(movie.id)
          toggle(movie)
          setMessage(`${willRemove ? 'Removed' : 'Saved'} ${movieTitle(movie)}`)
        }}
        className={
          variant === 'icon'
            ? 'grid h-11 w-11 place-items-center rounded-full bg-ink/80 text-paper ring-1 ring-white/15 transition hover:bg-ink'
            : `inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold backdrop-blur transition ${
                saved
                  ? 'border-gold/50 bg-gold/15 text-gold hover:bg-gold/20'
                  : 'border-white/15 bg-white/10 text-paper hover:bg-white/16'
              }`
        }
      >
        {saved ? <CheckIcon /> : <PlusIcon />}
        {variant !== 'icon' && <span>{label}</span>}
      </button>
      <span className="sr-only" aria-live="polite">{message}</span>
    </>
  )
}

function Poster({ path, title, size, priority = false }) {
  const [failed, setFailed] = useState(false)
  const src = !failed ? imageUrl(path, size) : null

  if (!src) {
    return (
      <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_top,#2c2e36,#101114)] text-mist" aria-hidden="true">
        <FilmIcon className="h-8 w-8" />
        <span className="sr-only">{title} poster unavailable</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt=""
      loading={priority ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
    />
  )
}

export default function MovieCard({ movie, priority = false }) {
  const title = movieTitle(movie)
  const year = yearOf(movie)
  const genre = genreNames(movie.genre_ids, 1)[0]

  return (
    <article className="group">
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-panel shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
        <Poster path={movie.poster_path} title={title} size="w500" priority={priority} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent opacity-80" />
        <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-1 rounded-full bg-ink/75 px-2 py-1 text-xs text-gold">
          <StarIcon className="h-3.5 w-3.5" />
          {formatRating(movie.vote_average)}
        </div>
        <div className="absolute inset-x-3 bottom-3 z-20 flex gap-2 opacity-100 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          <Link
            to={`/watch/${movie.id}`}
            className="grid h-11 w-11 place-items-center rounded-full bg-gold text-[#1a1204]"
            aria-label={`Watch ${title}`}
          >
            <PlayIcon />
          </Link>
          <WatchlistButton movie={movie} variant="icon" />
        </div>
        <Link to={`/movie/${movie.id}`} className="absolute inset-0 z-10" aria-label={`View details for ${title}`} />
      </div>
      <div className="px-1 pt-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-paper">
          <Link to={`/movie/${movie.id}`} className="hover:text-gold">{title}</Link>
        </h3>
        <p className="mt-1 text-xs text-mist">
          {[year, genre].filter(Boolean).join(' · ') || 'Release date unavailable'}
        </p>
      </div>
    </article>
  )
}
