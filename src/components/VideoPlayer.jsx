import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatTime } from '../utils/movies'
import { ghostBtn } from '../utils/styles'
import { FullscreenIcon, MuteIcon, PauseIcon, PlayIcon, VolumeIcon } from './Icons'
import { Spinner } from './Status'

export default function VideoPlayer({ src, poster, title, backTo, sample }) {
  const shellRef = useRef(null)
  const videoRef = useRef(null)
  const hideTimer = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffering, setBuffering] = useState(false)
  const [failed, setFailed] = useState(false)
  const [showChrome, setShowChrome] = useState(true)
  const [seekValue, setSeekValue] = useState(0)
  const [seeking, setSeeking] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => () => clearTimeout(hideTimer.current), [])

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  function reveal(nextPlaying = playing) {
    setShowChrome(true)
    clearTimeout(hideTimer.current)
    if (nextPlaying) {
      hideTimer.current = setTimeout(() => setShowChrome(false), 2600)
    }
  }

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      const attempt = video.play()
      if (attempt?.catch) attempt.catch(() => setFailed(true))
    } else {
      video.pause()
    }
  }

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    const next = !video.muted
    video.muted = next
    setMuted(next)
    if (!next && video.volume === 0) {
      video.volume = 0.8
      setVolume(0.8)
    }
  }

  function toggleFullscreen() {
    const shell = shellRef.current
    if (!shell) return
    if (document.fullscreenElement) document.exitFullscreen?.()
    else shell.requestFullscreen?.()
  }

  function retry() {
    const video = videoRef.current
    if (!video) return
    setFailed(false)
    setBuffering(true)
    video.load()
  }

  const shownTime = seeking ? seekValue : current
  const progress = duration ? (shownTime / duration) * 100 : 0

  return (
    <div className="overflow-hidden rounded-3xl bg-black ring-1 ring-white/10">
      <div
        ref={shellRef}
        className="relative aspect-video bg-black"
        onMouseMove={() => reveal()}
        onFocus={() => reveal()}
        onKeyDown={(event) => {
          if (event.target.closest('input, a, button')) return
          if (event.key === ' ' || event.key === 'k') {
            event.preventDefault()
            togglePlay()
          } else if (event.key === 'ArrowRight') {
            event.preventDefault()
            if (videoRef.current) videoRef.current.currentTime = Math.min(duration || 0, videoRef.current.currentTime + 5)
          } else if (event.key === 'ArrowLeft') {
            event.preventDefault()
            if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5)
          } else if (event.key === 'm') {
            toggleMute()
          } else if (event.key === 'f') {
            toggleFullscreen()
          }
        }}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster || undefined}
          playsInline
          preload="metadata"
          className="h-full w-full bg-black object-contain"
          onClick={togglePlay}
          onPlay={() => {
            setPlaying(true)
            setFailed(false)
            reveal(true)
          }}
          onPause={() => {
            setPlaying(false)
            setShowChrome(true)
            clearTimeout(hideTimer.current)
          }}
          onTimeUpdate={(event) => {
            if (!seeking) setCurrent(event.currentTarget.currentTime)
          }}
          onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
          onWaiting={() => setBuffering(true)}
          onPlaying={() => setBuffering(false)}
          onCanPlay={() => setBuffering(false)}
          onVolumeChange={(event) => {
            setMuted(event.currentTarget.muted)
            setVolume(event.currentTarget.volume)
          }}
          onError={() => {
            setFailed(true)
            setBuffering(false)
          }}
        />

        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition ${showChrome || !playing ? 'opacity-100' : 'opacity-0'}`} />

        <div className={`absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4 transition ${showChrome || !playing ? 'opacity-100' : 'opacity-0'}`}>
          <Link to={backTo} className="pointer-events-auto rounded-full bg-black/50 px-4 py-2 text-sm font-semibold text-paper ring-1 ring-white/15">
            Back to details
          </Link>
          <p className="hidden truncate text-sm text-paper/80 sm:block">{title}</p>
        </div>

        {!playing && !failed && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold text-[#1a1204]"
            aria-label="Play"
          >
            <PlayIcon className="h-7 w-7" />
          </button>
        )}

        {buffering && !failed && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Spinner className="h-10 w-10" />
          </div>
        )}

        {failed && (
          <div className="absolute inset-0 grid place-items-center bg-black/75 px-6 text-center" role="alert">
            <div>
              <p className="font-display text-3xl">Playback unavailable</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-mist">
                The sample film could not be loaded. Check your connection, then try again. A streaming provider can replace this source later.
              </p>
              <button type="button" className={`${ghostBtn} mt-5`} onClick={retry}>Try again</button>
            </div>
          </div>
        )}

        <div className={`absolute inset-x-0 bottom-0 p-4 transition ${showChrome || !playing ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
          <input
            className="scrubber"
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Number.isFinite(shownTime) ? shownTime : 0}
            aria-label="Seek"
            style={{ background: `linear-gradient(to right, #e4b15a ${progress}%, rgba(255,255,255,0.22) ${progress}%)` }}
            onPointerDown={() => setSeeking(true)}
            onChange={(event) => {
              const value = Number(event.target.value)
              setSeekValue(value)
              setCurrent(value)
              if (videoRef.current) videoRef.current.currentTime = value
            }}
            onPointerUp={() => setSeeking(false)}
            onKeyUp={() => setSeeking(false)}
            onBlur={() => setSeeking(false)}
          />
          <div className="mt-3 flex items-center gap-3 text-paper">
            <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'} className="grid h-11 w-11 place-items-center">
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button type="button" onClick={toggleMute} aria-label={muted || volume === 0 ? 'Unmute' : 'Mute'} className="grid h-11 w-11 place-items-center">
              {muted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
            </button>
            <input
              className="scrubber hidden w-24 sm:block"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              aria-label="Volume"
              onChange={(event) => {
                const value = Number(event.target.value)
                setVolume(value)
                setMuted(value === 0)
                if (videoRef.current) {
                  videoRef.current.volume = value
                  videoRef.current.muted = value === 0
                }
              }}
            />
            <span className="text-xs tabular-nums text-paper/80">
              {formatTime(shownTime)} / {formatTime(duration)}
            </span>
            <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} className="ml-auto grid h-11 w-11 place-items-center">
              <FullscreenIcon />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 px-4 py-4 text-sm text-mist sm:flex-row sm:items-center sm:justify-between">
        <p>
          Creative Commons demonstration clip: {sample.title} by {sample.credit}. This is not the feature film.
        </p>
        <p className="text-xs">Space play/pause · arrows seek · M mute · F fullscreen</p>
      </div>
    </div>
  )
}
