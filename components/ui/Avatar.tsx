export type AvatarTone = 'hi' | 'ink' | 'mint' | 'forest' | 'plain' | 'muted'

const toneClass: Record<AvatarTone, string> = {
  hi: 'bg-hi text-ink',
  ink: 'bg-ink text-white',
  mint: 'bg-mint text-forest',
  forest: 'bg-forest text-white',
  plain: 'bg-white text-brand-text',
  muted: 'bg-line text-muted'
}

const rotation: AvatarTone[] = ['hi', 'ink', 'mint', 'forest']

/** The same tenant wears the same colour on every card that shows them. */
export function toneFor(id: number): AvatarTone {
  return rotation[Math.abs(id) % rotation.length]
}

export function initialsOf(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export default function Avatar({
  initials,
  tone = 'mint',
  size = 36,
  shape = 'square',
  className = ''
}: {
  initials: string
  tone?: AvatarTone
  size?: number
  shape?: 'square' | 'circle'
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center font-extrabold ${toneClass[tone]} ${
        shape === 'circle' ? 'rounded-full' : 'rounded-[10px]'
      } ${className}`}
      style={{ width: size, height: size, fontSize: size >= 36 ? 12 : 11 }}
    >
      {initials}
    </span>
  )
}
