import { Route, Routes } from 'react-router-dom'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import Layout from './components/Layout'
import { GenreMovies, Genres } from './pages/Genres'
import Home from './pages/Home'
import MovieDetails from './pages/MovieDetails'
import Movies from './pages/Movies'
import NotFound from './pages/NotFound'
import Player from './pages/Player'
import SearchResults from './pages/SearchResults'
import Trending from './pages/Trending'
import Watchlist from './pages/Watchlist'

export default function App() {
  return (
    <AppErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="movies" element={<Movies />} />
          <Route path="movie/:id" element={<MovieDetails />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="watch/:id" element={<Player />} />
          <Route path="genres" element={<Genres />} />
          <Route path="genres/:genreId" element={<GenreMovies />} />
          <Route path="trending" element={<Trending />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AppErrorBoundary>
  )
}
