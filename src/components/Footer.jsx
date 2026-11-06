import { Link } from 'react-router-dom'
import { SITE_NAME } from '../config'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl">{SITE_NAME}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-mist">
            A cinematic browser for discovering films. Playback on this demo uses Creative Commons sample movies, never unauthorized streams.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-paper">Browse</p>
          <div className="mt-3 flex flex-col gap-2 text-mist">
            <Link to="/movies" className="hover:text-paper">Movies</Link>
            <Link to="/genres" className="hover:text-paper">Genres</Link>
            <Link to="/trending" className="hover:text-paper">Trending</Link>
            <Link to="/watchlist" className="hover:text-paper">Watchlist</Link>
          </div>
        </div>
        <div className="text-sm text-mist">
          <p className="font-semibold text-paper">Data</p>
          <p className="mt-3 leading-6">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
          <a className="mt-2 inline-flex text-gold" href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
            themoviedb.org
          </a>
        </div>
      </div>
    </footer>
  )
}
