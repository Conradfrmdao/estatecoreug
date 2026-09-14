'use client'

import { abbreviatedAmount, currentPaymentMonth, monthNameLabel } from '@/lib/format'
import { useEffect, useState } from 'react'

type Summary = {
  collectedThisMonth: number
  totalExpected: number
}

/**
 * The collection ring at the foot of the sidebar (artboard 1c). It reads the
 * existing /api/summary endpoint on the client so no page pays for an extra
 * query just to render chrome.
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

  const size = 56
  const strokeWidth = 6
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
    <div className="rounded-[12px] border border-white/10 bg-white/[0.06] p-3">
      <p className="t-label text-emerald-100/55">{monthNameLabel(currentPaymentMonth())} collection</p>
      <div className="mt-2.5 flex items-center gap-3">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-white/12"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - ratio)}
              className="text-[var(--brand-300)] transition-[stroke-dashoffset] duration-700 ease-out"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="money text-[18px] leading-none text-white">{summary ? `${percent}%` : '--'}</p>
          <p className="mt-1 truncate text-[11.5px] text-emerald-100/60">
            {summary ? (
              <>
                {collected.figure}
                {collected.unit} of {expected.figure}
                {expected.unit}
              </>
            ) : (
              'Loading'
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
