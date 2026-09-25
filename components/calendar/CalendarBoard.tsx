'use client'

import { amountDigits } from '@/lib/format'
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export type CalendarView = 'month' | 'week' | 'day'

export type BoardEvent = {
  id: string
  type: 'move_in' | 'due' | 'overdue' | 'payment' | 'expense'
  title: string
  detail: string
  subject: string
  amount?: number
}

export type BoardDay = {
  key: string
  day: number
  inMonth: boolean
}

/* Inside a day a phone shows a dot; from sm up the dot opens into a chip. */
const chipTone: Record<BoardEvent['type'], string> = {
  payment: 'sm:bg-hi sm:text-ink',
  due: 'sm:bg-carried-bg sm:text-carried-fg',
  overdue: 'sm:bg-overdue-bg sm:text-overdue-fg',
  expense: 'sm:bg-danger-soft sm:text-danger',
  move_in: 'sm:bg-advance-bg sm:text-advance-fg'
}

const dotTone: Record<BoardEvent['type'], string> = {
  payment: 'bg-brand',
  due: 'bg-carried-bar',
  overdue: 'bg-overdue-fg',
  expense: 'bg-danger',
  move_in: 'bg-advance-fg'
}

const legend: { type: BoardEvent['type']; label: string }[] = [
  { type: 'payment', label: 'Payment' },
  { type: 'due', label: 'Rent due' },
  { type: 'overdue', label: 'Overdue' },
  { type: 'expense', label: 'Expense' },
  { type: 'move_in', label: 'Move-in' }
]

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name
}

