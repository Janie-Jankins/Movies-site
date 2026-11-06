import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { ghostBtn } from '../utils/styles'

export default function NotFound({ message = 'That page is not on the marquee.' }) {
  usePageTitle('Not found')
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-start justify-center px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">404</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl">Lost in the aisle</h1>
      <p className="mt-4 max-w-md text-sm leading-6 text-mist">{message}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/" className={ghostBtn}>Back home</Link>
        <Link to="/movies" className={ghostBtn}>Browse movies</Link>
      </div>
    </div>
  )
}
