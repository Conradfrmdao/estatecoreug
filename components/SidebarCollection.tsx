'use client'

import { abbreviatedAmount, currentPaymentMonth, monthNameLabel } from '@/lib/format'
import { useEffect, useState } from 'react'

type Summary = {
  collectedThisMonth: number
  totalExpected: number
}

/**
 * This month's collection, at the foot of the open menu. It reads the
 * existing /api/summary endpoint on the client so no page pays for an extra
 * query just to render chrome - and, because the shell is shared, it asks
 * once per visit rather than once per page.
 */
export default function SidebarCollection() {
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => {
    let alive = true

    fetch('/api/summary', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('unavailable'))))
      .then((payload: Summary) => {
        if (alive) setSummary(payload)
      })
      .catch(() => undefined)

    return () => {
      alive = false
    }
  }, [])

  const size = 46
  const strokeWidth = 5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const ratio =
    summary && summary.totalExpected > 0
      ? Math.min(Math.max(summary.collectedThisMonth / summary.totalExpected, 0), 1)
      : 0
  const percent = Math.round(ratio * 100)
  const collected = abbreviatedAmount(summary?.collectedThisMonth ?? 0)
  const expected = abbreviatedAmount(summary?.totalExpected ?? 0)

  return (
    <div className="flex items-center gap-3 rounded-[22px] border border-white/10 px-3.5 py-3">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0 -rotate-90"
        role="img"
        aria-label={summary ? `${percent}% of expected rent collected` : 'Loading collection'}
      >
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-white/10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className="stroke-hi transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold leading-4 text-forest-muted">
          {monthNameLabel(currentPaymentMonth())} collection
        </p>
        {summary ? (
          <p className="truncate text-[13px] font-bold leading-5 text-white">
            <span className="money">{percent}%</span>
            <span className="font-semibold text-forest-muted">
              {' '}
              &middot; {collected.figure}
              {collected.unit} of {expected.figure}
              {expected.unit}
            </span>
          </p>
        ) : (
          <span className="skeleton-dark mt-1 block h-3.5 w-24" aria-hidden="true" />
        )}
      </div>
    </div>
  )
}
