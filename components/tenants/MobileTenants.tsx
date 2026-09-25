'use client'

import CarryForwardNote from '@/components/CarryForwardNote'
import Avatar, { toneFor } from '@/components/ui/Avatar'
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
  paid: 'text-paid-fg',
  in_advance: 'text-advance-fg',
  part_paid: 'text-carried-fg',
  due: 'text-ink',
  overdue: 'text-overdue-fg',
  vacant: 'text-muted',
  inactive: 'text-muted'
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
    <div className="stagger lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[26px] font-extrabold leading-8 tracking-[-0.02em] text-ink">Tenants</h1>
          <p className="text-[13px] font-medium text-muted">Everyone renting from you, by property.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            aria-label={searchOpen ? 'Close search' : 'Search tenants'}
            aria-expanded={searchOpen}
            className="btn btn-white btn-icon"
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
            className="btn btn-ink btn-icon"
          >
            <Plus aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
          </Link>
        </div>
      </div>

      {searchOpen && (
        <label className="search-field fade-in mt-3 bg-white">
          <Search aria-hidden="true" className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
          <span className="sr-only">Search tenants</span>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, unit, or phone"
          />
        </label>
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
              className={`flex min-h-10 shrink-0 items-center rounded-full px-4 text-[13.5px] transition-colors duration-300 ${
                active ? 'bg-ink font-bold text-white' : 'bg-white font-semibold text-muted'
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
            <h2 className="px-1 text-[11.5px] font-bold uppercase tracking-[0.08em] text-muted">
              {group.propertyName} &middot; {group.tenants.length} tenant
              {group.tenants.length === 1 ? '' : 's'}
            </h2>

            <ul className="mt-2 space-y-2">
              {group.tenants.map((row) => (
                <li key={row.id}>
                  <Link
                    href={`/tenants/${row.id}/edit`}
                    className="flex items-center gap-3 rounded-[22px] bg-white p-3.5 transition active:scale-[0.99]"
                  >
                    <Avatar initials={row.initials} tone={row.active ? toneFor(row.id) : 'muted'} size={42} />

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold text-ink">{row.name}</span>
                      <span className="mt-0.5 block truncate text-[12.5px] font-medium leading-4 text-muted">
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
                      <span className={`money block text-[15px] font-extrabold ${balanceTone[row.statusKind]}`}>
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
          <div className="rounded-[22px] bg-white px-4 py-10 text-center">
            <p className="text-[16px] font-extrabold text-ink">
              {rows.length === 0 ? 'No tenants yet' : 'Nothing matches'}
            </p>
            <p className="mt-1 text-[13px] font-medium text-muted">
              {rows.length === 0
                ? 'Add a tenant to an available unit to start tracking rent.'
                : 'Try another name, unit, or filter.'}
            </p>
            {rows.length === 0 && (
              <Link
                href="/tenants/new"
                className="btn btn-lg btn-ink mt-4"
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
