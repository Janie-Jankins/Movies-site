import { useEffect, useMemo, useState } from 'react'
import { HOME_GENRE_ROWS } from '../config'
import { usePageTitle } from '../hooks/usePageTitle'
import { useWatchlist } from '../hooks/useWatchlist'
import { discoverMovies, getBecauseYouSaved, getTrending } from '../services/movieApi'
import HeroCarousel from '../components/HeroCarousel'
import MovieRow from '../components/MovieRow'
import { ErrorState } from '../components/Status'

function uniqueWithBackdrops(lists) {
  const seen = new Set()
  const movies = []
  lists.flat().forEach((movie) => {
    if (!movie?.backdrop_path || seen.has(movie.id)) return
    seen.add(movie.id)
    movies.push(movie)
  })
  return movies.slice(0, 6)
}

export default function Home() {
  const { items } = useWatchlist()
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)
  const [recommended, setRecommended] = useState([])
  const [recLoading, setRecLoading] = useState(true)
  usePageTitle('Home')

  useEffect(() => {
    const controller = new AbortController()
    const jobs = [
      ['trending', getTrending('week', 1, controller.signal)],
      ['popular', discoverMovies({ list: 'popular' }, controller.signal)],
      ['latest', discoverMovies({ list: 'latest' }, controller.signal)],
      ['top', discoverMovies({ list: 'top_rated' }, controller.signal)],
      ['upcoming', discoverMovies({ list: 'upcoming' }, controller.signal)],
      ...HOME_GENRE_ROWS.map((genre) => [String(genre.id), discoverMovies({ list: 'popular', genreId: genre.id }, controller.signal)]),
    ]

    setLoading(true)
    setError(null)

    Promise.allSettled(jobs.map((job) => job[1])).then((results) => {
      if (controller.signal.aborted) return
      const next = {}
      let failures = 0
      let firstError = null
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') next[jobs[index][0]] = result.value.results || []
        else {
          failures += 1
          firstError = firstError || result.reason
        }
      })
      if (failures === jobs.length) {
        setRows(null)
        setError(firstError)
      } else {
        setRows(next)
        setError(null)
      }
      setLoading(false)
    })

    return () => controller.abort()
  }, [attempt])

  const savedKey = items.map((movie) => movie.id).join(',')

  useEffect(() => {
    const controller = new AbortController()
    setRecLoading(true)
    const request = items.length
      ? getBecauseYouSaved(items, controller.signal)
      : discoverMovies({ list: 'top_rated' }, controller.signal).then((data) => data.results || [])

    request
      .then((movies) => {
        if (controller.signal.aborted) return
        setRecommended(movies)
        setRecLoading(false)
      })
      .catch((err) => {
        if (err?.name === 'AbortError' || controller.signal.aborted) return
        setRecommended([])
        setRecLoading(false)
      })

    return () => controller.abort()
  }, [savedKey, items])

  const heroMovies = useMemo(
    () => uniqueWithBackdrops([rows?.trending || [], rows?.popular || []]),
    [rows],
  )

  if (!loading && error && !rows) {
    return (
      <div className="px-4 pt-32 pb-16">
        <ErrorState error={error} onRetry={() => setAttempt((value) => value + 1)} />
      </div>
    )
  }

  return (
    <div>
      {heroMovies.length > 0 ? (
        <HeroCarousel movies={heroMovies} />
      ) : (
        <section className="relative min-h-[52vh] bg-[radial-gradient(circle_at_top,#2a2418,transparent_55%),#070708]">
          <div className="mx-auto flex min-h-[52vh] max-w-7xl items-end px-4 pt-32 pb-16 sm:px-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">Featured</p>
              <h1 className="mt-3 max-w-xl font-display text-5xl sm:text-7xl">Films, gathered in one dark room.</h1>
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <MovieRow
          title={items.length ? 'Because of your watchlist' : 'Recommended tonight'}
          subtitle={
            items.length
              ? 'Similar titles and popular films from genres you have saved.'
              : 'Highly rated films to start a watchlist. Save something and this row will follow your taste.'
          }
          movies={recommended}
          loading={recLoading || loading}
        />
        <MovieRow title="Trending this week" movies={rows?.trending} loading={loading} href="/trending" />
        <MovieRow title="Popular" movies={rows?.popular} loading={loading} href="/movies" />
        <MovieRow title="Latest releases" movies={rows?.latest} loading={loading} href="/movies?list=latest" />
        <MovieRow title="Top rated" movies={rows?.top} loading={loading} href="/movies?list=top_rated" />
        <MovieRow title="Upcoming" movies={rows?.upcoming} loading={loading} href="/movies?list=upcoming" />
        {HOME_GENRE_ROWS.map((genre) => (
          <MovieRow
            key={genre.id}
            title={genre.title}
            movies={rows?.[String(genre.id)]}
            loading={loading}
            href={`/genres/${genre.id}`}
          />
        ))}
      </div>
    </div>
  )
}
