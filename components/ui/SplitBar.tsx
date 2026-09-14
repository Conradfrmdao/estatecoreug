/**
 * The split bar from artboard 1b: green for the current month, amber for
 * what rolled over. It carries the composition before any text is read.
 */
export type SplitSegment = {
  value: number
  tone: 'current' | 'carried' | 'spent' | 'net' | 'track'
}

const toneClass: Record<SplitSegment['tone'], string> = {
  current: 'bg-[var(--brand)]',
  carried: 'bg-[#e0a021]',
  spent: 'bg-[#c98a1c]',
  net: 'bg-[var(--brand-300)]',
  track: 'bg-[var(--neutral-bg)]'
}

export default function SplitBar({
  segments,
  orientation = 'vertical',
  className = ''
}: {
  segments: SplitSegment[]
  orientation?: 'vertical' | 'horizontal'
  className?: string
}) {
  const positive = segments.filter((segment) => segment.value > 0)
  const total = positive.reduce((running, segment) => running + segment.value, 0)
  const vertical = orientation === 'vertical'
  const shape = vertical ? 'w-1 flex-col' : 'h-1 w-full flex-row'

  if (total <= 0) {
    return (
      <span
        aria-hidden="true"
        className={`split-track block shrink-0 ${vertical ? 'w-1' : 'h-1 w-full'} ${className}`}
      />
    )
  }

  return (
    <span aria-hidden="true" className={`split-track flex shrink-0 ${shape} ${className}`}>
      {positive.map((segment, index) => (
        <span
          key={`${segment.tone}-${index}`}
          className={toneClass[segment.tone]}
          style={
            vertical
              ? { height: `${(segment.value / total) * 100}%` }
              : { width: `${(segment.value / total) * 100}%` }
          }
        />
      ))}
    </span>
  )
}
