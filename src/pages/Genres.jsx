import { Link, useParams } from 'react-router-dom'
import CatalogBrowser from '../components/CatalogBrowser'
import { GENRES } from '../config'
import NotFound from './NotFound'

export function Genres() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">Genres</p>
      <h1 className="mt-2 font-display text-5xl sm:text-6xl">Browse by mood</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-mist">
        Each genre opens a filterable catalogue. Lists grow with TMDB pages rather than a fixed handful of titles.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GENRES.map((genre) => (
          <li key={genre.id}>
            <Link
              to={`/genres/${genre.id}`}
              className={`flex min-h-40 flex-col justify-end rounded-3xl bg-gradient-to-br ${genre.tone} p-6 ring-1 ring-white/10 transition hover:-translate-y-1`}
            >
              <h2 className="font-display text-4xl">{genre.name}</h2>
              <p className="mt-2 text-sm text-paper/80">{genre.blurb}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function GenreMovies() {
  const { genreId } = useParams()
  const genre = GENRES.find((item) => String(item.id) === String(genreId))
  if (!genre) return <NotFound message="That genre is not in the Lumina catalogue." />
  return <CatalogBrowser title={genre.name} eyebrow="Genre" lockedGenreId={genre.id} />
}
