import type { ReactNode } from 'react'

/*
 * Loading screens are sketches of the page that is coming: the same cards in
 * the same places, shimmering. Nothing moves when the real page lands, and
 * `.skeleton-screen` holds the sketch back for a beat so a fast navigation
 * never flashes grey.
 */

type Tone = 'light' | 'dark' | 'tint'

const toneClass: Record<Tone, string> = {
  light: 'skeleton',
  dark: 'skeleton-dark',
  tint: 'skeleton-on-tint'
}

/** One grey shape. Size it with classes; tone it for the card it sits on. */
export function Bone({ className = '', tone = 'light' }: { className?: string; tone?: Tone }) {
  return <span aria-hidden="true" className={`${toneClass[tone]} block ${className}`} />
}

/** The wrapper every loading.tsx uses: announces itself once, then fades in. */
export function SkeletonScreen({
  label,
  className = '',
  children
}: {
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={`skeleton-screen ${className}`}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}

/** PageHeader's shape: title block on the left, action pills and tools on the right. */
export function HeaderSkeleton({
  eyebrow = false,
  actions = [],
  tools = true
}: {
  eyebrow?: boolean
  /** Width classes, one per action pill. */
  actions?: string[]
  tools?: boolean
}) {
  return (
    <div className="flex flex-col gap-4 lg:min-h-16 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
      <div className="flex min-w-0 flex-col gap-2">
        {eyebrow && <Bone className="h-3 w-28" />}
        <Bone className="h-8 w-52 rounded-[10px]" />
        <Bone className="h-4 w-[min(24rem,85%)]" />
      </div>
      {(actions.length > 0 || tools) && (
        <div className={`${actions.length > 0 ? 'flex' : 'hidden lg:flex'} items-center gap-2.5`}>
          {actions.map((width, index) => (
            <Bone key={index} className={`h-[52px] flex-1 rounded-full lg:flex-none ${width}`} />
          ))}
          {tools && (
            <span className="hidden items-center gap-2.5 lg:flex">
              <Bone className="h-[52px] w-[52px] rounded-full" />
              <Bone className="h-[52px] w-[124px] rounded-full" />
              <Bone className="h-11 w-11 rounded-full" />
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/** SearchBar's shape: the pill field, any filters, and the button. */
export function SearchBarSkeleton({ filters = 0 }: { filters?: number }) {
  return (
    <div className="flex flex-col gap-3 rounded-[24px] bg-white p-3 sm:flex-row sm:items-center lg:rounded-card">
      <Bone className="h-[52px] w-full rounded-full sm:w-auto sm:flex-1" />
      {Array.from({ length: filters }, (_, index) => (
        <Bone key={index} className="h-[52px] w-full rounded-full sm:w-44" />
      ))}
      <Bone className="h-[52px] w-full rounded-full sm:w-[112px]" />
    </div>
  )
}

const cellWidths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-3/5', 'w-4/5', 'w-1/3']

/** A white card holding a table: header labels, then rows, the first with an avatar. */
export function TableCardSkeleton({
  rows = 5,
  columns = 5,
  title = false,
  avatar = true,
  actions = true,
  className = ''
}: {
  rows?: number
  columns?: number
  title?: boolean
  avatar?: boolean
  actions?: boolean
  className?: string
}) {
  const template = {
    gridTemplateColumns: `minmax(0,1.5fr) repeat(${Math.max(columns - (actions ? 2 : 1), 0)}, minmax(0,1fr))${actions ? ' minmax(0,0.9fr)' : ''}`
  }

  return (
    <div className={`rounded-[24px] bg-white p-4 sm:px-7 sm:py-6 lg:rounded-card ${className}`}>
      {title && (
        <div className="flex items-center gap-3 pb-4">
          <Bone className="h-5 w-44" />
          <Bone className="h-7 w-28 rounded-full" />
        </div>
      )}

      {/* From sm up: a table. */}
      <div className="hidden sm:block">
        <div className="grid gap-4 pb-3.5" style={template}>
          {Array.from({ length: columns }, (_, index) => (
            <Bone key={index} className={`h-3 w-16 ${actions && index === columns - 1 ? 'ml-auto' : ''}`} />
          ))}
        </div>
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="grid items-center gap-4 border-t border-line py-4" style={template}>
            <span className="flex min-w-0 items-center gap-3">
              {avatar && <Bone className="h-10 w-10 shrink-0 rounded-[14px]" />}
              <span className="flex min-w-0 flex-1 flex-col gap-2">
                <Bone className="h-3.5 w-4/5" />
                <Bone className="h-3 w-1/2" />
              </span>
            </span>
            {Array.from({ length: Math.max(columns - (actions ? 2 : 1), 0) }, (_, cell) => (
              <Bone key={cell} className={`h-3.5 ${cellWidths[(row + cell) % cellWidths.length]}`} />
            ))}
            {actions && (
              <span className="flex justify-end gap-2">
                <Bone className="h-10 w-16 rounded-full" />
                <Bone className="h-10 w-20 rounded-full" />
              </span>
            )}
          </div>
        ))}
      </div>

      {/* On a phone the table becomes a stack of cards. */}
      <div className="space-y-2.5 sm:hidden">
        {Array.from({ length: Math.min(rows, 3) }, (_, row) => (
          <div key={row} className="space-y-3 rounded-[18px] bg-canvas p-4">
            <span className="flex items-center gap-3">
              {avatar && <Bone className="h-10 w-10 shrink-0 rounded-[14px]" />}
              <span className="flex min-w-0 flex-1 flex-col gap-2">
                <Bone className="h-3.5 w-3/5" />
                <Bone className="h-3 w-2/5" />
              </span>
            </span>
            <Bone className="h-3 w-4/5" />
            <Bone className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** PropertyCard's shape: the icon and name, the stat tiles, and a button row. */
export function PropertyCardSkeleton({ columns = 3 }: { columns?: 2 | 3 }) {
  return (
    <div className="flex min-w-0 flex-col gap-5 rounded-[24px] bg-white p-5 sm:p-6 lg:rounded-card">
      <div className="flex items-center gap-3.5">
        <Bone className="h-[52px] w-[52px] shrink-0 rounded-2xl" />
        <span className="flex min-w-0 flex-1 flex-col gap-2">
          <Bone className="h-4 w-3/5" />
          <Bone className="h-3 w-2/5" />
        </span>
      </div>
      <div className={`grid gap-2.5 ${columns === 2 ? 'grid-cols-[1fr_1.4fr]' : 'grid-cols-3'}`}>
        {Array.from({ length: columns }, (_, index) => (
          <Bone key={index} className="h-[72px] rounded-tile" />
        ))}
      </div>
      <span className="flex gap-2.5">
        <Bone className="h-12 flex-1 rounded-full" />
        <Bone className="h-12 w-12 shrink-0 rounded-full" />
      </span>
    </div>
  )
}

/** A grid of property cards, as on Units, Tenants and Payments. */
export function PropertyGridSkeleton({ cards = 3, columns = 3 }: { cards?: number; columns?: 2 | 3 }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Bone className="h-5 w-32" />
        <Bone className="h-3.5 w-56" />
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }, (_, index) => (
          <PropertyCardSkeleton key={index} columns={columns} />
        ))}
      </div>
    </div>
  )
}

/** A small white card with a label over a figure, as in the totals rows. */
export function StatCardSkeleton({ tone = 'white', className = '' }: { tone?: 'white' | 'night' | 'mint'; className?: string }) {
  const bone: Tone = tone === 'night' ? 'dark' : tone === 'mint' ? 'tint' : 'light'
  const surface = tone === 'night' ? 'bg-night' : tone === 'mint' ? 'bg-mint' : 'bg-white'

  return (
    <div
      className={`flex min-h-[124px] min-w-0 flex-col justify-between gap-3 rounded-[24px] p-4 sm:min-h-[150px] sm:px-[22px] sm:py-5 lg:rounded-card ${surface} ${className}`}
    >
      <Bone tone={bone} className="h-3 w-24" />
      <Bone tone={bone} className="h-7 w-3/4 rounded-[10px]" />
      <Bone tone={bone} className="h-3 w-1/2" />
    </div>
  )
}

/** The narrow form pages: back link, heading, and a white card of fields. */
export function FormSkeleton({ fields = 5, label }: { fields?: number; label: string }) {
  return (
    <SkeletonScreen label={label} className="mx-auto max-w-2xl space-y-[22px]">
      <Bone className="h-9 w-36 rounded-full" />
      <div className="flex flex-col gap-2">
        <Bone className="h-8 w-56 rounded-[10px]" />
        <Bone className="h-4 w-72 max-w-full" />
      </div>
      <div className="space-y-5 rounded-[24px] bg-white p-5 sm:p-8 lg:rounded-card">
        {Array.from({ length: fields }, (_, index) => (
          <div key={index} className="space-y-2">
            <Bone className="h-3 w-24" />
            <Bone className="h-[52px] w-full rounded-full" />
          </div>
        ))}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Bone className="h-[52px] w-full rounded-full sm:w-40" />
          <Bone className="h-[52px] w-full rounded-full sm:w-28" />
        </div>
      </div>
    </SkeletonScreen>
  )
}