/* What fits on a chip inside a day: money for money, a name for the rest. */
function chipLabel(event: BoardEvent) {
  if (event.type === 'payment' && typeof event.amount === 'number') return `+${amountDigits(event.amount)}`
  if (event.type === 'expense' && typeof event.amount === 'number') return `−${amountDigits(event.amount)}`
  if (event.type === 'due') return `Due · ${firstName(event.subject)}`
  if (event.type === 'overdue') return `Overdue · ${firstName(event.subject)}`
  return `Moved in · ${firstName(event.subject)}`
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

/* Spelled out by hand: Node and the browser ship different ICU data, and a
   label that differs between them fails hydration. */
function longDate(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  return `${WEEKDAYS[weekday]} ${day} ${MONTHS[month - 1]} ${year}`
}

/**
 * The rent calendar. The server hands over the days on screen and their
 * events; picking a day happens here, instantly, and the address follows so
 * a reload or a shared link opens on the same day.
 */
export default function CalendarBoard({
  view,
  title,
  prevHref,
  nextHref,
  days,
  events,
  initialSelected,
  todayKey
}: {
  view: CalendarView
  title: string
  prevHref: string
  nextHref: string
  days: BoardDay[]
  events: Record<string, BoardEvent[]>
  initialSelected: string
  todayKey: string
}) {
  /* The address bar is the one record of the selected day: a click replaces
     it without a round trip, and Today or Back simply change it again. */
  const searchParams = useSearchParams()
  const requested = searchParams.get('date')
  const selected = requested && days.some((day) => day.key === requested) ? requested : initialSelected
  const selectedEvents = events[selected] ?? []
  const rows = view === 'month' ? days.length / 7 : 1
  const perDay = view === 'month' ? 2 : 6

  function select(key: string) {
    window.history.replaceState(null, '', `/calendar?view=${view}&date=${key}`)
  }

  const presentTypes = new Set(Object.values(events).flat().map((event) => event.type))

  return (
    <section aria-label={title} className="flex min-h-0 flex-col gap-5 xl:flex-1 xl:flex-row">
      <div className="flex min-w-0 flex-1 flex-col rounded-[24px] bg-white p-4 sm:px-6 sm:py-[22px] lg:rounded-card">
        <div className="flex items-center justify-between gap-3 pb-3.5">
          <h2 className="text-[20px] font-extrabold leading-[26px] tracking-[-0.01em] text-ink">{title}</h2>
          <div className="flex items-center gap-1.5">
            <Link href={prevHref} scroll={false} aria-label={`Previous ${view}`} className="btn btn-soft btn-icon">
              <ChevronLeft aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </Link>
            <Link href={nextHref} scroll={false} aria-label={`Next ${view}`} className="btn btn-soft btn-icon">
              <ChevronRight aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </Link>
          </div>
        </div>

        {view !== 'day' && (
          <div
            aria-hidden="true"
            className="grid grid-cols-7 gap-1.5 pb-2 text-center text-[10.5px] font-bold uppercase leading-4 tracking-[0.08em] text-muted sm:gap-2 sm:text-[11.5px]"
          >
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        )}

        <div
          className={`grid min-h-[340px] flex-1 gap-1.5 sm:gap-2 ${view === 'day' ? 'grid-cols-1' : 'grid-cols-7'}`}
          style={{ gridTemplateRows: `repeat(${rows}, minmax(${view === 'month' ? '4.5rem' : '10rem'}, 1fr))` }}
        >
          {days.map((cell) => {
            const dayEvents = events[cell.key] ?? []
            const isToday = cell.key === todayKey
            const chosen = cell.key === selected
            const label = `${longDate(cell.key)}${isToday ? ', today' : ''}${dayEvents.length ? `, ${dayEvents.length} event${dayEvents.length === 1 ? '' : 's'}` : ''}`

            const content = (
              <>
                <span
                  className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[13.5px] tabular-nums ${
                    isToday ? 'bg-ink font-extrabold text-white' : cell.inMonth ? 'font-semibold text-ink' : 'font-medium text-faint'
                  }`}
                >
                  {cell.day}
                </span>
                {view === 'day' && (
                  <span className="text-[13px] font-semibold text-muted">{longDate(cell.key)}</span>
                )}
                <span className="flex min-w-0 flex-wrap gap-1 sm:flex-col sm:flex-nowrap">
                  {dayEvents.slice(0, perDay).map((event) => (
                    <span
                      key={event.id}
                      className={`h-1.5 w-1.5 rounded-full sm:h-auto sm:w-auto sm:truncate sm:rounded-full sm:px-2 sm:py-1 sm:text-[11px] sm:font-bold sm:leading-[15px] ${dotTone[event.type]} ${chipTone[event.type]}`}
                    >
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">{chipLabel(event)}</span>
                    </span>
                  ))}
                  {dayEvents.length > perDay && (
                    <span className="basis-full pl-0.5 text-[11px] font-bold leading-[15px] text-brand-text sm:basis-auto sm:pl-2">
                      +{dayEvents.length - perDay}
                    </span>
                  )}
                </span>
              </>
            )

            const tileClass = `flex min-w-0 flex-col items-stretch gap-1.5 overflow-hidden rounded-[14px] p-1.5 text-left transition-[box-shadow,background-color] duration-200 sm:rounded-[18px] sm:p-2.5 ${
              cell.inMonth ? 'bg-canvas hover:bg-mint-soft' : 'bg-transparent hover:bg-canvas'
            }`

            if (view === 'month' && !cell.inMonth) {
              return (
                <Link key={cell.key} href={`/calendar?view=${view}&date=${cell.key}`} scroll={false} aria-label={label} className={tileClass}>
                  {content}
                </Link>
              )
            }

            return (
              <button
                key={cell.key}
                type="button"
                aria-label={label}
                aria-pressed={chosen}
                onClick={() => select(cell.key)}
                className={tileClass}
                style={{ boxShadow: chosen ? '0 0 0 2px rgb(var(--c-brand))' : 'none' }}
              >
                {content}
              </button>
            )
          })}
        </div>
      </div>

      <aside
        aria-label="Day details"
        aria-live="polite"
        className="flex shrink-0 flex-col gap-4 rounded-[24px] bg-white p-5 sm:p-6 lg:rounded-card xl:w-[360px]"
      >
        <div key={`head-${selected}`} className="fade-in flex flex-col gap-1">
          <h2 className="text-[22px] font-extrabold leading-7 tracking-[-0.01em] tabular-nums text-ink">{selected}</h2>
          <p className="text-[14px] font-medium leading-5 text-muted">
            {selected === todayKey ? 'Today events.' : 'Events on this day.'}
          </p>
        </div>

        {selectedEvents.length === 0 ? (
          <div key={`none-${selected}`} className="fade-in flex items-center gap-3 rounded-panel bg-canvas p-[22px]">
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-text">
              <CalendarDays className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="text-[14px] font-semibold leading-5 text-ink-soft">No events on this day.</span>
          </div>
        ) : (
          <ul key={`list-${selected}`} className="no-scrollbar flex min-h-0 flex-col gap-2.5 overflow-y-auto xl:max-h-none">
            {selectedEvents.map((event) => (
              <li key={event.id} className="fade-in flex items-center gap-3 rounded-[20px] bg-canvas px-4 py-3.5">
                <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotTone[event.type]}`} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[14px] font-bold leading-5 text-ink">{event.title}</span>
                  <span className="text-[12px] font-medium leading-4 text-muted">{event.detail}</span>
                </span>
                {typeof event.amount === 'number' && (event.type === 'payment' || event.type === 'expense') && (
                  <span
                    className={`whitespace-nowrap text-[14px] font-extrabold leading-5 tabular-nums ${
                      event.type === 'payment' ? 'text-brand-text' : 'text-danger'
                    }`}
                  >
                    {event.type === 'payment' ? '+' : '−'}
                    {amountDigits(event.amount)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[12.5px] font-semibold leading-[17px] text-muted">
            {legend
              .filter((item) => item.type === 'payment' || presentTypes.has(item.type))
              .map((item) => (
                <span key={item.type} className="flex items-center gap-1.5">
                  <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${dotTone[item.type]}`} />
                  {item.label}
                </span>
              ))}
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-ink" />
              Today
            </span>
          </div>
          <Link href="/payments" className="btn h-12 w-full btn-ink">
            Open payments
            <ArrowRight aria-hidden="true" className="h-[17px] w-[17px]" strokeWidth={2.2} />
          </Link>
        </div>
      </aside>
    </section>
  )
}
