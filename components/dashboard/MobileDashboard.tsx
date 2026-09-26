import NotificationBell from '@/components/NotificationBell'
import type { DashboardView } from '@/components/dashboard/types'
import { LogoMark } from '@/components/brand/Logo'
import RentTrackerLauncher from '@/components/rent-tracker/RentTrackerLauncher'
import { ComposedBalanceCell } from '@/components/ui/ComposedBalance'
import CollectionRing from '@/components/ui/CollectionRing'
import Money from '@/components/ui/Money'
import SplitBar from '@/components/ui/SplitBar'
import StatusPill from '@/components/ui/StatusPill'
import { UserButton } from '@clerk/nextjs'
import { ChevronRight, ClipboardList, Plus } from 'lucide-react'
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
    <div className="min-w-0 rounded-[20px] bg-white px-3 py-3">
      <p className="truncate text-[11px] font-bold uppercase leading-4 tracking-[0.07em] text-muted">{label}</p>
      <p className="mt-1 text-[19px] font-extrabold leading-none text-ink">
        <Money value={value} abbreviate />
      </p>
      <SplitBar
        orientation="horizontal"
        className="mt-2.5"
        segments={[
          { value: Math.max(fill, 0), tone },
          { value: Math.max(1 - fill, 0), tone: 'track' }
        ]}
      />
    </div>
  )
}

export default function MobileDashboard({ view }: { view: DashboardView }) {
  return (
    <div className="bg-canvas lg:hidden">
      <div aria-hidden="true" className="notch-fill bg-forest" />
      <header className="safe-top rounded-b-[28px] bg-forest px-4 pb-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <LogoMark tone="white" size={42} label="EstateCore UG" />
          <div className="flex items-center gap-2">
            <NotificationBell size="md" tone="dark" />
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <UserButton />
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-forest-muted">Kampala, Uganda</p>
            <h1 className="mt-0.5 text-[clamp(1.375rem,6.4vw,1.75rem)] font-extrabold leading-[1.15] tracking-[-0.02em] text-white [overflow-wrap:anywhere]">
              Hi {view.greetingName}
            </h1>

            <p className="mt-5 text-[11.5px] font-bold uppercase tracking-[0.08em] text-forest-muted">
              Collected &middot; {view.monthName}
            </p>
            <p className="money mt-1 text-[30px] leading-none text-white">
              <span className="money-prefix !text-forest-muted">UGX&nbsp;</span>
              <Money value={view.collectedThisMonth} />
            </p>
            <p className="mt-1.5 text-[13px] font-medium text-forest-muted">
              {view.collectedPercent}% of <Money value={view.totalExpected} className="text-white" /> expected
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
              href={entry.href}
              scroll={false}
              aria-current={entry.isCurrent ? 'page' : undefined}
              className={`flex min-h-9 shrink-0 items-center rounded-full px-4 text-[13px] transition-colors duration-300 ${
                entry.isCurrent ? 'bg-hi font-bold text-ink' : 'bg-white/10 font-semibold text-white/80'
              }`}
            >
              {entry.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="stagger space-y-4 px-4 pb-6 pt-4">
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

        <Link href="/payments/new" className="btn btn-ink btn-lg w-full text-[16px]">
          <Plus aria-hidden="true" className="h-5 w-5" strokeWidth={2.2} />
          Record payment
        </Link>

        <RentTrackerLauncher
          month={view.month}
          propertyId={view.selectedPropertyId}
          className="flex w-full items-center gap-3 rounded-[22px] bg-white p-4 text-left transition active:scale-[0.99]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-white">
            <ClipboardList aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="text-[15px] font-extrabold leading-5 text-ink">Rent tracker</span>
              <span className="rounded-full bg-hi px-2 py-0.5 text-[10.5px] font-extrabold uppercase leading-4 tracking-[0.06em] text-ink">
                New
              </span>
            </span>
            <span className="mt-0.5 block text-[12.5px] font-medium leading-4 text-muted">
              Track rent for each month and each property
            </span>
          </span>
          {view.statusCounts.total > 0 && (
            <span className="shrink-0 text-right">
              <span className="block text-[15px] font-extrabold leading-5 text-ink tabular-nums">
                {view.statusCounts.paid}/{view.statusCounts.total}
              </span>
              <span className="block text-[11px] font-semibold leading-4 text-muted">paid</span>
            </span>
          )}
          <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-muted" strokeWidth={2.2} />
        </RentTrackerLauncher>

        <section>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-extrabold text-ink">Who owes rent</h2>
              {view.owingRows.length > 0 && (
                <span className="flex min-h-6 min-w-6 items-center justify-center rounded-full bg-overdue-bg px-2 text-[12px] font-extrabold text-overdue-fg">
                  {view.owingRows.length}
                </span>
              )}
            </div>
            <Link href="/tenants" className="inline-flex items-center gap-0.5 text-[13.5px] font-bold text-brand-text">
              All
              <ChevronRight aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
            </Link>
          </div>

          <ul className="mt-3 space-y-2.5">
            {view.owingRows.map((row) => (
              <li key={row.tenantId} className="rounded-[22px] bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint text-[12.5px] font-extrabold text-forest">
                    {row.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 truncate text-[15px] font-bold text-ink">{row.name}</p>
                      <StatusPill kind={row.statusKind} detail={row.statusDetail} />
                    </div>
                    <p className="mt-0.5 truncate text-[12.5px] font-medium leading-4 text-muted">
                      {row.propertyName} &middot; {row.unitNumber} &middot; {row.dueLabel}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-end justify-between gap-3">
                  <Link href={`/payments/new?tenantId=${row.tenantId}`} className="btn btn-sm btn-mint">
                    <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
                    Record
                  </Link>
                  <ComposedBalanceCell balance={row.balance} />
                </div>
              </li>
            ))}
          </ul>

          {view.owingRows.length === 0 && (
            <div className="mt-3 rounded-[22px] bg-white px-4 py-8 text-center">
              <p className="text-[16px] font-extrabold text-brand-text">Everyone has paid</p>
              <p className="mt-1 text-[13px] font-medium text-muted">No tenant owes rent right now.</p>
            </div>
          )}

          {view.fullyPaidCount > 0 && (
            <p className="mt-3 text-center text-[13px] font-medium text-muted">
              {view.fullyPaidCount} tenant{view.fullyPaidCount === 1 ? ' is' : 's are'} fully paid for{' '}
              {view.monthName}.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
