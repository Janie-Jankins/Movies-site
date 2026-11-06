import { useContext } from 'react'
import { WatchlistContext } from '../context/watchlistStore'

export function useWatchlist() {
  const value = useContext(WatchlistContext)
  if (!value) throw new Error('useWatchlist must be used within WatchlistProvider')
  return value
}
