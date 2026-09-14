import { ComposedBalanceCell } from '@/components/ui/ComposedBalance'
import Money from '@/components/ui/Money'
import SplitBar from '@/components/ui/SplitBar'
import StatusDonut from '@/components/ui/StatusDonut'
import StatusPill from '@/components/ui/StatusPill'
import MonthPicker from '@/components/ui/MonthPicker'
import type { ActivityRow, DashboardView } from '@/components/dashboard/types'
import type { SplitSegment } from '@/components/ui/SplitBar'
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Plus, ReceiptText } from 'lucide-react'
import Link from 'next/link'

function KpiCard({
  label,
  value,
  sub,
  segments,
  href,
  inverted = false
}: {
  label: string
  value: number
  sub: string
  segments: SplitSegment[]
  href: string
  inverted?: boolean
}) {
  return (
    <Link
      href={href}
      className={`group flex min-h-[104px] gap-3 rounded-[var(--r-card)] p-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 ${
        inverted
          ? 'bg-[var(--brand-deep)] text-white shadow-[var(--elev-raised)]'
          : 'surface-card hover:border-[var(--brand-200)] hover:shadow-[var(--elev-raised)]'
      }`}
    >
      <SplitBar segments={segments} className="self-stretch" />
      <span className="min-w-0 flex-1">
        <span className={`t-label block ${inverted ? 'text-emerald-100/60' : 'text-[var(--text-soft)]'}`}>
          {label}
        </span>
        <span
          className={`money mt-2 block text-[23px] leading-none ${
            inverted ? 'text-white' : 'text-[var(--text-ink)]'
          }`}
        >
          <span className={`money-prefix ${inverted ? 'text-emerald-100/55' : ''}`}>UGX&nbsp;</span>
          <Money value={value} />
        </span>
        <span
          className={`mt-2 block text-[12.5px] leading-[17px] ${inverted ? 'text-emerald-100/70' : 'text-[var(--text-muted)]'}`}
        >
          {sub}
        </span>
      </span>
    </Link>
  )
}

