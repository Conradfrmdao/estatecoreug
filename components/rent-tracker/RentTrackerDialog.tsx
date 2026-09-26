'use client'

import Dialog from '@/components/ui/Dialog'
import PdfDownload from '@/components/ui/PdfDownload'
import { Bone } from '@/components/ui/Skeleton'
import { abbreviatedAmount, amountDigits, currency, currentPaymentMonth, monthLabel, monthNameLabel, shiftMonth, shortDate } from '@/lib/format'
import type { RentTrackerProperty, RentTrackerReport, RentTrackerStatus, RentTrackerTenant, RentTrackerTotals } from '@/lib/rent-tracker'
import {
  rentTrackerFilterLabel,
  rentTrackerNotes,
  rentTrackerRowMatches,
  statusLabel,
  timingLabel,
  type RentTrackerFilter
} from '@/lib/rent-tracker-labels'
import { AlarmClock, ChevronLeft, ChevronRight, ClipboardList, Download, Info, Plus, Search, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'

const statusTone: Record<RentTrackerStatus, string> = {
  paid: 'bg-paid-bg text-paid-fg',
  part_paid: 'bg-carried-bg text-carried-fg',
  not_yet: 'bg-due-bg text-due-fg',
  late: 'bg-overdue-bg text-overdue-fg'
}

const filters: RentTrackerFilter[] = ['all', 'paid', 'owing', 'late']

function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000)
}

function dayLabel(date: string) {
  return shortDate(`${date}T00:00:00.000Z`)
}

