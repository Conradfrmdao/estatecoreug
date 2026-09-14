import NotificationBell from '@/components/NotificationBell'
import { ComposedBalanceCell } from '@/components/ui/ComposedBalance'
import CollectionRing from '@/components/ui/CollectionRing'
import Money from '@/components/ui/Money'
import SplitBar from '@/components/ui/SplitBar'
import StatusPill from '@/components/ui/StatusPill'
import type { DashboardView } from '@/components/dashboard/types'
import { ChevronRight, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

function MiniStat({
  label,
  value,
  fill,
  tone
}: {
  label: string
  value: number
  fill: number
  tone: 'carried' | 'spent' | 'current'
}) {
  return (
    <div className="surface-card min-w-0 px-3 py-2.5">
      <p className="t-label truncate text-[var(--text-soft)]">{label}</p>
      <p className="mt-1 text-[19px] leading-none text-[var(--text-ink)]">
        <Money value={value} abbreviate />
      </p>
      <SplitBar
        orientation="horizontal"
        className="mt-2"
        segments={[
          { value: Math.max(fill, 0), tone },
          { value: Math.max(1 - fill, 0), tone: 'track' }
        ]}
      />
    </div>
  )
}

export default function MobileDashboard({ view }: { view: DashboardView }) {
  const expectedRatio = view.totalExpected > 0 ? view.collectedThisMonth / view.totalExpected : 0

  return (
    <div className="lg:hidden">
      <header className="aurora rounded-b-[22px] px-4 pb-4 pt-[calc(0.75rem+env(safe-area-inset-top))] text-white">
        <div className="flex items-center justify-between gap-3">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[10px] bg-white/10 ring-1 ring-white/15">
            <Image
              src="/estatecore-mark.png"
              alt="EstateCore UG"
              width={80}
              height={80}
              className="h-10 w-10 object-contain"
              priority
            />
          </span>
          <NotificationBell />
        </div>

        <div className="mt-5 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="t-label text-emerald-100/60">Kampala, Uganda</p>
            <h1 className="t-display mt-0.5 truncate text-white">Hello, {view.greetingName}</h1>

            <p className="t-label mt-5 text-emerald-100/60">
              Collected &middot; {view.monthName}
            </p>
            <p className="money mt-1 text-[30px] leading-none text-white">
              <span className="money-prefix text-emerald-100/60">UGX&nbsp;</span>
              <Money value={view.collectedThisMonth} />
            </p>
            <p className="t-small mt-1.5 text-emerald-100/70">
              {view.collectedPercent}% of <Money value={view.totalExpected} className="font-semibold" />{' '}
              expected
            </p>
          </div>

          <CollectionRing
            collected={view.collectedThisMonth}
            expected={view.totalExpected}
            size={92}
            strokeWidth={8}
            className="mt-1"
          />
        </div>

        <nav aria-label="Select month" className="no-scrollbar -mx-1 mt-5 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          {view.scrubberMonths.map((entry) => (
            <Link
              key={entry.month}
              href={`/dashboard?month=${entry.month}`}
              aria-current={entry.isCurrent ? 'page' : undefined}
              className={`flex min-h-9 shrink-0 items-center rounded-full px-3.5 text-[13px] transition ${
                entry.isCurrent
                  ? 'bg-white font-semibold text-[var(--brand-deep)]'
                  : 'bg-white/10 font-medium text-emerald-50/75'
              }`}
            >
              {entry.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="space-y-4 px-4 pt-4">
        <div className="grid grid-cols-3 gap-2">
          <MiniStat
            label="Owed"
            value={view.totalOutstanding}
            tone="carried"
            fill={
              view.totalOutstanding + view.collectedThisMonth > 0
                ? view.totalOutstanding / (view.totalOutstanding + view.collectedThisMonth)
                : 0
            }
          />
          <MiniStat
            label="Spent"
            value={view.expensesThisMonth}
            tone="spent"
            fill={view.collectedThisMonth > 0 ? view.expensesThisMonth / view.collectedThisMonth : 0}
          />
          <MiniStat
            label="Net"
            value={view.netThisMonth}
            tone="current"
            fill={view.collectedThisMonth > 0 ? Math.max(view.netThisMonth, 0) / view.collectedThisMonth : 0}
          />
        </div>

        <Link
          href="/payments/new"
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-[var(--brand)] text-[16px] font-semibold text-white shadow-[0_8px_20px_rgba(0,165,80,0.28)] transition active:scale-[0.99]"
        >
          <Plus aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
          Record payment
        </Link>

        <section>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="t-section text-[var(--text-ink)]">Who owes rent</h2>
              {view.owingRows.length > 0 && (
                <span className="money flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--overdue-bg)] px-1.5 text-[11px] text-[var(--overdue-fg)]">
                  {view.owingRows.length}
                </span>
              )}
            </div>
            <Link
              href="/tenants"
              className="t-small inline-flex items-center gap-0.5 font-semibold text-[var(--brand-text)]"
            >
              All
              <ChevronRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
            </Link>
          </div>

          <ul className="mt-3 space-y-2.5">
            {view.owingRows.map((row) => (
              <li key={row.tenantId} className="surface-card p-3.5">
                <div className="flex items-start gap-3">
                  <span className="money flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--paid-bg)] text-[12px] text-[var(--brand-text)]">
                    {row.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="t-section min-w-0 truncate text-[var(--text-ink)]">{row.name}</p>
                      <StatusPill kind={row.statusKind} detail={row.statusDetail} />
                    </div>
                    <p className="mt-0.5 truncate text-[12px] leading-4 text-[var(--text-muted)]">
                      {row.propertyName} &middot; {row.unitNumber} &middot; {row.dueLabel}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-end justify-between gap-3">
                  <Link
                    href={`/payments/new?tenantId=${row.tenantId}`}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-[10px] border border-[var(--brand-200)] bg-[var(--paid-bg)] px-3 text-[13px] font-semibold text-[var(--brand-text)]"
                  >
                    <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
                    Record
                  </Link>
                  <ComposedBalanceCell balance={row.balance} />
                </div>
              </li>
            ))}
          </ul>

          {view.owingRows.length === 0 && (
            <div className="surface-card mt-3 px-4 py-8 text-center">
              <p className="t-section text-[var(--brand-text)]">Everyone has paid</p>
              <p className="t-small mt-1 text-[var(--text-muted)]">
                No tenant owes rent for {view.monthName}.
              </p>
            </div>
          )}

          {view.fullyPaidCount > 0 && (
            <p className="t-small mt-3 text-center text-[var(--text-muted)]">
              {view.fullyPaidCount} tenant{view.fullyPaidCount === 1 ? ' is' : 's are'} fully paid for{' '}
              {view.monthName}.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
