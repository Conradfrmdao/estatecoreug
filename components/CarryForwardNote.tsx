import { currency, monthListLabel, monthShortLabel } from '@/lib/format'
import type { OutstandingMonthSummary } from '@/lib/rent-display'
import { CornerDownRight } from 'lucide-react'

export type CarryForwardNoteProps = {
  carriedForwardBalance: number
  carriedForwardMonths: OutstandingMonthSummary[]
  className?: string
  compact?: boolean
}

export function carryForwardSentence({
  carriedForwardBalance,
  carriedForwardMonths
}: Pick<CarryForwardNoteProps, 'carriedForwardBalance' | 'carriedForwardMonths'>) {
  if (carriedForwardBalance <= 0 || carriedForwardMonths.length === 0) {
    return ''
  }

  return `Includes ${currency(carriedForwardBalance)} carried forward from ${monthListLabel(
    carriedForwardMonths.map((entry) => entry.month)
  )}`
}

export default function CarryForwardNote({
  carriedForwardBalance,
  carriedForwardMonths,
  className = '',
  compact = false
}: CarryForwardNoteProps) {
  const sentence = compact
    ? carriedForwardBalance > 0 && carriedForwardMonths.length > 0
      ? `+${currency(carriedForwardBalance)} carried`
      : ''
    : carryForwardSentence({ carriedForwardBalance, carriedForwardMonths })

  if (!sentence) {
    return null
  }

  return (
    <span
      className={`mt-1 inline-flex items-start gap-1 text-[11px] font-semibold leading-snug text-amber-700 ${className}`}
      title={carriedForwardMonths
        .map((entry) => `${monthShortLabel(entry.month)}: ${currency(entry.balance)}`)
        .join(' | ')}
    >
      <CornerDownRight aria-hidden="true" className="mt-px h-3 w-3 shrink-0" strokeWidth={2.2} />
      <span>{sentence}</span>
    </span>
  )
}

export function CarryForwardBreakdown({
  months,
  currentMonth,
  className = ''
}: {
  months: OutstandingMonthSummary[]
  currentMonth: string
  className?: string
}) {
  const owing = months.filter((entry) => entry.balance > 0)

  if (owing.length === 0) {
    return null
  }

  return (
    <ul className={`space-y-1 ${className}`}>
      {owing.map((entry) => (
        <li key={entry.month} className="flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-slate-600">
            {monthShortLabel(entry.month)}
            {entry.month < currentMonth && (
              <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-700">
                Carried
              </span>
            )}
          </span>
          <span className="font-black text-slate-800">{currency(entry.balance)}</span>
        </li>
      ))}
    </ul>
  )
}
