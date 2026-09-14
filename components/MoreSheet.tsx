'use client'

import SupportChatWidget from '@/components/SupportChatWidget'
import {
  BarChart3,
  CalendarDays,
  Grid3X3,
  ReceiptText,
  Settings,
  X,
  type LucideIcon
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type MoreLink = {
  href: string
  label: string
  detail: string
  icon: LucideIcon
}

const moreLinks: MoreLink[] = [
  { href: '/units', label: 'Units', detail: 'Inside your properties', icon: Grid3X3 },
  { href: '/expenses', label: 'Expenses', detail: 'Repairs, utilities, upkeep', icon: ReceiptText },
  { href: '/calendar', label: 'Calendar', detail: 'Rent days and reminders', icon: CalendarDays },
  { href: '/reports', label: 'Reports', detail: 'Download PDF or CSV', icon: BarChart3 }
]

function SheetTile({ href, label, detail, icon: Icon, onNavigate }: MoreLink & { onNavigate: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="surface-card flex min-h-[92px] flex-col justify-between p-3.5 transition active:scale-[0.98]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--paid-bg)] text-[var(--brand-text)]">
        <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="mt-3 block">
        <span className="t-section block text-[var(--text-ink)]">{label}</span>
        <span className="mt-0.5 block text-[12px] leading-4 text-[var(--text-muted)]">{detail}</span>
      </span>
    </Link>
  )
}

function SheetRow({
  href,
  label,
  detail,
  icon: Icon,
  onNavigate
}: MoreLink & { onNavigate: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="surface-card flex min-h-14 items-center gap-3 px-3.5 py-3 transition active:scale-[0.99]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--neutral-bg)] text-[var(--text-muted)]">
        <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="t-section block truncate text-[var(--text-ink)]">{label}</span>
        <span className="block truncate text-[12px] leading-4 text-[var(--text-muted)]">{detail}</span>
      </span>
    </Link>
  )
}

export default function MoreSheet({
  open,
  onClose,
  isAdmin,
  adminSlot
}: {
  open: boolean
  onClose: () => void
  isAdmin: boolean
  adminSlot?: ReactNode
}) {
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[95] flex items-end bg-[#04211c]/45 lg:hidden"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="More sections"
        className="surface-sheet max-h-[86dvh] w-full overflow-y-auto rounded-b-none px-4 pt-3"
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
      >
        <span aria-hidden="true" className="mx-auto mb-4 block h-1 w-10 rounded-full bg-[var(--line-strong)]" />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="t-title text-[var(--text-ink)]">More</h2>
            <p className="t-small text-[var(--text-muted)]">Everything not on the bar.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--text-muted)]"
          >
            <X aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {moreLinks.map((item) => (
            <SheetTile key={item.href} {...item} onNavigate={onClose} />
          ))}
        </div>

        <div className="mt-2.5 space-y-2.5">
          <SheetRow
            href="/settings"
            label="Settings"
            detail="Account, currency, preferences"
            icon={Settings}
            onNavigate={onClose}
          />
          {isAdmin && adminSlot}
          {!isAdmin && <SupportChatWidget variant="row" />}
        </div>
      </section>
    </div>,
    document.body
  )
}
