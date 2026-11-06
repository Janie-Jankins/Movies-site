import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { SEARCH_DEBOUNCE_MS } from '../config'
import { useDebounce } from '../hooks/useDebounce'
import { searchMovies } from '../services/movieApi'
import { imageUrl, movieTitle, yearOf } from '../utils/movies'
import { CloseIcon, FilmIcon, SearchIcon } from './Icons'
import { Spinner } from './Status'

export default function SearchBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState(null)
  const [active, setActive] = useState(-1)
  const rootRef = useRef(null)
  const debounced = useDebounce(query, SEARCH_DEBOUNCE_MS)

  useEffect(() => {
    if (location.pathname === '/search') setQuery(params.get('q') || '')
  }, [location.pathname, location.search, params])

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    const trimmed = debounced.trim()
    if (trimmed.length < 2) {
      setResults([])
      setSearching(false)
      setError(null)
      return undefined
    }

    const controller = new AbortController()
    setSearching(true)
    searchMovies(trimmed, 1, controller.signal)
      .then((data) => {
        setResults((data.results || []).slice(0, 6))
        setError(null)
        setSearching(false)
        setActive(-1)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setError(err)
        setResults([])
        setSearching(false)
      })

    return () => controller.abort()
  }, [debounced])

  function goToResults(value) {
    const trimmed = value.trim()
    if (!trimmed) {
      navigate('/search')
      return
    }
    setOpen(false)
    navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  function choose(movie) {
    setOpen(false)
    setQuery('')
    navigate(`/movie/${movie.id}`)
  }

  function onKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActive((current) => Math.min(current + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => Math.max(current - 1, -1))
    } else if (event.key === 'Enter' && active >= 0 && results[active]) {
      event.preventDefault()
      choose(results[active])
    }
  }

  const showPanel = open && query.trim().length > 0

  return (
    <form
      role="search"
      className="relative w-full"
      ref={rootRef}
      onSubmit={(event) => {
        event.preventDefault()
        goToResults(query)
      }}
    >
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-mist" />
      <input
        type="search"
        value={query}
        placeholder="Search movies"
        aria-label="Search movies"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="search-suggestions"
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 && results[active] ? `suggestion-${results[active].id}` : undefined}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="w-full rounded-full border border-white/10 bg-white/8 py-2.5 pr-10 pl-10 text-sm text-paper outline-none placeholder:text-mist focus:border-gold/70"
      />
      {searching ? (
        <span className="absolute top-1/2 right-3 -translate-y-1/2">
          <Spinner className="h-4 w-4" />
        </span>
      ) : query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQuery('')
            setResults([])
            setOpen(false)
            if (location.pathname === '/search') navigate('/search')
          }}
          className="absolute top-1/2 right-2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-mist hover:text-paper"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      )}

      {showPanel && (
        <div id="search-suggestions" className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#121216] shadow-2xl">
          {searching && results.length === 0 && (
            <p className="flex items-center gap-2 px-4 py-3 text-sm text-mist">
              <Spinner className="h-4 w-4" /> Searching
            </p>
          )}
          {error && (
            <p className="px-4 py-3 text-sm text-mist">{error.status === 401 ? 'Add a TMDB API key to search.' : 'Search is unavailable right now.'}</p>
          )}
          {!searching && !error && query.trim().length < 2 && (
            <p className="px-4 py-3 text-sm text-mist">Keep typing to see matches.</p>
          )}
          {!searching && !error && query.trim().length >= 2 && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-mist">No movies match that title.</p>
          )}
          <ul role="listbox" aria-label="Movie suggestions">
            {results.map((movie, index) => {
              const poster = imageUrl(movie.poster_path, 'w185')
              return (
                <li key={movie.id} id={`suggestion-${movie.id}`} role="option" aria-selected={active === index}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(index)}
                    onClick={() => choose(movie)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left ${active === index ? 'bg-white/8' : ''}`}
                  >
                    {poster ? (
                      <img src={poster} alt="" className="h-14 w-10 rounded-md object-cover" />
                    ) : (
                      <span className="grid h-14 w-10 place-items-center rounded-md bg-panel text-mist">
                        <FilmIcon className="h-4 w-4" />
                      </span>
                    )}
                    <span>
                      <span className="block text-sm font-medium text-paper">{movieTitle(movie)}</span>
                      <span className="block text-xs text-mist">{yearOf(movie) || 'Year unknown'}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          {query.trim() && (
            <button type="submit" className="w-full border-t border-white/10 px-4 py-3 text-left text-sm font-semibold text-gold">
              See all results
            </button>
          )}
        </div>
      )}
    </form>
  )
}