function ActivityItem({ row }: { row: ActivityRow }) {
  const isMoneyIn = row.kind !== 'expense'
  const Icon = row.kind === 'expense' ? ReceiptText : isMoneyIn ? ArrowDownLeft : ArrowUpRight

  return (
    <li className="flex items-start justify-between gap-3">
      <span className="flex min-w-0 items-start gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            row.kind === 'expense'
              ? 'bg-[var(--overdue-bg)] text-[var(--overdue-fg)]'
              : row.kind === 'advance'
                ? 'bg-[var(--advance-bg)] text-[var(--advance-fg)]'
                : 'bg-[var(--paid-bg)] text-[var(--brand-text)]'
          }`}
        >
          <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13.5px] font-semibold text-[var(--text-ink)]">{row.title}</span>
          <span className="mt-0.5 block truncate text-[12px] text-[var(--text-muted)]">{row.detail}</span>
        </span>
      </span>
      <span
        className={`money shrink-0 text-[13.5px] ${
          isMoneyIn ? 'text-[var(--brand-text)]' : 'text-[var(--overdue-fg)]'
        }`}
      >
        <Money value={isMoneyIn ? row.amount : -row.amount} signed />
      </span>
    </li>
  )
}

export default function DesktopDashboard({ view }: { view: DashboardView }) {
  const collectedRemainder = Math.max(view.totalExpected - view.collectedThisMonth, 0)
  const currentMonthOutstanding = Math.max(view.totalOutstanding - view.carriedForwardTotal, 0)

  return (
    <div className="hidden h-full min-h-0 flex-col gap-3 px-6 py-4 lg:flex">
      <section className="flex shrink-0 items-end justify-between gap-6">
        <div className="min-w-0">
          <h1 className="t-display text-[var(--text-ink)]">Dashboard</h1>
          <p className="t-body mt-1 text-[var(--text-muted)]">
            Welcome back, {view.greetingName}.{' '}
            {view.owingRows.length > 0
              ? `${view.owingRows.length} tenant${view.owingRows.length === 1 ? '' : 's'} owe rent for ${view.monthName}.`
              : `Every tenant is settled for ${view.monthName}.`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <MonthPicker month={view.month} />

          <Link
            href="/payments/new"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand)] px-4 text-[13.5px] font-semibold text-white shadow-[var(--shadow-brand)] transition hover:bg-[var(--brand-hover)]"
          >
            <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
            Record payment
          </Link>
        </div>
      </section>

      <section className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label={`Collected · ${view.monthName}`}
          value={view.collectedThisMonth}
          sub={`${view.collectedPercent}% of ${new Intl.NumberFormat('en-UG').format(view.totalExpected)} expected`}
          href={`/payments?month=${view.month}`}
          segments={[
            { value: view.collectedThisMonth, tone: 'current' },
            { value: collectedRemainder, tone: 'track' }
          ]}
        />
        <KpiCard
          label="Outstanding rent"
          value={view.totalOutstanding}
          sub={
            view.carriedForwardTotal > 0
              ? `${new Intl.NumberFormat('en-UG').format(view.carriedForwardTotal)} of it carried from earlier months`
              : `All of it is ${view.monthName} rent`
          }
          href={`/reports?month=${view.month}&status=outstanding#tenant-rent-report`}
          segments={[
            { value: currentMonthOutstanding, tone: 'current' },
            { value: view.carriedForwardTotal, tone: 'carried' }
          ]}
        />
        <KpiCard
          label="Expenses"
          value={view.expensesThisMonth}
          sub={
            view.largestExpenseCategory
              ? `${view.largestExpenseCategory.category} is the largest at ${new Intl.NumberFormat('en-UG').format(view.largestExpenseCategory.amount)}`
              : `Nothing recorded for ${view.monthName}`
          }
          href={`/expenses?month=${view.month}`}
          segments={[{ value: 1, tone: 'spent' }]}
        />
        <KpiCard
          label={`Net · ${view.monthName}`}
          value={view.netThisMonth}
          sub={`Collected minus expenses, ${view.monthName}`}
          href={`/reports?month=${view.month}#property-performance`}
          inverted
          segments={[{ value: 1, tone: 'net' }]}
        />
      </section>

      <section className="surface-card grid shrink-0 grid-cols-5 divide-x divide-[var(--line)] px-2 py-1">
        {view.portfolio.map((metric) => (
          <Link
            key={metric.label}
            href={metric.href}
            className="min-w-0 px-4 py-2.5 transition hover:bg-[var(--surface-sunken)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
          >
            <p className="t-label truncate text-[var(--text-soft)]">{metric.label}</p>
            <p className="money mt-1 text-[21px] leading-none text-[var(--text-ink)]">{metric.value}</p>
          </Link>
        ))}
      </section>

      <section className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="surface-card flex min-h-0 flex-col p-4">
          <div className="flex shrink-0 items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h2 className="t-section text-[var(--text-ink)]">Who owes rent</h2>
              {view.owingRows.length > 0 && (
                <span className="rounded-full bg-[var(--overdue-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--overdue-fg)]">
                  {view.owingRows.length} tenant{view.owingRows.length === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <Link
              href="/payments"
              className="t-small inline-flex items-center gap-0.5 font-semibold text-[var(--brand-text)]"
            >
              All payments
              <ChevronRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
            </Link>
          </div>

          <ul className="no-scrollbar mt-3 min-h-0 flex-1 divide-y divide-[var(--line)] overflow-y-auto">
            {view.owingRows.map((row) => (
              <li key={row.tenantId} className="flex items-center gap-3 py-2.5 first:pt-0">
                <span className="money flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--paid-bg)] text-[13px] text-[var(--brand-text)]">
                  {row.initials}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-semibold text-[var(--text-ink)]">
                    {row.name}
                  </span>
                  <span className="mt-0.5 block truncate text-[12.5px] text-[var(--text-muted)]">
                    {row.propertyName} &middot; {row.unitNumber} &middot; {row.dueLabel}
                  </span>
                </span>

                <ComposedBalanceCell balance={row.balance} className="shrink-0" />

                <span className="w-[104px] shrink-0 text-right">
                  <StatusPill kind={row.statusKind} detail={row.statusDetail} />
                </span>

                <Link
                  href={`/payments/new?tenantId=${row.tenantId}`}
                  className="inline-flex h-9 shrink-0 items-center rounded-[var(--r-control)] border border-[var(--line)] px-3 text-[13px] font-semibold text-[var(--brand-text)] transition hover:border-[var(--brand-200)] hover:bg-[var(--paid-bg)]"
                >
                  Record
                </Link>
              </li>
            ))}
          </ul>

          {view.owingRows.length === 0 && (
            <p className="t-body flex min-h-0 flex-1 items-center justify-center text-center text-[var(--text-muted)]">
              No tenant owes rent for {view.monthName}.
            </p>
          )}

          {view.fullyPaidCount > 0 && (
            <p className="t-small mt-3 shrink-0 border-t border-[var(--line)] pt-3 text-[var(--text-muted)]">
              {view.fullyPaidCount} tenant{view.fullyPaidCount === 1 ? ' is' : 's are'} fully paid for{' '}
              {view.monthName}.
            </p>
          )}
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          <div className="surface-card shrink-0 p-4">
            <h2 className="t-section text-[var(--text-ink)]">{view.monthName} collection</h2>
            <div className="mt-3">
              <StatusDonut
                total={view.statusCounts.total}
                caption={view.statusCounts.total === 1 ? 'tenant' : 'tenants'}
                segments={[
                  { label: 'Paid', count: view.statusCounts.paid, color: 'var(--brand)' },
                  { label: 'Part paid', count: view.statusCounts.partPaid, color: '#e0a021' },
                  { label: 'Due', count: view.statusCounts.due, color: '#f0b892' },
                  { label: 'Overdue', count: view.statusCounts.overdue, color: 'var(--overdue-fg)' }
                ]}
              />
            </div>
          </div>

          <div className="surface-card flex min-h-0 flex-1 flex-col p-4">
            <div className="flex shrink-0 items-center justify-between gap-3">
              <h2 className="t-section text-[var(--text-ink)]">Recent activity</h2>
              <Link
                href="/payments"
                className="t-small inline-flex items-center gap-0.5 font-semibold text-[var(--brand-text)]"
              >
                See all
                <ChevronRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            </div>

            <ul className="no-scrollbar mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto">
              {view.activity.map((row) => (
                <ActivityItem key={row.id} row={row} />
              ))}
            </ul>

            {view.activity.length === 0 && (
              <p className="t-small flex min-h-0 flex-1 items-center justify-center text-center text-[var(--text-muted)]">
                Nothing recorded in {view.monthName} yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
