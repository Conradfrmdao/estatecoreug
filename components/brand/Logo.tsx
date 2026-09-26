/*
 * The EstateCore UG logo. The artwork lives in /public/brand as SVG files -
 * the mark alone and the full lockup, each in white (for forest) and forest
 * (for light grounds) - so it is drawn crisp at any size and downloaded once.
 */

type Tone = 'white' | 'forest'

/** The symbol: towers, house and swoosh. Decorative unless given a label. */
export function LogoMark({
  tone = 'white',
  size = 44,
  label,
  className = ''
}: {
  tone?: Tone
  size?: number
  /** Give the mark a name when nothing beside it says "EstateCore UG". */
  label?: string
  className?: string
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/brand/estatecore-mark-${tone}.svg`}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      width={size}
      height={Math.round((size * 98) / 99)}
      draggable={false}
      className={`shrink-0 select-none ${className}`}
    />
  )
}

/** The full lockup: mark, EstateCore, the UG plate and the tagline. */
export function LogoFull({
  tone = 'forest',
  width = 240,
  className = '',
  priority = false
}: {
  tone?: Tone
  width?: number
  className?: string
  priority?: boolean
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/brand/estatecore-logo-${tone}.svg`}
      alt="EstateCore UG - Property Management Solutions"
      width={width}
      height={Math.round((width * 98) / 331)}
      draggable={false}
      fetchPriority={priority ? 'high' : undefined}
      className={`select-none ${className}`}
    />
  )
}
