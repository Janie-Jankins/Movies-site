import { COLLECTIONS, defaultSort } from '../config'

export class MovieApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'MovieApiError'
    this.status = status
  }
}

async function request(path, params = {}, signal) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  })
  const query = search.toString()

  let response
  try {
    response = await fetch(`/tmdb${path}${query ? `?${query}` : ''}`, { signal })
  } catch (error) {
    if (error?.name === 'AbortError' || signal?.aborted) {
      const abortError = new Error('aborted')
      abortError.name = 'AbortError'
      throw abortError
    }
    throw new MovieApiError('The movie service could not be reached. Check your connection and restart the dev server.', 0)
  }

  let body = null
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    if (response.status === 401 || body?.status_code === 7) {
      throw new MovieApiError(
        'TMDB refused the request. Add a valid API key to the .env file as TMDB_API_KEY and restart the dev server.',
        401,
      )
    }
    if (response.status === 404) throw new MovieApiError('This title could not be found.', 404)
    throw new MovieApiError(body?.status_message || 'Movie data could not be loaded.', response.status)
  }

  return body || {}
}

function emptyOnError(fallback) {
  return (error) => {
    if (error?.name === 'AbortError') throw error
    return fallback
  }
}

function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

export function getTrending(window = 'week', page = 1, signal) {
  const safeWindow = window === 'day' ? 'day' : 'week'
  return request(`/trending/movie/${safeWindow}`, { page, language: 'en-US' }, signal)
}

export function searchMovies(query, page = 1, signal) {
  return request('/search/movie', {
    query,
    page,
    include_adult: false,
    language: 'en-US',
  }, signal)
}

export function getMovie(id, signal) {
  return request(`/movie/${encodeURIComponent(id)}`, { language: 'en-US' }, signal)
}

export function discoverMovies({ list = 'popular', sort, genreId, page = 1 } = {}, signal) {
  const safeList = COLLECTIONS.some((item) => item.id === list) ? list : 'popular'
  const params = {
    page,
    sort_by: sort || defaultSort(safeList),
    include_adult: false,
    language: 'en-US',
  }

  if (genreId) params.with_genres = genreId

  const today = new Date()
  if (safeList === 'upcoming') {
    params['primary_release_date.gte'] = isoDate(today)
  } else if (safeList === 'latest') {
    const start = new Date(today)
    start.setDate(start.getDate() - 120)
    params['primary_release_date.gte'] = isoDate(start)
    params['primary_release_date.lte'] = isoDate(today)
    params['vote_count.gte'] = 10
  } else if (safeList === 'classics') {
    params['primary_release_date.lte'] = '1989-12-31'
    params['vote_count.gte'] = 250
  } else if (safeList === 'top_rated') {
    params['vote_count.gte'] = 800
  } else {
    params['vote_count.gte'] = 50
  }

  return request('/discover/movie', params, signal)
}

export function fetchCatalogue({ list, sort, genreId, page }, signal) {
  const safeList = COLLECTIONS.some((item) => item.id === list) ? list : 'popular'
  const safeSort = sort || defaultSort(safeList)
  const trendingDefault = safeList === 'trending' && !genreId && safeSort === 'popularity.desc'
  if (trendingDefault) return getTrending('week', page, signal)

  return discoverMovies({
    list: safeList === 'trending' ? 'popular' : safeList,
    sort: safeSort,
    genreId,
    page,
  }, signal)
}

export async function getMovieBundle(id, signal) {
  const movie = await getMovie(id, signal)
  const [credits, videos, similar, recommendations, releaseDates] = await Promise.all([
    request(`/movie/${id}/credits`, { language: 'en-US' }, signal).catch(emptyOnError({ cast: [], crew: [] })),
    request(`/movie/${id}/videos`, { language: 'en-US' }, signal).catch(emptyOnError({ results: [] })),
    request(`/movie/${id}/similar`, { page: 1, language: 'en-US' }, signal).catch(emptyOnError({ results: [] })),
    request(`/movie/${id}/recommendations`, { page: 1, language: 'en-US' }, signal).catch(emptyOnError({ results: [] })),
    request(`/movie/${id}/release_dates`, {}, signal).catch(emptyOnError({ results: [] })),
  ])

  return { movie, credits, videos, similar, recommendations, releaseDates }
}

export async function getBecauseYouSaved(saved, signal) {
  const seeds = saved.slice(0, 3)
  const lists = await Promise.all(
    seeds.map((movie) =>
      request(`/movie/${movie.id}/recommendations`, { page: 1, language: 'en-US' }, signal).catch(emptyOnError({ results: [] })),
    ),
  )

  const seen = new Set(saved.map((movie) => movie.id))
  const merged = []
  const pushUnique = (movie) => {
    if (!movie?.id || seen.has(movie.id)) return
    seen.add(movie.id)
    merged.push(movie)
  }

  lists.forEach((list) => (list.results || []).forEach(pushUnique))

  if (merged.length < 8) {
    const counts = new Map()
    saved.forEach((movie) => {
      ;(movie.genre_ids || []).forEach((genreId) => {
        counts.set(genreId, (counts.get(genreId) || 0) + 1)
      })
    })
    const topGenre = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
    if (topGenre) {
      const extra = await discoverMovies({ list: 'popular', genreId: topGenre }, signal).catch(emptyOnError({ results: [] }))
      ;(extra.results || []).forEach(pushUnique)
    }
  }

  return merged.slice(0, 20)
}
