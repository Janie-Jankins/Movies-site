import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { PROFILE_KEY, SITE_NAME } from '../config'
import { useWatchlist } from '../hooks/useWatchlist'
import SearchBar from './SearchBar'
import { CloseIcon, MenuIcon, UserIcon } from './Icons'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/movies', label: 'Movies' },
  { to: '/genres', label: 'Genres' },
  { to: '/trending', label: 'Trending' },
  { to: '/watchlist', label: 'Watchlist' },
]

function linkClass(isActive) {
  return `text-sm font-semibold transition ${isActive ? 'text-gold' : 'text-paper/75 hover:text-paper'}`
}

export default function Navbar() {
  const location = useLocation()
  const reduced = useReducedMotion()
  const { items } = useWatchlist()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [name, setName] = useState(() => localStorage.getItem(PROFILE_KEY) || 'Guest')
  const profileRef = useRef(null)
  const bleed = location.pathname === '/' || /^\/movie\/[^/]+$/.test(location.pathname)
  const solid = scrolled || !bleed

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setProfileOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, name)
  }, [name])

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition ${solid ? 'border-b border-white/10 bg-ink/90 backdrop-blur-md' : 'bg-gradient-to-b from-ink/80 to-transparent'}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 text-paper">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gold text-sm font-bold text-[#1a1204]">L</span>
            <span className="font-display text-2xl leading-none">{SITE_NAME}</span>
          </Link>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-paper lg:hidden"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => linkClass(isActive)}>
              <span className="inline-flex items-center gap-2">
                {link.label}
                {link.to === '/watchlist' && items.length > 0 && (
                  <span className="rounded-full bg-gold px-1.5 text-[11px] font-bold text-[#1a1204]">{items.length}</span>
                )}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="lg:ml-auto lg:w-80">
          <SearchBar />
        </div>

        <div className="relative hidden lg:block" ref={profileRef}>
          <button
            type="button"
            aria-label="Open profile"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-paper"
          >
            <UserIcon />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-[#141418] p-4 shadow-2xl">
              <p className="text-xs tracking-[0.18em] text-gold uppercase">On this device</p>
              <label className="mt-3 block text-sm text-mist">
                Display name
                <input
                  value={name}
                  maxLength={24}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-paper outline-none focus:border-gold/70"
                />
              </label>
              <p className="mt-3 text-sm text-mist">{items.length} saved {items.length === 1 ? 'film' : 'films'}</p>
              <Link to="/watchlist" className="mt-3 inline-flex text-sm font-semibold text-gold">Open watchlist</Link>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduced ? undefined : { height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 bg-ink lg:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile">
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => `rounded-xl px-3 py-3 ${linkClass(isActive)} ${isActive ? 'bg-white/5' : ''}`}
                >
                  {link.label}
                  {link.to === '/watchlist' ? ` (${items.length})` : ''}
                </NavLink>
              ))}
              <label className="mt-3 px-3 text-sm text-mist">
                Display name
                <input
                  value={name}
                  maxLength={24}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-paper outline-none"
                />
              </label>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
