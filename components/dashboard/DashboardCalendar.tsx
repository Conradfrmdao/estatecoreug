'use client'

import Avatar from '@/components/ui/Avatar'
import { amountDigits } from '@/lib/format'
import { ArrowRight, CalendarCheck, ChevronLeft, ChevronRight, ReceiptText } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { CalendarEntry, DashboardCalendar as CalendarData } from './types'

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function weekdayOf(month: string, day: number) {
  const [year, monthNumber] = month.split('-').map(Number)
  return weekdayNames[new Date(Date.UTC(year, monthNumber - 1, day)).getUTCDay()]
}

function plural(count: number, one: string) {
  return `${count} ${one}${count === 1 ? '' : 's'}`
}

function EntryRow({ entry }: { entry: CalendarEntry }) {
  const amountClass =
    entry.kind === 'expense'
      ? 'text-danger'
      : entry.kind === 'overdue'
        ? 'text-overdue-fg'
        : entry.kind === 'due'
          ? 'text-due-fg'
          : 'text-ink'

  return (
    <li className="fade-in flex items-center gap-2.5">
      {entry.kind === 'expense' ? (
        <span aria-hidden="true" className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-white text-danger">
          <ReceiptText className="h-4 w-4" strokeWidth={1.9} />
        </span>
      ) : (
        <Avatar initials={entry.initials} tone={entry.tone} size={34} />
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13px] font-bold leading-[18px] text-ink">{entry.name}</span>
        <span className="truncate text-[12px] font-medium leading-4 text-muted">{entry.detail}</span>
      </span>
      {typeof entry.amount === 'number' && (
        <span className={`whitespace-nowrap text-[13px] font-bold leading-[18px] tabular-nums ${amountClass}`}>
          {entry.kind === 'expense' ? '−' : ''}
          {amountDigits(entry.amount)}
        </span>
      )}
    </li>
  )
}

/**
 * The dashboard's month: days rent was received are lit, and picking a day
 * shows what happened on it without leaving the page.
 */
export default function DashboardCalendar({ calendar }: { calendar: CalendarData }) {
  const router = useRouter()
  const firstPaidDay = Object.keys(calendar.entries)
    .map(Number)
    .sort((a, b) => a - b)
    .find((day) => calendar.entries[day].some((entry) => entry.kind === 'payment'))
  const [selected, setSelected] = useState(calendar.todayDay ?? firstPaidDay ?? 1)

  const weeks = calendar.cells.length / 7
  const selectedEntries = calendar.entries[selected] ?? []
  const payments = selectedEntries.filter((entry) => entry.kind === 'payment')
  const dayTotal = payments.reduce((total, entry) => total + (entry.amount ?? 0), 0)
  const isToday = selected === calendar.todayDay
  const isFuture =
    calendar.timing === 'future' || (calendar.timing === 'current' && calendar.todayDay !== null && selected > calendar.todayDay)

  let note = 'No rent was paid on this day.'
  if (isToday) {
    note = calendar.allPaid
      ? `No payments today. All ${plural(calendar.activeTenantCount, 'tenant')} have already paid for ${calendar.monthName}.`
      : 'No payments recorded today yet.'
  } else if (isFuture) {
    note = 'Nothing recorded yet for this day.'
  }

  const dd = String(selected).padStart(2, '0')

  return (
    <article className="flex min-h-[330px] gap-5 overflow-hidden rounded-card bg-white p-5 xl:col-span-2 xl:min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-h-11 shrink-0 items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="text-[18px] font-bold leading-6 text-ink">Calendar</h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] font-semibold leading-4 text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-hi" />
                Rent paid
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-ink" />
                Today
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Link href={calendar.prevHref} scroll={false} aria-label="Previous month" className="btn btn-soft btn-icon">
              <ChevronLeft aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </Link>
            <label className="relative flex h-11 min-w-[124px] cursor-pointer items-center justify-center rounded-full px-2 text-[14px] font-bold text-ink transition hover:bg-canvas">
              {calendar.monthLabel}
              <input
                type="month"
                aria-label="Choose month"
                defaultValue={calendar.month}
                onChange={(event) => {
                  if (event.target.value) router.push(`${calendar.monthHrefBase}${event.target.value}`, { scroll: false })
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </label>
            <Link href={calendar.nextHref} scroll={false} aria-label="Next month" className="btn btn-soft btn-icon">
              <ChevronRight aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </Link>
          </div>
        </div>

        <div aria-hidden="true" className="mt-3 grid shrink-0 grid-cols-7 text-center text-[12px] font-semibold leading-4 text-muted">
          {weekdays.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div
          className="mt-1.5 grid min-h-[240px] flex-1 grid-cols-7 justify-items-center gap-y-1 xl:min-h-0"
          style={{ gridTemplateRows: `repeat(${weeks}, minmax(0, 1fr))` }}
        >
          {calendar.cells.map((cell, index) => {
            if (!cell.inMonth) {
              return (
                <span
                  key={`out-${index}`}
                  aria-hidden="true"
                  className="flex aspect-square h-full max-h-11 items-center justify-center text-[14px] font-medium tabular-nums text-faint"
                >
                  {cell.day}
                </span>
              )
            }

            const list = calendar.entries[cell.day] ?? []
            const paid = list.some((entry) => entry.kind === 'payment')
            const overdue = list.some((entry) => entry.kind === 'overdue')
            const due = list.some((entry) => entry.kind === 'due')
            const expense = list.some((entry) => entry.kind === 'expense')
            const today = cell.day === calendar.todayDay
            const chosen = cell.day === selected
            const paymentCount = list.filter((entry) => entry.kind === 'payment').length

            let tone = 'bg-transparent text-ink font-semibold hover:bg-canvas'
            if (paid) tone = 'bg-hi text-ink font-extrabold'
            if (today) tone = 'bg-ink text-white font-extrabold'
            if (chosen && !paid && !today) tone = 'bg-mint-soft text-ink font-extrabold'

            const marker = overdue ? 'bg-overdue-fg' : due ? 'bg-carried-bar' : expense ? 'bg-ink-soft' : ''
            const label = [
              `${cell.day} ${calendar.monthName}`,
              today ? 'today' : '',
              paymentCount ? plural(paymentCount, 'payment') : '',
              overdue ? 'rent overdue' : due ? 'rent due' : '',
              expense ? 'expense' : ''
            ]
              .filter(Boolean)
              .join(', ')

            return (
              <button
                key={cell.day}
                type="button"
                aria-label={label}
                aria-pressed={chosen}
                onClick={() => setSelected(cell.day)}
                className={`relative flex aspect-square h-full max-h-11 items-center justify-center rounded-full text-[14px] tabular-nums transition-[background-color,box-shadow,color] duration-200 ${tone}`}
                style={{ boxShadow: chosen ? '0 0 0 2px #FFFFFF, 0 0 0 4px rgb(var(--c-brand))' : 'none' }}
              >
                {cell.day}
                {marker && (
                  <span aria-hidden="true" className={`absolute bottom-[5px] h-1 w-1 rounded-full ${marker}`} />
                )}
              </button>
            )
          })}
        </div>

        {(calendar.hasDue || calendar.hasOverdue || calendar.hasExpenses) && (
          <div className="mt-2 flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px] font-semibold leading-4 text-muted">
            {calendar.hasDue && (
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-carried-bar" />
                Rent due
              </span>
            )}
            {calendar.hasOverdue && (
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-overdue-fg" />
                Overdue
              </span>
            )}
            {calendar.hasExpenses && (
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-ink-soft" />
                Expense
              </span>
            )}
          </div>
        )}
      </div>

      <aside
        aria-label="Day overview"
        aria-live="polite"
        className="flex w-[264px] shrink-0 flex-col rounded-panel bg-canvas px-4 pb-4 pt-[18px]"
      >
        <div className="flex min-h-[22px] items-center justify-between">
          <span className="text-[12px] font-semibold leading-4 text-muted">Day overview</span>
          {isToday && (
            <span className="pop-in rounded-full bg-ink px-2.5 py-[3px] text-[11.5px] font-bold leading-4 text-white">Today</span>
          )}
        </div>
        <h3 key={`title-${selected}`} className="fade-in mt-1 text-[18px] font-extrabold leading-6 tracking-[-0.01em] text-ink">
          {weekdayOf(calendar.month, selected)}, {selected} {calendar.shortMonth}
        </h3>

        {selectedEntries.length > 0 ? (
          <div className="mt-3.5 flex min-h-0 flex-1 flex-col gap-2.5">
            <ul key={`list-${selected}`} className="no-scrollbar flex min-h-0 flex-col gap-2.5 overflow-y-auto">
              {selectedEntries.map((entry) => (
                <EntryRow key={entry.key} entry={entry} />
              ))}
            </ul>
            {payments.length > 0 && (
              <div className="flex items-baseline justify-between border-t border-line-strong/60 pt-2.5 text-[12px] font-semibold leading-4 text-muted">
                <span>Day total</span>
                <span className="text-[13px] font-extrabold leading-[18px] tabular-nums text-ink">UGX {amountDigits(dayTotal)}</span>
              </div>
            )}
          </div>
        ) : (
          <div key={`note-${selected}`} className="fade-in mt-3.5 flex items-start gap-2.5">
            <span aria-hidden="true" className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-white text-brand-text">
              <CalendarCheck className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
            <p className="text-[13px] font-medium leading-[18px] text-ink-soft">{note}</p>
          </div>
        )}

        <p className="mb-2.5 mt-auto pt-3 text-[12px] font-semibold leading-4 text-muted">
          {calendar.paymentCount > 0
            ? `${plural(calendar.paymentCount, 'payment')} on ${plural(calendar.paymentDayCount, 'day')} this month`
            : `No payments received in ${calendar.monthName}`}
        </p>
        <Link href={`/calendar?date=${calendar.month}-${dd}`} className="btn btn-ink w-full shrink-0">
          Open calendar
          <ArrowRight aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </Link>
      </aside>
    </article>
  )
}
