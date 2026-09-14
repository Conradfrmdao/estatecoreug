export type DonutSegment = {
  label: string
  count: number
  color: string
}

/**
 * "September collection" on the desktop dashboard. Counts come straight from
 * the rent status the app already computes for each tenant.
 */
export default function StatusDonut({
  segments,
  total,
  caption,
  size = 112,
  strokeWidth = 14
}: {
  segments: DonutSegment[]
  total: number
  caption: string
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const visible = segments.filter((segment) => segment.count > 0)
  let consumed = 0

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--neutral-bg)"
            strokeWidth={strokeWidth}
          />
          {total > 0 &&
            visible.map((segment) => {
              const length = (segment.count / total) * circumference
              const dashOffset = -consumed
              consumed += length

              return (
                <circle
                  key={segment.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={dashOffset}
                />
              )
            })}
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="money text-[20px] leading-none text-[var(--text-ink)]">{total}</span>
          <span className="mt-0.5 text-[11px] text-[var(--text-muted)]">{caption}</span>
        </span>
      </div>

      <ul className="min-w-0 flex-1 space-y-2">
        {visible.map((segment) => (
          <li key={segment.label} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="flex min-w-0 items-center gap-2 text-[var(--text-muted)]">
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="truncate">{segment.label}</span>
            </span>
            <span className="money shrink-0 text-[var(--text-ink)]">{segment.count}</span>
          </li>
        ))}
        {visible.length === 0 && (
          <li className="text-[13px] text-[var(--text-muted)]">No active tenancies this month.</li>
        )}
      </ul>
    </div>
  )
}
