import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import VideoPlayer from '../components/VideoPlayer'
import { ErrorState } from '../components/Status'
import { sampleVideoFor } from '../config'
import { usePageTitle } from '../hooks/usePageTitle'
import { getMovie } from '../services/movieApi'
import { imageUrl, movieTitle } from '../utils/movies'
import NotFound from './NotFound'

export default function Player() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const sample = sampleVideoFor(id)
  usePageTitle(movie ? `Watch ${movieTitle(movie)}` : 'Watch')

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setMovie(null)
    getMovie(id, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setMovie(data)
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
      <div className="mx-auto max-w-6xl px-4" aria-hidden="true">
        <div className="skeleton aspect-video rounded-3xl" />
      </div>
    )
  }

  if (error?.status === 404) return <NotFound message="That title is not in the catalogue." />
  if (error || !movie) {
    return (
      <div className="px-4">
        <ErrorState error={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">Now playing</p>
      <h1 className="mt-2 mb-5 font-display text-4xl sm:text-5xl">{movieTitle(movie)}</h1>
      <VideoPlayer
        src={`/api/media/${sample.id}`}
        poster={imageUrl(movie.backdrop_path || movie.poster_path, 'w1280')}
        title={movieTitle(movie)}
        backTo={`/movie/${movie.id}`}
        sample={sample}
      />
    </div>
  )
}
