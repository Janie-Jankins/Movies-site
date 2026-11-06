export function Icon({ children, className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      {children}
    </svg>
  )
}

export function PlayIcon(props) {
  return (
    <Icon {...props}>
      <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function PlusIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </Icon>
  )
}

export function CheckIcon(props) {
  return (
    <Icon {...props}>
      <path d="M5 12.5 9.2 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  )
}

export function SearchIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16.5 20 20.5" strokeLinecap="round" />
    </Icon>
  )
}

export function CloseIcon(props) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </Icon>
  )
}

export function MenuIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </Icon>
  )
}

export function ChevronLeftIcon(props) {
  return (
    <Icon {...props}>
      <path d="M14.5 5.5 8 12l6.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  )
}

export function ChevronRightIcon(props) {
  return (
    <Icon {...props}>
      <path d="M9.5 5.5 16 12l-6.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  )
}

export function StarIcon(props) {
  return (
    <Icon {...props}>
      <path d="m12 3.6 2.1 4.6 5 .6-3.7 3.4.9 5-4.3-2.4-4.3 2.4.9-5L4.9 8.8l5-.6L12 3.6Z" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function FilmIcon(props) {
  return (
    <Icon {...props}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 5v14M16 5v14M4 9h4M4 15h4M16 9h4M16 15h4" />
    </Icon>
  )
}

export function PauseIcon(props) {
  return (
    <Icon {...props}>
      <path d="M8 5v14M16 5v14" strokeLinecap="round" />
    </Icon>
  )
}

export function VolumeIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 10h3.5L12 6.5v11L7.5 14H4v-4Z" strokeLinejoin="round" />
      <path d="M16 9.5a4 4 0 0 1 0 5" strokeLinecap="round" />
    </Icon>
  )
}

export function MuteIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 10h3.5L12 6.5v11L7.5 14H4v-4Z" strokeLinejoin="round" />
      <path d="m16 10 4 4M20 10l-4 4" strokeLinecap="round" />
    </Icon>
  )
}

export function FullscreenIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  )
}

export function UserIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.2a6.5 6.5 0 0 1 13 0" strokeLinecap="round" />
    </Icon>
  )
}
