import { requireCurrentAppUser } from '@/lib/auth'
import { getCalendarData } from '@/lib/data'
import { dateKey } from '@/lib/format'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function toDateKey(date: Date) {
  return dateKey(date)
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function getMonthGrid(selected: Date) {
  const monthStart = new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth(), 1))
  const gridStart = addDays(monthStart, -monthStart.getUTCDay())
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
}

function eventColors(severity: string) {
  return {
    success: 'bg-green-50 text-green-700 border-green-100',
    warning: 'bg-amber-50 text-amber-800 border-amber-100',
    danger: 'bg-red-50 text-red-700 border-red-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100'
  }[severity] ?? 'bg-slate-50 text-slate-700 border-slate-100'
}

export default async function CalendarPage({
  searchParams
}: {
  searchParams?: Promise<{ date?: string; view?: string }>
}) {
  const user = await requireCurrentAppUser()
  const params = await searchParams
  const { events, alerts } = await getCalendarData(user.id)
  const selected = params?.date ? new Date(`${params.date}T00:00:00.000Z`) : new Date()
  const selectedKey = toDateKey(selected)
  const todayKey = dateKey()
  const view = params?.view === 'day' || params?.view === 'week' ? params.view : 'month'
  const monthGrid = getMonthGrid(selected)
  const eventsByDate = new Map<string, typeof events>()

  for (const event of events) {
    const rows = eventsByDate.get(event.date) ?? []
    rows.push(event)
    eventsByDate.set(event.date, rows)
  }

  const selectedEvents = eventsByDate.get(selectedKey) ?? []
  const weekStart = addDays(selected, -selected.getUTCDay())
  const visibleDays = view === 'day'
    ? [selected]
    : view === 'week'
      ? Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
      : monthGrid

  return (
    <div className="space-y-3 pb-4 animate-in">
      <section className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#00A550' }}>Rent calendar</p>
          <h1 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>Calendar</h1>
          <p className="mt-0.5 text-xs text-slate-500">Move-ins, rent due dates, payments, expenses, and overdue reminders.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/calendar?view=${view}&date=${todayKey}`}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
          >
            Today
          </Link>
          <div className="flex rounded-xl border bg-white p-1" style={{ borderColor: '#e2e8f0' }}>
            {['month', 'week', 'day'].map((item) => (
              <Link
                key={item}
                href={`/calendar?view=${item}&date=${selectedKey}`}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold capitalize"
                style={view === item ? { backgroundColor: '#e6f7ef', color: '#00A550' } : { color: '#64748b' }}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {alerts.length > 0 && (
        <section className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {alerts.slice(0, 4).map((alert) => (
            <div key={alert.id} className="rounded-xl border bg-white p-3" style={{ borderColor: '#e2e8f0' }}>
              <p className="truncate text-xs font-bold" style={{ color: '#1a1a2e' }}>{alert.title}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500">{alert.body}</p>
            </div>
          ))}
        </section>
      )}

      <section className="grid gap-3 xl:grid-cols-[1fr_20rem]">
        <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: '#e2e8f0' }}>
          <div className="grid grid-cols-7 border-b text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400" style={{ borderColor: '#e2e8f0' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="px-2 py-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {visibleDays.map((day) => {
              const key = toDateKey(day)
              const dayEvents = eventsByDate.get(key) ?? []
              const isSelected = key === selectedKey
              const isToday = key === todayKey
              const inMonth = day.getUTCMonth() === selected.getUTCMonth()

              return (
                <Link
                  key={key}
                  href={`/calendar?view=${view}&date=${key}`}
                  className={`min-h-[5.75rem] border-b border-r p-1.5 transition hover:bg-slate-50 ${isSelected ? 'ring-2 ring-inset ring-green-500' : ''}`}
                  style={{ borderColor: '#f1f5f9', backgroundColor: inMonth ? undefined : '#f8fafc' }}
                >
                  <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-bold ${
                    isToday ? 'bg-emerald-700 text-white' : inMonth ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    {day.getUTCDate()}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, view === 'month' ? 2 : 6).map((event) => (
                      <div key={event.id} className={`truncate rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${eventColors(event.severity)}`}>
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && view === 'month' && (
                      <p className="text-[10px] font-semibold text-slate-400">+{dayEvents.length - 2} more</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <aside className="rounded-xl border bg-white p-4" style={{ borderColor: '#e2e8f0' }}>
          <h2 className="text-sm font-bold" style={{ color: '#1a1a2e' }}>{selectedKey}</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {selectedKey === todayKey ? 'Today' : 'Selected day'} events.
          </p>
          <div className="mt-4 space-y-2">
            {selectedEvents.map((event) => (
              <div key={event.id} className={`rounded-xl border p-3 ${eventColors(event.severity)}`}>
                <p className="text-sm font-bold">{event.title}</p>
                <p className="mt-1 text-xs opacity-80">{event.detail}</p>
              </div>
            ))}
            {selectedEvents.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No events on this day.</p>
            )}
          </div>
        </aside>
      </section>
    </div>
  )
}
