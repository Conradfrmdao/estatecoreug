import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export type CalendarDayTone = 'paid' | 'due' | 'overdue' | 'expense'

const toneClass: Record<CalendarDayTone, string> = {
  paid: 'bg-[var(--brand)]',
  due: 'bg-[#e0a021]',
  overdue: 'bg-[var(--overdue-fg)]',
  expense: 'bg-[#c98a1c]'
}

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

/**
 * The compact month grid under the owing list. Dots come from the due dates,
 * payments and expenses the dashboard already loaded - nothing new is queried.
 */
export default function MiniCalendar({
  monthName,
  days,
  todayDay,
  events
}: {
  monthName: string
  days: (number | null)[]
  todayDay: number | null
  events: Record<number, CalendarDayTone>
}) {
  return (
    <div className="surface-card shrink-0 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="t-section text-[var(--text-ink)]">{monthName}</h2>
        <Link
          href="/calendar"
          className="t-small inline-flex items-center gap-0.5 font-semibold text-[var(--brand-text)]"
        >
          Calendar
          <ChevronRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-y-0.5 text-center">
        {weekDays.map((day, index) => (
          <span key={`${day}-${index}`} className="text-[10px] font-semibold text-[var(--text-soft)]">
            {day}
          </span>
        ))}

        {days.map((day, index) => {
          const tone = day ? events[day] : undefined
          const isToday = day !== null && day === todayDay

          return (
            <span
              key={`${day ?? 'x'}-${index}`}
              className="relative flex h-[22px] items-center justify-center"
            >
              {day !== null && (
                <>
                  <span
                    className={`flex h-[22px] w-[22px] items-center justify-center rounded-full text-[11px] ${
                      isToday
                        ? 'bg-[var(--brand)] font-semibold text-white'
                        : 'font-medium text-[var(--text-body)]'
                    }`}
                  >
                    {day}
                  </span>
                  {tone && !isToday && (
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-0 h-1 w-1 rounded-full ${toneClass[tone]}`}
                    />
                  )}
                </>
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
}
