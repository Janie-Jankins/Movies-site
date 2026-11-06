import { useEffect, useMemo, useState } from 'react'
import { WATCHLIST_KEY } from '../config'
import { toSavedMovie } from '../utils/movies'
import { WatchlistContext } from './watchlistStore'

function readWatchlist() {
  try {
    const raw = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]')
    if (!Array.isArray(raw)) return []
    return raw.filter((movie) => movie && Number.isFinite(Number(movie.id)) && movie.title)
  } catch {
    return []
  }
}

export function WatchlistProvider({ children }) {
  const [items, setItems] = useState(readWatchlist)

  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === WATCHLIST_KEY) setItems(readWatchlist())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo(() => {
    const has = (id) => items.some((movie) => movie.id === Number(id))
    const add = (movie) => {
      const saved = toSavedMovie(movie)
      setItems((current) => (current.some((item) => item.id === saved.id) ? current : [saved, ...current]))
    }
    const remove = (id) => setItems((current) => current.filter((movie) => movie.id !== Number(id)))
    const toggle = (movie) => {
      if (has(movie.id)) remove(movie.id)
      else add(movie)
    }
    return { items, has, add, remove, toggle }
  }, [items])

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
}
