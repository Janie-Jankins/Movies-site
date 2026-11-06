import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HERO_INTERVAL_MS } from '../config'
import { formatRating, genreNames, imageUrl, movieTitle, yearOf } from '../utils/movies'
import { primaryBtn } from '../utils/styles'
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, StarIcon } from './Icons'
import { WatchlistButton } from './MovieCard'

export default function HeroCarousel({ movies }) {
  const [index, setIndex] = useState(0)
  const [cycle, setCycle] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hidden, setHidden] = useState(() => document.hidden)
  const reduced = useReducedMotion()
  const count = movies.length
  const movie = movies[index] || movies[0]

  useEffect(() => {
    setIndex(0)
    setCycle((value) => value + 1)
  }, [movies])

  useEffect(() => {
    const onChange = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  useEffect(() => {
    if (paused || hidden || reduced || count < 2) return undefined
    const timeout = setTimeout(() => {
      setIndex((current) => (current + 1) % count)
    }, HERO_INTERVAL_MS)
    return () => clearTimeout(timeout)
  }, [paused, hidden, reduced, count, index, cycle])

  if (!movie) return null

  const title = movieTitle(movie)
  const year = yearOf(movie)
  const genres = genreNames(movie.genre_ids, 3)
  const textTransition = reduced ? { duration: 0 } : { duration: 0.65, ease: [0.22, 1, 0.36, 1] }

  function step(direction) {
    setIndex((current) => (current + direction + count) % count)
    setCycle((value) => value + 1)
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured movies"
      className="relative min-h-[78vh] overflow-hidden sm:min-h-[88vh]"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setPaused(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setPaused(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          step(1)
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          step(-1)
        }
      }}
      onTouchStart={(event) => {
        event.currentTarget.dataset.touchX = String(event.changedTouches[0]?.clientX || 0)
      }}
      onTouchEnd={(event) => {
        const start = Number(event.currentTarget.dataset.touchX || 0)
        const delta = (event.changedTouches[0]?.clientX || 0) - start
        if (delta > 48) step(-1)
        if (delta < -48) step(1)
      }}
    >
      <div className="absolute inset-0">
        <AnimatePresence>
          <motion.img
            key={movie.id}
            src={imageUrl(movie.backdrop_path, 'w1280')}
            alt=""
            initial={reduced ? false : { opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.9, ease: 'easeInOut' }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/50" />
      </div>

      <div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-end px-4 pt-28 pb-16 sm:min-h-[88vh] sm:px-6 sm:pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={movie.id}
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -12 }}
            transition={textTransition}
            className="max-w-2xl"
          >
            <p className="text-xs font-semibold tracking-[0.24em] text-gold uppercase">Featured</p>
            <h1 className="mt-3 font-display text-5xl leading-[0.95] text-paper sm:text-7xl">{title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-paper/85">
              {year && <span>{year}</span>}
              {genres.length > 0 && <span className="text-mist">{genres.join(' · ')}</span>}
              <span className="inline-flex items-center gap-1 text-gold">
                <StarIcon className="h-4 w-4" />
                {formatRating(movie.vote_average)}
              </span>
            </div>
            {movie.overview && (
              <p className="mt-5 max-w-xl text-sm leading-6 text-paper/80 sm:text-base sm:leading-7">
                {movie.overview.length > 220 ? `${movie.overview.slice(0, 217).trim()}...` : movie.overview}
              </p>
            )}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to={`/watch/${movie.id}`} className={primaryBtn}>
                <PlayIcon />
                Watch Now
              </Link>
              <WatchlistButton movie={movie} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous featured movie"
            onClick={() => step(-1)}
            className="absolute top-1/2 left-3 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ink/50 text-paper ring-1 ring-white/15 backdrop-blur sm:left-6"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            aria-label="Next featured movie"
            onClick={() => step(1)}
            className="absolute top-1/2 right-3 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ink/50 text-paper ring-1 ring-white/15 backdrop-blur sm:right-6"
          >
            <ChevronRightIcon />
          </button>
          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {movies.map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show ${movieTitle(item)}`}
                aria-current={itemIndex === index}
                onClick={() => {
                  setIndex(itemIndex)
                  setCycle((value) => value + 1)
                }}
                className={`h-2 rounded-full transition-all ${itemIndex === index ? 'w-8 bg-gold' : 'w-2 bg-white/45'}`}
              />
            ))}
          </div>
          {!reduced && !paused && !hidden && (
            <span
              key={`${movie.id}-${cycle}`}
              className="hero-progress absolute inset-x-0 bottom-0 z-10 h-0.5 bg-gold"
              style={{ animationDuration: `${HERO_INTERVAL_MS}ms` }}
            />
          )}
        </>
      )}
    </section>
  )
}
