/**
 * The collection ring from artboard 1d - draws on load, holds at the real
 * percentage. Pure SVG, no library, honours prefers-reduced-motion.
 */
export default function CollectionRing({
  collected,
  expected,
  size = 96,
  strokeWidth = 8,
  className = ''
}: {
  collected: number
  expected: number
  size?: number
  strokeWidth?: number
  className?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = expected > 0 ? Math.min(Math.max(collected / expected, 0), 1) : 0
  const percent = Math.round(ratio * 100)
  const offset = circumference * (1 - ratio)

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${percent}% of expected rent collected`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/15"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          className="ring-draw text-[var(--brand-300)]"
          style={
            {
              '--ring-circumference': `${circumference}`,
              '--ring-offset': `${offset}`
            } as React.CSSProperties
          }
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="money text-[17px] leading-none text-white">{percent}%</span>
      </span>
    </div>
  )
}
