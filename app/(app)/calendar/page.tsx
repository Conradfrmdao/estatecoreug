import CalendarBoard, { type BoardDay, type BoardEvent, type CalendarView } from '@/components/calendar/CalendarBoard'
import PageHeader from '@/components/shell/PageHeader'
import { requireCurrentAppUser } from '@/lib/auth'
import { getCalendarData } from '@/lib/data'
import { dateKey, monthLabel } from '@/lib/format'
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

/** Sunday-first weeks covering the whole month - five or six of them. */
function getMonthGrid(selected: Date) {
  const monthStart = new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth(), 1))
  const monthEnd = new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth() + 1, 0))
  const gridStart = addDays(monthStart, -monthStart.getUTCDay())
  const cells = Math.ceil((monthStart.getUTCDay() + monthEnd.getUTCDate()) / 7) * 7
  return Array.from({ length: cells }, (_, index) => addDays(gridStart, index))
}

const alertTone = {
  success: 'bg-brand',
  warning: 'bg-carried-bar',
  danger: 'bg-overdue-fg',
  info: 'bg-advance-fg'
}

export default async function CalendarPage({
  searchParams
}: {
  searchParams?: Promise<{ date?: string; view?: string }>
}) {
  const user = await requireCurrentAppUser()
  const params = await searchParams
  const { events, alerts } = await getCalendarData(user.id)
  const requested = params?.date ? new Date(`${params.date}T00:00:00.000Z`) : null
  const selected = requested && !Number.isNaN(requested.valueOf()) ? requested : new Date(`${dateKey()}T00:00:00.000Z`)
  const selectedKey = toDateKey(selected)
  const todayKey = dateKey()
  const view: CalendarView = params?.view === 'day' || params?.view === 'week' ? params.view : 'month'
  const weekStart = addDays(selected, -selected.getUTCDay())
  const visibleDays =
    view === 'day'
      ? [selected]
      : view === 'week'
        ? Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
        : getMonthGrid(selected)

  const days: BoardDay[] = visibleDays.map((day) => ({
    key: toDateKey(day),
    day: day.getUTCDate(),
    inMonth: view !== 'month' || day.getUTCMonth() === selected.getUTCMonth()
  }))

  /* Only the days on screen travel to the browser. */
  const onScreen = new Set(days.map((day) => day.key))
  const eventsByDate: Record<string, BoardEvent[]> = {}
  for (const event of events) {
    if (!onScreen.has(event.date)) continue
    ;(eventsByDate[event.date] ??= []).push({
      id: event.id,
      type: event.type,
      title: event.title,
      detail: event.detail,
      subject: event.subject,
      amount: event.amount
    })
  }

  const step = view === 'month' ? null : view === 'week' ? 7 : 1
  const prevDate =
    step === null
      ? new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth() - 1, 1))
      : addDays(selected, -step)
  const nextDate =
    step === null
      ? new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth() + 1, 1))
      : addDays(selected, step)

  const title =
    view === 'month'
      ? monthLabel(selectedKey.slice(0, 7))
      : view === 'week'
        ? `Week of ${new Intl.DateTimeFormat('en-UG', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' }).format(weekStart)}`
        : new Intl.DateTimeFormat('en-UG', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(selected)

  return (
    <div className="page-fill stagger space-y-[22px]">
      <PageHeader
        eyebrow="Rent calendar"
        title="Calendar"
        subtitle="Move-ins, rent due dates, payments, expenses, and overdue reminders."
        actions={
          <>
            <Link href={`/calendar?view=${view}&date=${todayKey}`} className="btn btn-lg btn-outline px-6">
              Today
            </Link>
            <nav aria-label="Calendar view" className="flex items-center gap-0.5 rounded-full bg-white p-1">
              {(['month', 'week', 'day'] as const).map((item) => (
                <Link
                  key={item}
                  href={`/calendar?view=${item}&date=${selectedKey}`}
                  aria-current={view === item ? 'page' : undefined}
                  className={`btn px-5 capitalize ${view === item ? 'btn-ink' : 'font-semibold text-muted hover:bg-canvas hover:text-ink'}`}
                >
                  {item}
                </Link>
              ))}
            </nav>
          </>
        }
        tools={{ user: 'avatar' }}
      />

      {alerts.length > 0 && (
        <section aria-label="Alerts" className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {alerts.slice(0, 4).map((alert) => (
            <div key={alert.id} className="flex items-start gap-3 rounded-[20px] bg-white px-4 py-3.5">
              <span aria-hidden="true" className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${alertTone[alert.severity]}`} />
              <span className="min-w-0">
                <span className="block truncate text-[13.5px] font-bold text-ink">{alert.title}</span>
                <span className="line-clamp-2 text-[12.5px] font-medium leading-[17px] text-muted">{alert.body}</span>
              </span>
            </div>
          ))}
        </section>
      )}

      <CalendarBoard
        view={view}
        title={title}
        prevHref={`/calendar?view=${view}&date=${toDateKey(prevDate)}`}
        nextHref={`/calendar?view=${view}&date=${toDateKey(nextDate)}`}
        days={days}
        events={eventsByDate}
        initialSelected={selectedKey}
        todayKey={todayKey}
      />
    </div>
  )
}
