export const SITE_NAME = 'Lumina'
export const WATCHLIST_KEY = 'lumina-watchlist'
export const PROFILE_KEY = 'lumina-profile'
export const HERO_INTERVAL_MS = 6500
export const SEARCH_DEBOUNCE_MS = 400

export const GENRES = [
  { id: 28, name: 'Action', blurb: 'Chases, fights, and high stakes.', tone: 'from-red-950 to-zinc-900' },
  { id: 12, name: 'Adventure', blurb: 'Journeys past the edge of the map.', tone: 'from-emerald-950 to-zinc-900' },
  { id: 16, name: 'Animation', blurb: 'Drawn worlds and bold color.', tone: 'from-fuchsia-950 to-zinc-900' },
  { id: 35, name: 'Comedy', blurb: 'Timing, trouble, and a good laugh.', tone: 'from-amber-900 to-zinc-900' },
  { id: 80, name: 'Crime', blurb: 'Heists, cases, and moral grey.', tone: 'from-slate-800 to-zinc-950' },
  { id: 99, name: 'Documentary', blurb: 'True stories, closely observed.', tone: 'from-stone-700 to-zinc-950' },
  { id: 18, name: 'Drama', blurb: 'Character, conflict, and consequence.', tone: 'from-indigo-950 to-zinc-900' },
  { id: 14, name: 'Fantasy', blurb: 'Myths made visible.', tone: 'from-violet-950 to-zinc-900' },
  { id: 27, name: 'Horror', blurb: 'Dread, with the lights down.', tone: 'from-rose-950 to-black' },
  { id: 9648, name: 'Mystery', blurb: 'Clues, secrets, and late answers.', tone: 'from-cyan-950 to-zinc-900' },
  { id: 10749, name: 'Romance', blurb: 'Connection, at its most cinematic.', tone: 'from-pink-950 to-zinc-900' },
  { id: 878, name: 'Science Fiction', blurb: 'Futures, near and far.', tone: 'from-sky-950 to-zinc-900' },
  { id: 53, name: 'Thriller', blurb: 'Tension that does not let up.', tone: 'from-orange-950 to-zinc-950' },
  { id: 37, name: 'Western', blurb: 'Dust, duty, and open country.', tone: 'from-yellow-950 to-stone-950' },
]

export const COLLECTIONS = [
  { id: 'popular', label: 'Popular' },
  { id: 'trending', label: 'Trending' },
  { id: 'latest', label: 'Latest releases' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'top_rated', label: 'Top rated' },
  { id: 'classics', label: 'Classics' },
]

export const SORTS = [
  { id: 'popularity.desc', label: 'Popularity' },
  { id: 'primary_release_date.desc', label: 'Newest release' },
  { id: 'primary_release_date.asc', label: 'Oldest release' },
  { id: 'vote_average.desc', label: 'Rating' },
]

export const SAMPLE_VIDEOS = [
  {
    id: 'sintel-trailer',
    title: 'Sintel (trailer)',
    credit: 'Blender Foundation',
    src: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
  },
]

export const HOME_GENRE_ROWS = [
  { id: 28, title: 'Action' },
  { id: 35, title: 'Comedy' },
  { id: 18, title: 'Drama' },
  { id: 27, title: 'Horror' },
  { id: 878, title: 'Science fiction' },
  { id: 16, title: 'Animation' },
  { id: 10749, title: 'Romance' },
  { id: 53, title: 'Thriller' },
]

export function defaultSort(list) {
  if (list === 'latest') return 'primary_release_date.desc'
  if (list === 'upcoming') return 'primary_release_date.asc'
  if (list === 'top_rated' || list === 'classics') return 'vote_average.desc'
  return 'popularity.desc'
}

export function sampleVideoFor(id) {
  const index = Math.abs(Number(id) || 0) % SAMPLE_VIDEOS.length
  return SAMPLE_VIDEOS[index]
}
