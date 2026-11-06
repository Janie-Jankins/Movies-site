import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MovieRow from '../components/MovieRow'
import { WatchlistButton } from '../components/MovieCard'
import NotFound from './NotFound'
import { ErrorState } from '../components/Status'
import { FilmIcon, PlayIcon, StarIcon } from '../components/Icons'
import { usePageTitle } from '../hooks/usePageTitle'
import { getMovieBundle } from '../services/movieApi'
import { formatRating, formatRuntime, genreNames, imageUrl, movieTitle, pickCertification, pickTrailer, yearOf } from '../utils/movies'
import { primaryBtn } from '../utils/styles'

export default function MovieDetails() {
  const { id } = useParams()
  const [bundle, setBundle] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const movie = bundle?.movie
  usePageTitle(movie ? movieTitle(movie) : 'Movie')

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setBundle(null)
    getMovieBundle(id, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setBundle(data)
        setLoading(false)
      })
      .catch((err) => {
        if (err?.name === 'AbortError' || controller.signal.aborted) return
        setError(err)
        setLoading(false)
      })
    return () => controller.abort()
  }, [id])

  if (loading) {
    return (
      <div className="px-4 pt-28" aria-hidden="true">
        <div className="skeleton h-[70vh] rounded-3xl" />
      </div>
    )
  }

  if (error?.status === 404) return <NotFound message="That title is not in the catalogue." />
  if (error || !movie) {
    return (
      <div className="px-4 pt-8">
        <ErrorState error={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  const title = movieTitle(movie)
  const year = yearOf(movie)
  const directors = (bundle.credits?.crew || []).filter((person) => person.job === 'Director')
  const cast = (bundle.credits?.cast || []).slice(0, 14)
  const trailer = pickTrailer(bundle.videos)
  const certification = pickCertification(bundle.releaseDates)
  const genres = movie.genres?.length
    ? movie.genres
    : genreNames(movie.genre_ids, 4).map((name) => ({ id: name, name }))
  const companies = (movie.production_companies || []).slice(0, 8)
  const poster = imageUrl(movie.poster_path, 'w500')
  const backdrop = imageUrl(movie.backdrop_path, 'w1280')

  return (
    <div className="pb-8">
      <section className="relative min-h-[70vh]">
        {backdrop && <img src={backdrop} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/55" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-28 pb-12 sm:px-6 md:flex-row md:items-end">
          <div className="w-44 shrink-0 overflow-hidden rounded-2xl bg-panel shadow-2xl sm:w-60">
            {poster ? (
              <img src={poster} alt={`${title} poster`} className="aspect-[2/3] w-full object-cover" />
            ) : (
              <div className="grid aspect-[2/3] place-items-center text-mist">
                <FilmIcon className="h-10 w-10" />
                <span className="sr-only">{title} poster unavailable</span>
              </div>
            )}
          </div>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">Movie</p>
            <h1 className="mt-2 font-display text-5xl leading-[0.95] sm:text-7xl">{title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-paper/85">
              {year && <span>{year}</span>}
              {formatRuntime(movie.runtime) && <span>{formatRuntime(movie.runtime)}</span>}
              <span>{certification || 'Unrated'}</span>
              <span className="inline-flex items-center gap-1 text-gold">
                <StarIcon className="h-4 w-4" />
                {formatRating(movie.vote_average)}
                <span className="text-mist">TMDB</span>
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {genres.map((genre) => (
                <Link key={genre.id} to={typeof genre.id === 'number' ? `/genres/${genre.id}` : '/genres'} className="rounded-full border border-white/15 px-3 py-1 text-xs text-paper/85 hover:border-gold/50">
                  {genre.name}
                </Link>
              ))}
            </div>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-paper/85 sm:text-base">
              {movie.overview || 'No synopsis is available for this title.'}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to={`/watch/${movie.id}`} className={primaryBtn}>
                <PlayIcon />
                Watch Now
              </Link>
              <WatchlistButton movie={movie} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <dl className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs tracking-[0.16em] text-mist uppercase">Director</dt>
            <dd className="mt-1 text-sm">{directors.length ? directors.map((person) => person.name).join(', ') : 'Unavailable'}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-[0.16em] text-mist uppercase">Runtime</dt>
            <dd className="mt-1 text-sm">{formatRuntime(movie.runtime) || 'Unavailable'}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-[0.16em] text-mist uppercase">Language</dt>
            <dd className="mt-1 text-sm">{(movie.original_language || '—').toUpperCase()}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-[0.16em] text-mist uppercase">Studios</dt>
            <dd className="mt-1 text-sm">{companies.length ? companies.map((company) => company.name).join(', ') : 'Unavailable'}</dd>
          </div>
        </dl>

        <section className="mt-12">
          <h2 className="font-display text-4xl">Cast</h2>
          {cast.length === 0 ? (
            <p className="mt-3 text-sm text-mist">No cast list is available for this title.</p>
          ) : (
            <ul className="no-scrollbar mt-5 flex gap-4 overflow-x-auto pb-2">
              {cast.map((person) => {
                const photo = imageUrl(person.profile_path, 'w185')
                return (
                  <li key={person.cast_id || person.id} className="w-28 shrink-0">
                    {photo ? (
                      <img src={photo} alt="" className="aspect-[2/3] w-full rounded-2xl object-cover" />
                    ) : (
                      <div className="grid aspect-[2/3] place-items-center rounded-2xl bg-panel text-lg text-mist">
                        {person.name?.slice(0, 1)}
                      </div>
                    )}
                    <p className="mt-2 line-clamp-2 text-sm font-medium">{person.name}</p>
                    <p className="line-clamp-2 text-xs text-mist">{person.character}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="mt-12">
          <h2 className="font-display text-4xl">Trailer</h2>
          {trailer ? (
            <div className="mt-5 overflow-hidden rounded-3xl bg-black ring-1 ring-white/10">
              <iframe
                className="aspect-video w-full"
                src={`https://www.youtube-nocookie.com/embed/${trailer.key}`}
                title={`${title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="mt-3 text-sm text-mist">No trailer is available for this title.</p>
          )}
        </section>

        <MovieRow title="Recommended" subtitle="Titles TMDB relates to this film." movies={bundle.recommendations?.results || []} />
        <MovieRow title="Similar movies" subtitle="Nearby in genre and tone." movies={bundle.similar?.results || []} />
      </div>
    </div>
  )
}
