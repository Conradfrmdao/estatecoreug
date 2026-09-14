import Money from '@/components/ui/Money'
import SplitBar from '@/components/ui/SplitBar'
import { monthShortLabel } from '@/lib/format'
import type { OutstandingMonthSummary } from '@/lib/rent-display'

export type ComposedBalanceData = {
  total: number
  currentMonthBalance: number
  carriedForwardBalance: number
  outstandingMonths: OutstandingMonthSummary[]
  currentMonth: string
}

function segments(balance: ComposedBalanceData) {
  return [
    { value: balance.currentMonthBalance, tone: 'current' as const },
    { value: balance.carriedForwardBalance, tone: 'carried' as const }
  ]
}

/**
 * Artboard 1b, density A - a table or list cell, two lines maximum.
 * The bar shows the composition; the second line names it.
 */
export function ComposedBalanceCell({
  balance,
  className = ''
}: {
  balance: ComposedBalanceData
  className?: string
}) {
  const hasCarried = balance.carriedForwardBalance > 0

  return (
    <div className={`flex items-stretch justify-end gap-2.5 ${className}`}>
      <SplitBar segments={segments(balance)} className="self-stretch" />
      <div className="min-w-0 text-right">
        <p className="t-section money text-[var(--text-ink)]">
          <Money value={balance.total} />
        </p>
        <p className="mt-0.5 text-[11px] leading-4 text-[var(--text-muted)]">
          {hasCarried ? (
            <>
              <Money value={balance.currentMonthBalance} className="font-semibold" />{' '}
              {monthShortLabel(balance.currentMonth).split(' ')[0]}
              <span className="text-[var(--carried-fg)]">
                {' '}
                +<Money value={balance.carriedForwardBalance} className="font-semibold" /> carried
              </span>
            </>
          ) : (
            `${monthShortLabel(balance.currentMonth).split(' ')[0]} rent only`
          )}
        </p>
      </div>
    </div>
  )
}

/**
 * Artboard 1b, density B - a card on mobile. Total, then one legend row per
 * month so the rollover is spelled out rather than implied.
 */
export function ComposedBalanceCard({
  balance,
  className = ''
}: {
  balance: ComposedBalanceData
  className?: string
}) {
  const owing = balance.outstandingMonths.filter((entry) => entry.balance > 0)

  return (
    <div className={className}>
      <p className="t-label text-[var(--text-soft)]">Total demanded</p>
      <div className="mt-1.5 flex items-stretch gap-3">
        <SplitBar segments={segments(balance)} className="self-stretch" />
        <div className="min-w-0 flex-1">
          <p className="t-title money text-[var(--text-ink)]">
            <Money value={balance.total} prefix />
          </p>
          <ul className="mt-2 space-y-1">
            {owing.map((entry) => {
              const carried = entry.month < balance.currentMonth
              return (
                <li key={entry.month} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="flex min-w-0 items-center gap-1.5 text-[var(--text-muted)]">
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${carried ? 'bg-[#e0a021]' : 'bg-[var(--brand)]'}`}
                    />
                    <span className="truncate">
                      {monthShortLabel(entry.month)} {carried ? '\u2014 carried' : '\u2014 this month'}
                    </span>
                  </span>
                  <Money value={entry.balance} className="shrink-0 text-[var(--text-body)]" />
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
