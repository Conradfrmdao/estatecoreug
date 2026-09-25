import { Building2 } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

export type PropertyStat = {
  label: string
  value: ReactNode
  tone?: 'plain' | 'mint' | 'warn'
}

const toneClass = {
  plain: { tile: 'bg-canvas', value: 'text-ink', label: 'text-muted' },
  mint: { tile: 'bg-mint', value: 'text-forest', label: 'text-forest-ink' },
  warn: { tile: 'bg-canvas', value: 'text-carried-fg', label: 'text-muted' }
}

/**
 * One property as a card - the Units, Tenants and Payments pages all open a
 * property this way, so each shows only that property's records.
 */
export default function PropertyCard({
  propertyId,
  name,
  location,
  stats,
  columns = 3,
  footnote,
  children
}: {
  propertyId: number
  name: string
  location: string
  stats: PropertyStat[]
  columns?: 2 | 3
  footnote?: ReactNode
  children: ReactNode
}) {
  return (
    <article className="flex min-w-0 flex-col gap-5 rounded-[24px] bg-white p-5 transition duration-300 ease-out-soft hover:shadow-soft sm:p-6 lg:rounded-card">
      <div className="flex items-center gap-3.5">
        <span aria-hidden="true" className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-mint text-forest">
          <Building2 className="h-6 w-6" strokeWidth={1.9} />
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <Link
            href={`/properties/${propertyId}`}
            className="truncate text-[16px] font-extrabold leading-[22px] tracking-[0.01em] text-ink transition hover:text-brand-text"
          >
            {name}
          </Link>
          <span className="truncate text-[12.5px] font-semibold leading-[17px] tracking-[0.04em] text-muted">{location}</span>
        </span>
      </div>

      <div className={`grid gap-2.5 ${columns === 2 ? 'grid-cols-[1fr_1.4fr]' : 'grid-cols-3'}`}>
        {stats.map((stat) => {
          const tone = toneClass[stat.tone ?? 'plain']
          return (
            <div
              key={stat.label}
              className={`flex min-w-0 flex-col gap-0.5 rounded-tile px-2.5 py-3 ${tone.tile} ${
                columns === 2 ? 'px-4 py-3.5' : 'items-center text-center'
              }`}
            >
              <span className={`truncate text-[20px] font-extrabold leading-[26px] tabular-nums sm:text-[22px] ${tone.value}`}>
                {stat.value}
              </span>
              <span className={`text-[11px] font-bold uppercase leading-[15px] tracking-[0.06em] ${tone.label}`}>
                {stat.label}
              </span>
            </div>
          )
        })}
      </div>

      {footnote}
      {children}
    </article>
  )
}
