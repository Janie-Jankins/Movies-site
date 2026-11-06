import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import MovieCard from './MovieCard'
import { RowSkeleton } from './Status'
import { ChevronLeftIcon, ChevronRightIcon } from './Icons'

export default function MovieRow({ title, subtitle, movies, loading = false, href }) {
  const scroller = useRef(null)
  const reduced = useReducedMotion()

  if (!loading && (!movies || movies.length === 0)) return null

  function scrollByDir(direction) {
    const node = scroller.current
    if (!node) return
    node.scrollBy({
      left: direction * node.clientWidth * 0.8,
      behavior: reduced ? 'auto' : 'smooth',
    })
  }

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-paper sm:text-4xl">{title}</h2>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-mist">{subtitle}</p>}
        </div>
        {href && (
          <Link to={href} className="shrink-0 text-sm font-semibold text-gold hover:text-[#f0c98a]">
            View all
          </Link>
        )}
      </div>
      {loading ? (
        <RowSkeleton />
      ) : (
        <div className="relative">
          <button
            type="button"
            aria-label={`Scroll ${title} backward`}
            onClick={() => scrollByDir(-1)}
            className="absolute top-[38%] left-0 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ink/80 text-paper ring-1 ring-white/15 md:grid"
          >
            <ChevronLeftIcon />
          </button>
          <div ref={scroller} className="no-scrollbar flex gap-4 overflow-x-auto scroll-px-1 pb-2">
            {movies.map((movie) => (
              <div key={movie.id} className="w-[46%] shrink-0 sm:w-[31%] md:w-[23%] lg:w-[18%] xl:w-[15.5%]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
          <button
            type="button"
            aria-label={`Scroll ${title} forward`}
            onClick={() => scrollByDir(1)}
            className="absolute top-[38%] right-0 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ink/80 text-paper ring-1 ring-white/15 md:grid"
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}
    </section>
  )
}
