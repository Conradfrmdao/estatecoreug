'use client'

import { SupportChatTrigger } from '@/components/support/SupportChat'
import Dialog from '@/components/ui/Dialog'
import {
  CalendarDays,
  ChartColumn,
  Grid2x2,
  LogOut,
  ReceiptText,
  Settings,
  ShieldCheck,
  X,
  type LucideIcon
} from 'lucide-react'
import Link from 'next/link'

type MoreLink = {
  href: string
  label: string
  detail: string
  icon: LucideIcon
}

const moreLinks: MoreLink[] = [
  { href: '/units', label: 'Units', detail: 'Inside your properties', icon: Grid2x2 },
  { href: '/expenses', label: 'Expenses', detail: 'Repairs, utilities, upkeep', icon: ReceiptText },
  { href: '/calendar', label: 'Calendar', detail: 'Rent days and reminders', icon: CalendarDays },
  { href: '/reports', label: 'Reports', detail: 'Download PDF reports', icon: ChartColumn }
]

function SheetTile({ href, label, detail, icon: Icon, onNavigate }: MoreLink & { onNavigate: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex min-h-[104px] flex-col justify-between rounded-[22px] bg-canvas p-3.5 transition active:scale-[0.98]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint text-forest">
        <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <span className="mt-3 block">
        <span className="block text-[15px] font-bold text-ink">{label}</span>
        <span className="mt-0.5 block text-[12px] font-medium leading-4 text-muted">{detail}</span>
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
      className="flex min-h-14 items-center gap-3 rounded-[20px] bg-canvas px-3.5 py-3 transition active:scale-[0.99]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ink">
        <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold text-ink">{label}</span>
        <span className="block truncate text-[12.5px] font-medium leading-4 text-muted">{detail}</span>
      </span>
    </Link>
  )
}

export default function MoreSheet({
  open,
  onClose,
  isAdmin,
  onSignOut
}: {
  open: boolean
  onClose: () => void
  isAdmin: boolean
  onSignOut: () => void
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      label="More sections"
      variant="sheet"
      zIndex={95}
      className="max-h-[86dvh] w-full overflow-y-auto rounded-t-[28px] bg-white px-4 pt-3 lg:hidden"
    >
      <div style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
        <span aria-hidden="true" className="mx-auto mb-4 block h-1 w-10 rounded-full bg-line-strong" />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[22px] font-extrabold leading-7 tracking-[-0.01em] text-ink">More</h2>
            <p className="text-[13px] font-medium text-muted">Everything not on the bar.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="btn btn-soft btn-icon">
            <X aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
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
          {isAdmin && (
            <SheetRow
              href="/admin"
              label="Admin"
              detail="Approvals, users and support inbox"
              icon={ShieldCheck}
              onNavigate={onClose}
            />
          )}
          <SupportChatTrigger variant="row" />
          <button
            type="button"
            onClick={() => {
              onClose()
              onSignOut()
            }}
            className="flex min-h-14 w-full items-center gap-3 rounded-[20px] px-3.5 py-3 text-left text-danger transition active:scale-[0.99]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-soft">
              <LogOut aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span className="text-[15px] font-bold">Log out</span>
          </button>
        </div>
      </div>
    </Dialog>
  )
}