/** "in 4 days", "tomorrow", "today", "passed 3 days ago". */
function countdown(today: string, date: string) {
  const days = daysBetween(today, date)
  if (days > 1) return `in ${days} days`
  if (days === 1) return 'tomorrow'
  if (days === 0) return 'today'
  return days === -1 ? 'yesterday' : `${-days} days ago`
}

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`
}

/** The last 24 months and the next one, newest first. */
function monthChoices(current: string, selected: string) {
  const months = Array.from({ length: 26 }, (_, index) => shiftMonth(current, 1 - index))
  return months.includes(selected) ? months : [selected, ...months]
}

/* The tiles are narrow on a phone, so the figure is shortened there only. */
function TileAmount({ value }: { value: number }) {
  const short = abbreviatedAmount(value)
  return (
    <>
      <span className="sm:hidden">
        UGX {short.figure}
        {short.unit}
      </span>
      <span className="hidden sm:inline">UGX {amountDigits(value)}</span>
    </>
  )
}

function Summary({ totals, month, today, timing }: { totals: RentTrackerTotals; month: string; today: string; timing: RentTrackerReport['timing'] }) {
  const monthName = monthNameLabel(month)
  const ratio = totals.expected > 0 ? Math.min(totals.paid / totals.expected, 1) : 0
  /* A handful of days reads best one by one; a spread of them, by timing. */
  const byDay = totals.dueDates.length <= 3

  return (
    <section aria-label={`${monthName} summary`} className="rounded-[24px] bg-night p-5 text-white sm:p-6">
      <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-night-muted">
        {timing === 'past' ? `Rent that was due for ${monthName}` : `Rent expected for ${monthName}`}
      </p>
      <p className="mt-1 flex items-baseline gap-1.5">
        <span className="text-[14px] font-bold text-night-muted">UGX</span>
        <span className="text-[30px] font-extrabold leading-9 tracking-[-0.02em] tabular-nums sm:text-[34px]">
          {amountDigits(totals.expected)}
        </span>
      </p>

      <div
        className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10"
        role="img"
        aria-label={`${Math.round(ratio * 100)}% paid`}
      >
        {ratio > 0 && <div className="bar-grow h-full rounded-full bg-hi" style={{ width: `${ratio * 100}%` }} />}
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-white/[0.06] px-3 py-2.5">
          <dt className="text-[11.5px] font-semibold text-night-muted">Have paid</dt>
          <dd className="text-[20px] font-extrabold leading-7 tabular-nums">{totals.paidCount}</dd>
          <dd className="truncate text-[11.5px] font-semibold text-night-muted">
            <TileAmount value={totals.paid} />
          </dd>
        </div>
        <div className="rounded-2xl bg-white/[0.06] px-3 py-2.5">
          <dt className="text-[11.5px] font-semibold text-night-muted">Not yet</dt>
          <dd className="text-[20px] font-extrabold leading-7 tabular-nums">{totals.owingCount}</dd>
          <dd className="truncate text-[11.5px] font-semibold text-night-muted">
            <TileAmount value={totals.left} />
          </dd>
        </div>
        <div className="rounded-2xl bg-white/[0.06] px-3 py-2.5">
          <dt className="text-[11.5px] font-semibold text-night-muted">Late</dt>
          <dd className={`text-[20px] font-extrabold leading-7 tabular-nums ${totals.lateCount > 0 ? 'text-[#FFB4A8]' : ''}`}>
            {totals.lateCount}
          </dd>
          <dd className="truncate text-[11.5px] font-semibold text-night-muted">
            {totals.lateCount > 0 ? <TileAmount value={totals.lateAmount} /> : 'so far'}
          </dd>
        </div>
      </dl>
      {totals.partCount > 0 && (
        <p className="mt-2 text-[12px] font-semibold text-night-muted">
          {plural(totals.partCount, 'tenant has', 'tenants have')} paid part of it.
        </p>
      )}

      {totals.tenants > 0 && (
        <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
          {byDay
            ? totals.dueDates.map((day) => {
                const passed = daysBetween(today, day.date) < 0
                return (
                  <li key={`${day.date}-${day.timing}`} className="flex items-start gap-2.5 text-[13px] leading-[18px]">
                    <AlarmClock aria-hidden="true" className="mt-px h-4 w-4 shrink-0 text-hi" strokeWidth={2} />
                    <span className="min-w-0">
                      <span className="font-bold">
                        {passed ? 'Was due' : 'Expected by'} {dayLabel(day.date)}: UGX {amountDigits(day.expected)}
                      </span>
                      <span className="block text-night-muted">
                        {timingLabel(day.timing)} · {plural(day.tenants, 'tenant')} · {day.paidCount} paid, {day.owingCount} not yet ·{' '}
                        {countdown(today, day.date)}
                      </span>
                    </span>
                  </li>
                )
              })
            : totals.byTiming.map((group) => (
                <li key={group.timing} className="flex items-start gap-2.5 text-[13px] leading-[18px]">
                  <AlarmClock aria-hidden="true" className="mt-px h-4 w-4 shrink-0 text-hi" strokeWidth={2} />
                  <span className="min-w-0">
                    <span className="font-bold">
                      {timingLabel(group.timing)}: UGX {amountDigits(group.expected)}
                    </span>
                    <span className="block text-night-muted">
                      Due {group.firstDue === group.lastDue ? dayLabel(group.lastDue) : `${dayLabel(group.firstDue)} – ${dayLabel(group.lastDue)}`} ·{' '}
                      {plural(group.tenants, 'tenant')} · {group.paidCount} paid, {group.owingCount} not yet
                    </span>
                  </span>
                </li>
              ))}
        </ul>
      )}
    </section>
  )
}

function TenantRow({ row, month, mixedTiming }: { row: RentTrackerTenant; month: string; mixedTiming: boolean }) {
  const notes = rentTrackerNotes(row, month)
  const owes = row.left > 0
  const pill = <span className={`pill ${statusTone[row.status]}`}>{statusLabel(row)}</span>
  const record = owes && (
    <Link href={`/payments/new?tenantId=${row.tenantId}`} className="btn btn-xs btn-mint">
      <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
      Record
    </Link>
  )

  return (
    <li className="border-b border-line py-3 last:border-b-0">
      <div className="flex items-start gap-3">
        <span className="flex min-h-10 w-[64px] shrink-0 items-center justify-center rounded-xl bg-canvas px-1 py-1 text-center text-[12px] font-extrabold leading-[14px] text-ink [overflow-wrap:break-word]">
          {row.unitNumber}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-bold leading-5 text-ink">{row.name}</p>
          <p className="mt-0.5 text-[12px] font-medium leading-4 text-muted">
            {row.status === 'paid'
              ? row.paidOn[0]
                ? `Paid ${dayLabel(row.paidOn[0])}`
                : 'Paid'
              : `Due ${dayLabel(row.dueDate)}`}
            {/* On a phone the timing is only repeated when tenants differ. */}
            <span className={mixedTiming ? '' : 'hidden sm:inline'}>
              {' · '}
              {row.paymentTiming === 'arrears' ? 'pays at month end' : 'pays at month start'}
            </span>
          </p>
          <div className="mt-1.5 sm:hidden">{pill}</div>
        </div>

        <div className="flex shrink-0 flex-col items-end text-right sm:w-[124px]">
          <p className={`text-[14.5px] font-extrabold leading-5 tabular-nums ${owes ? 'text-ink' : 'text-paid-fg'}`}>
            <span className="mr-1 text-[11px] font-bold text-muted">UGX</span>
            {amountDigits(owes ? row.left : row.paid)}
          </p>
          <p className="text-[11.5px] font-semibold leading-4 text-muted">
            {owes ? (row.paid > 0 ? `left of ${amountDigits(row.rent)}` : 'to come') : 'paid in full'}
          </p>
          {record && <div className="mt-2 sm:hidden">{record}</div>}
        </div>

        <div className="hidden w-[112px] shrink-0 justify-end pt-px sm:flex">{pill}</div>
        <div className="hidden w-[88px] shrink-0 justify-end sm:flex">{record}</div>
      </div>

      {notes.length > 0 && (
        <ul className="mt-2 space-y-1 pl-[76px]">
          {notes.map((note) => (
            <li key={note} className="flex items-start gap-1.5 text-[12px] font-semibold leading-4 text-carried-fg">
              <Info aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
              {note}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

function PropertyBlock({
  property,
  month,
  filter,
  query,
  showHeading,
  mixedTiming
}: {
  property: RentTrackerProperty
  month: string
  filter: RentTrackerFilter
  query: string
  showHeading: boolean
  mixedTiming: boolean
}) {
  const rows = property.units
    .flatMap((unit) => unit.tenants)
    .filter((row) => rentTrackerRowMatches(row, filter))
    .filter((row) => !query || `${row.name} ${row.unitNumber} ${row.phone}`.toLowerCase().includes(query))
  const { totals } = property

  if (rows.length === 0) return null

  return (
    <section aria-label={property.name} className="rounded-[22px] bg-white px-4 pb-1 pt-3.5 sm:px-5">
      {showHeading && (
        <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-b border-line pb-3">
          <h3 className="text-[15.5px] font-extrabold text-ink">{property.name}</h3>
          <p className="text-[12.5px] font-semibold text-muted">
            {totals.paidCount} of {totals.tenants} paid · {currency(totals.left)} to come
          </p>
        </header>
      )}
      <ul>
        {rows.map((row) => (
          <TenantRow key={row.tenantId} row={row} month={month} mixedTiming={mixedTiming} />
        ))}
      </ul>
      {filter === 'all' && !query && property.emptyUnits.length > 0 && (
        <p className="border-t border-line py-3 text-[12px] font-semibold text-muted">
          No tenant for {monthNameLabel(month)} in {property.emptyUnits.map((unit) => unit.unitNumber).join(', ')}
        </p>
      )}
    </section>
  )
}

function LoadingBody() {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">Loading the rent tracker</span>
      <div className="space-y-3 rounded-[24px] bg-night p-5 sm:p-6">
        <Bone tone="dark" className="h-3 w-40" />
        <Bone tone="dark" className="h-8 w-56 rounded-[10px]" />
        <Bone tone="dark" className="h-2.5 w-full rounded-full" />
        <div className="grid grid-cols-3 gap-2">
          <Bone tone="dark" className="h-[72px] rounded-2xl" />
          <Bone tone="dark" className="h-[72px] rounded-2xl" />
          <Bone tone="dark" className="h-[72px] rounded-2xl" />
        </div>
      </div>
      <div className="flex gap-2">
        {['w-16', 'w-[72px]', 'w-[104px]', 'w-16'].map((width, index) => (
          <Bone key={index} className={`h-10 rounded-full ${width}`} />
        ))}
      </div>
      <div className="space-y-4 rounded-[22px] bg-white p-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="flex gap-3">
            <Bone className="h-10 w-11 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Bone className="h-3.5 w-2/5" />
              <Bone className="h-3 w-3/5" />
            </div>
            <Bone className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RentTrackerDialog({
  open,
  onClose,
  initialMonth,
  initialPropertyId
}: {
  open: boolean
  onClose: () => void
  initialMonth: string
  initialPropertyId: number | null
}) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const [month, setMonth] = useState(initialMonth)
  const [propertyId, setPropertyId] = useState<number | null>(initialPropertyId)
  const [filter, setFilter] = useState<RentTrackerFilter>('all')
  const [query, setQuery] = useState('')
  const [reports, setReports] = useState<Record<string, RentTrackerReport>>({})
  const [failed, setFailed] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  /* Each time it opens, it starts where the dashboard is. */
  useEffect(() => {
    if (!open) return
    setMonth(initialMonth)
    setPropertyId(initialPropertyId)
    setFilter('all')
    setQuery('')
  }, [open, initialMonth, initialPropertyId])

  const report = reports[month]

  useEffect(() => {
    if (!open || reports[month]) return
    const controller = new AbortController()
    setFailed(null)

    fetch(`/api/rent-tracker?month=${month}`, { cache: 'no-store', signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((payload: RentTrackerReport) => setReports((current) => ({ ...current, [month]: payload })))
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.error('Rent tracker failed to load:', error)
          setFailed(month)
        }
      })

    return () => controller.abort()
  }, [open, month, reports, attempt])

  /* Figures are worked out when asked for; reopening asks again. */
  useEffect(() => {
    if (!open) setReports({})
  }, [open])

  const property = report?.properties.find((entry) => entry.propertyId === propertyId) ?? null
  const scopeProperties = property ? [property] : (report?.properties ?? [])
  const totals = property?.totals ?? report?.totals ?? null
  const search = query.trim().toLowerCase()

  const scopeRows = scopeProperties.flatMap((entry) => entry.units.flatMap((unit) => unit.tenants))
  const counts = Object.fromEntries(
    filters.map((key) => [key, scopeRows.filter((row) => rentTrackerRowMatches(row, key)).length])
  ) as Record<RentTrackerFilter, number>
  const visibleCount = scopeRows
    .filter((row) => rentTrackerRowMatches(row, filter))
    .filter((row) => !search || `${row.name} ${row.unitNumber} ${row.phone}`.toLowerCase().includes(search)).length

  const current = currentPaymentMonth()
  const latestMonth = shiftMonth(current, 1)
  const pdfHref = `/api/reports/rent-tracker?month=${month}${propertyId ? `&propertyId=${propertyId}` : ''}${
    filter === 'all' ? '' : `&status=${filter}`
  }`
  const withTenants = report?.properties.filter((entry) => entry.totals.tenants > 0) ?? []
  const withoutTenants = report?.properties.filter((entry) => entry.totals.tenants === 0) ?? []

  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      variant="sheet-dialog"
      zIndex={80}
      initialFocusRef={closeRef}
      className="flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-t-[28px] bg-canvas shadow-overlay sm:max-h-[90vh] sm:max-w-3xl sm:rounded-[28px]"
    >
      <header className="shrink-0 space-y-3 bg-white px-4 pb-4 pt-5 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-white">
            <ClipboardList aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-[19px] font-extrabold leading-6 text-ink sm:text-[21px]">
              Rent tracker
            </h2>
            <p className="text-[13px] font-medium leading-[18px] text-muted">
              Who has paid {monthNameLabel(month)}&apos;s rent
              <span className="hidden sm:inline">, property by property</span>.
            </p>
          </div>
          <PdfDownload
            href={pdfHref}
            aria-label="Download this rent tracker as a PDF"
            title="Download PDF"
            className="btn btn-sm btn-hi shrink-0 max-[389px]:w-10 max-[389px]:px-0"
          >
            <Download aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
            <span className="max-[389px]:sr-only">PDF</span>
          </PdfDownload>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="btn btn-soft btn-icon btn-sm shrink-0"
          >
            <X aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Property</span>
            <select
              value={propertyId ?? ''}
              onChange={(event) => setPropertyId(event.target.value ? Number(event.target.value) : null)}
              className="field-input field-compact"
              disabled={!report}
            >
              <option value="">All properties{report ? ` · ${plural(report.totals.tenants, 'tenant')}` : ''}</option>
              {withTenants.map((entry) => (
                <option key={entry.propertyId} value={entry.propertyId}>
                  {entry.name} · {plural(entry.totals.tenants, 'tenant')}
                </option>
              ))}
              {withoutTenants.map((entry) => (
                <option key={entry.propertyId} value={entry.propertyId}>
                  {entry.name} · no tenants
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-1 rounded-full bg-canvas p-1">
            <button
              type="button"
              onClick={() => setMonth(shiftMonth(month, -1))}
              aria-label="Previous month"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink transition hover:bg-white"
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" strokeWidth={2.4} />
            </button>
            <label className="min-w-0 flex-1">
              <span className="sr-only">Month</span>
              <select
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="h-8 w-full min-w-[9.5rem] cursor-pointer appearance-none rounded-full bg-transparent px-2 text-center text-[14px] font-bold text-ink outline-none transition hover:bg-white focus-visible:bg-white"
              >
                {monthChoices(current, month).map((choice) => (
                  <option key={choice} value={choice}>
                    {monthLabel(choice)}
                    {choice === current ? ' (this month)' : ''}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setMonth(shiftMonth(month, 1))}
              disabled={month >= latestMonth}
              aria-label="Next month"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink transition hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight aria-hidden="true" className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </header>

      <div
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        {failed === month && !report ? (
          <div className="rounded-[22px] bg-white px-5 py-10 text-center">
            <p className="text-[15px] font-extrabold text-ink">The rent tracker did not load</p>
            <p className="mt-1 text-[13px] font-medium text-muted">Check your connection and try again.</p>
            <button type="button" onClick={() => setAttempt((count) => count + 1)} className="btn btn-sm btn-ink mt-4">
              Try again
            </button>
          </div>
        ) : !report || !totals ? (
          <LoadingBody />
        ) : (
          <>
            <Summary totals={totals} month={month} today={report.today} timing={report.timing} />

            {totals.earlierOwed > 0 && (
              <p className="flex items-start gap-2 rounded-[18px] bg-carried-bg px-4 py-3 text-[13px] font-semibold leading-[18px] text-carried-fg">
                <Info aria-hidden="true" className="mt-px h-4 w-4 shrink-0" strokeWidth={2.2} />
                <span>
                  Separately, {plural(totals.earlierOwedCount, 'tenant')} still{' '}
                  {totals.earlierOwedCount === 1 ? 'owes' : 'owe'} {currency(totals.earlierOwed)} for months before{' '}
                  {monthNameLabel(month)}. It is not counted above.
                </span>
              </p>
            )}

            {totals.tenants > 0 && (
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <div role="group" aria-label="Show" className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                  {filters
                    .filter((key) => key !== 'late' || counts.late > 0 || filter === 'late')
                    .map((key) => {
                      const active = filter === key
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setFilter(key)}
                          aria-pressed={active}
                          className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13.5px] transition-colors duration-300 ${
                            active ? 'bg-ink font-bold text-white' : 'bg-white font-semibold text-muted hover:text-ink'
                          }`}
                        >
                          {rentTrackerFilterLabel[key]}
                          <span className={`tabular-nums ${active ? 'text-hi' : 'text-ink'}`}>{counts[key]}</span>
                        </button>
                      )
                    })}
                </div>
                <label className="search-field h-10 bg-white sm:max-w-[240px] sm:flex-1">
                  <Search aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <span className="sr-only">Find a tenant</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Name or unit"
                  />
                </label>
              </div>
            )}

            {totals.tenants === 0 ? (
              <div className="rounded-[22px] bg-white px-5 py-10 text-center">
                <p className="text-[15px] font-extrabold text-ink">No tenant is billed for {monthNameLabel(month)}</p>
                <p className="mt-1 text-[13px] font-medium text-muted">
                  {property ? `${property.name} has no tenant paying rent for this month.` : 'Add tenants to see their rent here.'}
                </p>
              </div>
            ) : (
              <>
                {scopeProperties.map((entry) => (
                  <PropertyBlock
                    key={entry.propertyId}
                    property={entry}
                    month={month}
                    filter={filter}
                    query={search}
                    showHeading={!property}
                    mixedTiming={totals.byTiming.length > 1}
                  />
                ))}
                {visibleCount === 0 && (
                  <div className="rounded-[22px] bg-white px-5 py-8 text-center">
                    <p className="text-[15px] font-extrabold text-ink">
                      {search ? 'Nobody matches that search' : `Nobody is ${rentTrackerFilterLabel[filter].toLowerCase()}`}
                    </p>
                    <p className="mt-1 text-[13px] font-medium text-muted">Try another name, unit, or filter.</p>
                  </div>
                )}
              </>
            )}

            {report.timing === 'current' && (
              <p className="px-1 text-center text-[12px] font-medium text-muted">
                As of {dayLabel(report.today)}. A tenant is only late once their own due day has passed.
              </p>
            )}
          </>
        )}
      </div>
    </Dialog>
  )
}
