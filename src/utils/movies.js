import { GENRES } from '../config'

const IMAGE_BASE = 'https://image.tmdb.org/t/p'
const CERT_ORDER = ['US', 'GB', 'ZA', 'CA', 'AU', 'DE', 'FR']

export function movieTitle(movie) {
  return movie?.title || movie?.name || 'Untitled'
}

export function yearOf(movie) {
  const date = movie?.release_date || movie?.first_air_date || ''
  return date.slice(0, 4)
}

export function imageUrl(path, size = 'w500') {
  if (!path) return null
  return `${IMAGE_BASE}/${size}${path}`
}

export function formatRating(value) {
  const number = Number(value)
  if (!number) return 'NR'
  return number.toFixed(1)
}

export function formatRuntime(minutes) {
  const mins = Number(minutes)
  if (!mins) return null
  const hours = Math.floor(mins / 60)
  const rest = mins % 60
  if (!hours) return `${rest}m`
  return `${hours}h ${rest}m`
}

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  const pad = (value) => String(value).padStart(2, '0')
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(secs)}`
  return `${minutes}:${pad(secs)}`
}

export function genreNames(ids = [], limit = 3) {
  return ids
    .map((id) => GENRES.find((genre) => genre.id === Number(id))?.name)
    .filter(Boolean)
    .slice(0, limit)
}

export function pickCertification(releaseDates) {
  const regions = releaseDates?.results || []
  const read = (region) => region?.release_dates?.find((entry) => entry.certification)?.certification

  for (const code of CERT_ORDER) {
    const cert = read(regions.find((region) => region.iso_3166_1 === code))
    if (cert) return cert
  }

  for (const region of regions) {
    const cert = read(region)
    if (cert) return cert
  }

  return null
}

export function pickTrailer(videos) {
  const clips = (videos?.results || []).filter((video) => video.site === 'YouTube' && video.key)
  return (
    clips.find((video) => video.type === 'Trailer' && video.official) ||
    clips.find((video) => video.type === 'Trailer') ||
    clips.find((video) => video.type === 'Teaser') ||
    clips[0] ||
    null
  )
}

export function toSavedMovie(movie) {
  return {
    id: Number(movie.id),
    title: movieTitle(movie),
    overview: movie.overview || '',
    poster_path: movie.poster_path || null,
    backdrop_path: movie.backdrop_path || null,
    release_date: movie.release_date || '',
    vote_average: movie.vote_average || 0,
    genre_ids: movie.genre_ids || (movie.genres || []).map((genre) => genre.id),
  }
}
