'use client'

import { monthLabel } from '@/lib/format'
import { ChevronDown } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

/**
 * The month control from artboard 1c — a pill that reads "September 2026",
 * not a bare native input. The native picker still drives it, so there is no
 * custom calendar to maintain and it works on every phone.
 */
export default function MonthPicker({
  month,
  className = ''
}: {
  month: string
  className?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [value, setValue] = useState(month)

  return (
    <div
      className={`relative inline-flex h-10 items-center gap-2 rounded-full border border-[var(--line)] bg-white pl-3.5 pr-3 transition hover:border-[var(--brand-200)] focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[rgba(0,165,80,0.12)] ${className}`}
    >
      <span className="pointer-events-none whitespace-nowrap text-[13.5px] font-semibold text-[var(--text-ink)]">
        {monthLabel(value)}
      </span>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none h-4 w-4 shrink-0 text-[var(--text-soft)]"
        strokeWidth={1.75}
      />
      <input
        type="month"
        value={value}
        aria-label="Select month"
        onChange={(event) => {
          const next = event.target.value
          if (!next) return
          setValue(next)
          router.push(`${pathname}?month=${next}`)
        }}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  )
}
