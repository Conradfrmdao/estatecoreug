'use client'

import CarryForwardNote from '@/components/CarryForwardNote'
import Money from '@/components/ui/Money'
import StatusPill, { type RentStatusKind } from '@/components/ui/StatusPill'
import { Plus, Search, X } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

export type MobileTenantRow = {
  id: number
  name: string
  initials: string
  unitNumber: string
  phone: string
  email: string | null
  propertyId: number
  propertyName: string
  active: boolean
  balance: number
  statusKind: RentStatusKind
  statusDetail?: string
  carriedForwardBalance: number
  carriedForwardMonths: { month: string; balance: number }[]
  isOwing: boolean
}

type Segment = 'all' | 'owing' | 'paid'

const balanceTone: Record<RentStatusKind, string> = {
  paid: 'text-[var(--paid-fg)]',
  in_advance: 'text-[var(--advance-fg)]',
  part_paid: 'text-[var(--carried-fg)]',
  due: 'text-[var(--text-ink)]',
  overdue: 'text-[var(--overdue-fg)]',
  vacant: 'text-[var(--text-muted)]',
  inactive: 'text-[var(--text-muted)]'
}

export default function MobileTenants({ rows }: { rows: MobileTenantRow[] }) {
  const [segment, setSegment] = useState<Segment>('all')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const counts = useMemo(
    () => ({
      all: rows.length,
      owing: rows.filter((row) => row.isOwing).length,
      paid: rows.filter((row) => !row.isOwing).length
    }),
    [rows]
  )

  const visible = useMemo(() => {
    const search = query.trim().toLowerCase()

    return rows.filter((row) => {
      if (segment === 'owing' && !row.isOwing) return false
      if (segment === 'paid' && row.isOwing) return false
      if (!search) return true

      return [row.name, row.unitNumber, row.phone, row.email ?? '', row.propertyName].some((value) =>
        value.toLowerCase().includes(search)
      )
    })
  }, [query, rows, segment])

  const grouped = useMemo(() => {
    const map = new Map<number, { propertyName: string; tenants: MobileTenantRow[] }>()

    for (const row of visible) {
      const existing = map.get(row.propertyId)
      if (existing) existing.tenants.push(row)
      else map.set(row.propertyId, { propertyName: row.propertyName, tenants: [row] })
    }

    return Array.from(map.values()).sort((a, b) => a.propertyName.localeCompare(b.propertyName))
  }, [visible])

  const segments: { key: Segment; label: string }[] = [
    { key: 'all', label: `All ${counts.all}` },
    { key: 'owing', label: `Owing ${counts.owing}` },
    { key: 'paid', label: `Paid ${counts.paid}` }
  ]

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <h1 className="t-title text-[var(--text-ink)]">Tenants</h1>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            aria-label={searchOpen ? 'Close search' : 'Search tenants'}
            aria-expanded={searchOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--text-muted)]"
          >
            {searchOpen ? (
              <X aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <Search aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
            )}
          </button>
          <Link
            href="/tenants/new"
            aria-label="Add tenant"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand)] text-white shadow-[var(--shadow-brand)]"
          >
            <Plus aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="relative mt-3">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-soft)]"
            strokeWidth={1.75}
          />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, unit, or phone"
            className="field-input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      )}

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
        {segments.map((item) => {
          const active = segment === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setSegment(item.key)}
              aria-pressed={active}
              className={`flex min-h-9 shrink-0 items-center rounded-full px-4 text-[13px] transition ${
                active
                  ? 'bg-[var(--text-ink)] font-semibold text-white'
                  : 'border border-[var(--line)] bg-white font-medium text-[var(--text-muted)]'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <div className="mt-4 space-y-5">
        {grouped.map((group) => (
          <section key={group.propertyName}>
            <h2 className="t-label px-0.5 text-[var(--text-soft)]">
              {group.propertyName} &middot; {group.tenants.length} tenant
              {group.tenants.length === 1 ? '' : 's'}
            </h2>

            <ul className="mt-2 space-y-2">
              {group.tenants.map((row) => (
                <li key={row.id}>
                  <Link
                    href={`/tenants/${row.id}/edit`}
                    className="surface-card flex items-center gap-3 p-3.5 transition active:scale-[0.99]"
                  >
                    <span className="money flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--paid-bg)] text-[12.5px] text-[var(--brand-text)]">
                      {row.initials}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="t-section block truncate text-[var(--text-ink)]">{row.name}</span>
                      <span className="mt-0.5 block truncate text-[12px] leading-4 text-[var(--text-muted)]">
                        {row.unitNumber} &middot; {row.phone}
                      </span>
                      <CarryForwardNote
                        compact
                        carriedForwardBalance={row.carriedForwardBalance}
                        carriedForwardMonths={row.carriedForwardMonths}
                        className="block"
                      />
                    </span>

                    <span className="shrink-0 text-right">
                      <span className={`money block text-[15px] ${balanceTone[row.statusKind]}`}>
                        <Money value={row.balance} />
                      </span>
                      <StatusPill
                        kind={row.statusKind}
                        detail={row.statusDetail}
                        className="mt-1"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {grouped.length === 0 && (
          <div className="surface-card px-4 py-10 text-center">
            <p className="t-section text-[var(--text-ink)]">
              {rows.length === 0 ? 'No tenants yet' : 'Nothing matches'}
            </p>
            <p className="t-small mt-1 text-[var(--text-muted)]">
              {rows.length === 0
                ? 'Add a tenant to an available unit to start tracking rent.'
                : 'Try another name, unit, or filter.'}
            </p>
            {rows.length === 0 && (
              <Link
                href="/tenants/new"
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[var(--brand)] px-4 text-[14px] font-semibold text-white"
              >
                <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
                Add a tenant
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
