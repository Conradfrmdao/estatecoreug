import ReportScopeDownload from '@/components/ReportScopeDownload'
import PageHeader from '@/components/shell/PageHeader'
import { requireCurrentAppUser } from '@/lib/auth'
import { getDashboardData } from '@/lib/data'
import { currency, currentPaymentMonth, monthLabel } from '@/lib/format'
import {
  buildReportPeriodSnapshot,
  normalizeReportMonth,
  normalizeReportPeriod
} from '@/lib/report-period'
import { scopedReportUrl } from '@/lib/report-scope'
import { Check, ChartPie, CircleAlert, Download, Minus } from 'lucide-react'
import Form from 'next/form'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function rentStatusBadge(amountPaid: number, balance: number) {
  if (balance > 0) return { label: 'OUTSTANDING', className: 'bg-overdue-bg text-overdue-fg', Icon: CircleAlert }
  if (amountPaid > 0) return { label: 'PAID', className: 'bg-mint text-forest', Icon: Check }
  return { label: 'CLEARED', className: 'bg-line text-ink-soft', Icon: Minus }
}

function TotalCard({
  label,
  value,
  note,
  tone = 'plain'
}: {
  label: string
  value: string
  note: string
  tone?: 'plain' | 'green' | 'night' | 'night-negative'
}) {
  const night = tone === 'night' || tone === 'night-negative'

  return (
    <article
      className={`relative flex min-h-[124px] min-w-0 flex-col justify-between gap-3 overflow-hidden rounded-[24px] p-4 sm:min-h-[160px] sm:px-[22px] sm:py-5 lg:rounded-card ${
        night ? 'bg-night text-white' : 'bg-white text-ink'
      }`}
    >
      {night && (
        <svg aria-hidden="true" width="130" height="120" viewBox="0 0 130 120" className="absolute -right-2 -top-2 text-hi">
          <path d="M130 0H50c-4 20 10 30 24 36c18 8 28 26 32 44c4 16 14 28 24 32Z" fill="currentColor" opacity="0.18" />
        </svg>
      )}
      <span className={`relative text-[10.5px] font-bold uppercase leading-4 tracking-[0.08em] sm:text-[11.5px] ${night ? 'text-night-muted' : 'text-muted'}`}>
        {label}
      </span>
      <span
        className={`relative text-[19px] font-extrabold leading-tight tracking-[-0.02em] tabular-nums sm:text-[24px] 2xl:text-[30px] 2xl:leading-9 ${
          tone === 'green' ? 'text-brand-text' : tone === 'night-negative' ? 'text-danger-line' : ''
        }`}
      >
        {value}
      </span>
      <span className={`relative text-[12px] font-medium leading-4 sm:text-[12.5px] sm:leading-[17px] ${night ? 'text-night-muted' : 'text-muted'}`}>
        {note}
      </span>
    </article>
  )
}

export default async function ReportsPage({
  searchParams
}: {
  searchParams?: Promise<{ month?: string; period?: string; status?: string }>
}) {
  const user = await requireCurrentAppUser()
  const query = await searchParams
  const month = normalizeReportMonth(query?.month, currentPaymentMonth())
  const period = normalizeReportPeriod(query?.period)
  const data = await getDashboardData(user.id, month)
  const snapshot = buildReportPeriodSnapshot(data, { period, month })
  const periodLabel = period === 'all' ? 'All time' : monthLabel(month)
  const outstandingOnly = query?.status === 'outstanding'
  const visibleTenantBalances = outstandingOnly
    ? snapshot.tenantRows.filter(({ balance }) => balance > 0)
    : snapshot.tenantRows

  // Calculations for Property Performance Summary
  const propertyStats = data.properties.map((property) => {
    const pUnits = data.units.filter(({ unit }) => unit.propertyId === property.id)
    const occupiedUnits = pUnits.filter(({ unit }) => unit.status === 'occupied')
    const propertySnapshot = buildReportPeriodSnapshot(data, {
      period,
      month,
      propertyId: property.id
    })

    return {
      property,
      totalUnits: pUnits.length,
      occupiedCount: occupiedUnits.length,
      expected: propertySnapshot.summary.expected,
      collected: propertySnapshot.summary.collected,
      outstanding: propertySnapshot.summary.outstanding,
      expenses: propertySnapshot.summary.expenses,
      net: propertySnapshot.summary.net
    }
  })

  // Expense breakdown by category
  const expenseByCategory = new Map<string, number>()
  snapshot.expenses.forEach(({ expense }) => {
    expenseByCategory.set(
      expense.category,
      (expenseByCategory.get(expense.category) ?? 0) + expense.amount
    )
  })

  const expenseCategories = Array.from(expenseByCategory.entries()).map(([category, amount]) => ({
    category,
    amount
  })).sort((a, b) => b.amount - a.amount)

  /* One property needs no table of properties: its figures close the rent
     card as a single line, with its own report beside them. */
  const singleProperty = propertyStats.length === 1 ? propertyStats[0] : null
  const portfolioOccupied = propertyStats.reduce((sum, row) => sum + row.occupiedCount, 0)
  const portfolioUnits = propertyStats.reduce((sum, row) => sum + row.totalUnits, 0)
  const expectedLabel = period === 'all' ? 'Tracked Rent' : 'Expected'

  return (
    <div className="stagger space-y-5">
      <PageHeader
        title="Financial Reports"
        subtitle="Analyze rental collections, balances, expenses, and property performance."
        tools={false}
        actions={
          <Form
            action="/reports"
            className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:flex lg:w-auto lg:items-center"
          >
            {outstandingOnly && <input type="hidden" name="status" value="outstanding" />}
            <label className="flex h-[52px] min-w-0 items-center gap-2.5 rounded-full bg-white pl-[18px] pr-1.5">
              <span className="shrink-0 text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted">Period</span>
              <select
                name="period"
                defaultValue={period}
                className="field-input field-compact ml-auto w-auto min-w-0 flex-1 lg:flex-none"
              >
                <option value="month">Selected month</option>
                <option value="all">All time</option>
              </select>
            </label>
            <label className="flex h-[52px] min-w-0 items-center gap-2.5 rounded-full bg-white pl-[18px] pr-1.5">
              <span className="shrink-0 text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted">Report month</span>
              <input
                type="month"
                name="month"
                defaultValue={month}
                className="field-input field-compact ml-auto w-auto min-w-0 flex-1 lg:w-[172px] lg:flex-none"
              />
            </label>
            <button type="submit" className="btn btn-lg btn-ink px-7">
              View
            </button>
          </Form>
        }
      />

      <ReportScopeDownload
        month={month}
        period={period}
        properties={data.properties.map((property) => ({ id: property.id, name: property.name }))}
      />

      <section aria-label={`${periodLabel} totals`} className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        <TotalCard label="Rent collected" value={currency(snapshot.summary.collected)} note={periodLabel} tone="green" />
        <TotalCard
          label="Outstanding rent"
          value={currency(snapshot.summary.outstanding)}
          note={period === 'all' ? 'all rent due to date' : `due for ${periodLabel}`}
        />
        <TotalCard label="Expenses" value={currency(snapshot.summary.expenses)} note={periodLabel} />
        <TotalCard
          label="Net cash flow"
          value={currency(snapshot.summary.net)}
          note="collected minus expenses"
          tone={snapshot.summary.net >= 0 ? 'night' : 'night-negative'}
        />
      </section>

      <section aria-label="Rent status and expenses" className="grid gap-5 xl:grid-cols-3">
        <article
          id="tenant-rent-report"
          className="flex min-w-0 scroll-mt-4 flex-col gap-4 rounded-[24px] bg-white p-4 sm:px-7 sm:py-6 lg:rounded-card xl:col-span-2"
        >
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
            <h2 className="text-[18px] font-extrabold leading-6 text-ink">
              {outstandingOnly ? 'Outstanding Rent' : `Rent Status, ${periodLabel}`}
            </h2>
            <span className="pill bg-mint text-forest">
              {snapshot.summary.paidTenants} paid, {snapshot.summary.outstandingTenants} outstanding
            </span>
            {outstandingOnly && (
              <Link
                href={`/reports?month=${month}&period=${period}#tenant-rent-report`}
                className="btn btn-xs btn-soft ml-auto"
              >
                Show every tenant
              </Link>
            )}
          </div>

          {visibleTenantBalances.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Property / unit</th>
                    <th>Expected</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th className="text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTenantBalances.map(({ tenant, unit, property, expected, amountPaid, balance }) => {
                    const status = rentStatusBadge(amountPaid, balance)
                    return (
                      <tr key={tenant.id}>
                        <td data-label="Tenant" className="font-bold text-ink">
                          {tenant.fullName}
                        </td>
                        <td data-label="Property / unit">
                          <span className="block text-[13.5px] font-semibold text-ink">Unit {unit.unitNumber}</span>
                          <span className="block text-[11.5px] font-semibold tracking-[0.04em] text-muted">{property.name}</span>
                        </td>
                        <td data-label="Expected" className="font-semibold tabular-nums text-ink">
                          {currency(expected)}
                        </td>
                        <td data-label="Paid" className="font-extrabold tabular-nums text-brand-text">
                          {currency(amountPaid)}
                        </td>
                        <td
                          data-label="Balance"
                          className={balance > 0 ? 'font-bold tabular-nums text-carried-fg' : 'font-medium text-muted'}
                        >
                          {balance > 0 ? currency(balance) : 'Cleared'}
                        </td>
                        <td data-label="Status" className="text-right">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11.5px] font-extrabold tracking-[0.04em] ${status.className}`}>
                            <status.Icon aria-hidden="true" className="h-[13px] w-[13px]" strokeWidth={3} />
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="fade-in flex flex-col items-center gap-3 rounded-panel bg-canvas px-5 py-10 text-center">
              <p className="text-[14px] font-semibold leading-5 text-ink-soft">
                {data.properties.length === 0
                  ? 'No properties found in your portfolio.'
                  : outstandingOnly
                    ? `No outstanding rent for ${periodLabel}.`
                    : `No tenant rent records for ${periodLabel}.`}
              </p>
              {data.properties.length === 0 && (
                <Link href="/properties/new" className="btn btn-sm btn-ink">
                  Add a property
                </Link>
              )}
            </div>
          )}

          {propertyStats.length > 0 && (
            <div
              id={singleProperty ? 'property-performance' : undefined}
              className="mt-auto flex scroll-mt-4 flex-col gap-2.5 rounded-panel bg-canvas px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-4"
            >
              <span className="flex min-w-0 flex-col">
                <span className="text-[11px] font-bold uppercase leading-[15px] tracking-[0.06em] text-muted">
                  {singleProperty ? 'Property performance' : 'Portfolio performance'}
                </span>
                <span className="truncate text-[13px] font-semibold leading-[18px] text-ink-soft">
                  {singleProperty
                    ? `${singleProperty.property.name}, ${singleProperty.property.location}`
                    : `${propertyStats.length} properties`}
                </span>
              </span>
              <span className="flex shrink-0 flex-wrap items-center gap-x-[18px] gap-y-1 whitespace-nowrap text-[13px] font-bold tabular-nums text-ink">
                <span>
                  Occupancy {singleProperty ? singleProperty.occupiedCount : portfolioOccupied}/
                  {singleProperty ? singleProperty.totalUnits : portfolioUnits}
                </span>
                <span>Collected {currency(singleProperty ? singleProperty.collected : snapshot.summary.collected)}</span>
                <span>Net {currency(singleProperty ? singleProperty.net : snapshot.summary.net)}</span>
                {singleProperty && (
                  <a
                    href={scopedReportUrl('property-detail', month, singleProperty.property.id, period)}
                    download
                    aria-label={`Download the ${singleProperty.property.name} report`}
                    title="Download property report"
                    className="btn btn-mint btn-icon btn-sm"
                  >
                    <Download aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
                  </a>
                )}
              </span>
            </div>
          )}
        </article>

        <article
          id="expense-breakdown"
          className="flex min-w-0 scroll-mt-4 flex-col gap-4 rounded-[24px] bg-mint p-5 sm:p-6 lg:rounded-card"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[18px] font-extrabold leading-6 text-ink">Expense Breakdown</h2>
            {snapshot.summary.expenses > 0 && (
              <span className="text-[13px] font-bold tabular-nums text-forest">{currency(snapshot.summary.expenses)}</span>
            )}
          </div>

          {expenseCategories.length > 0 ? (
            <ul className="flex flex-1 flex-col gap-4 rounded-panel bg-white/65 p-5">
              {expenseCategories.map(({ category, amount }) => {
                const percentage = snapshot.summary.expenses > 0
                  ? (amount / snapshot.summary.expenses) * 100
                  : 0
                return (
                  <li key={category} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-3 text-[12.5px] font-bold text-ink">
                      <span className="min-w-0 truncate uppercase tracking-[0.04em]">{category}</span>
                      <span className="shrink-0 text-right tabular-nums">
                        {currency(amount)} <span className="font-semibold text-forest-ink">({percentage.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white">
                      <div className="bar-grow h-full rounded-full bg-forest" style={{ width: `${percentage}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-panel bg-white/65 p-6 text-center">
              <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-forest">
                <ChartPie className="h-[26px] w-[26px]" strokeWidth={1.8} />
              </span>
              <p className="text-[14px] font-semibold leading-5 text-forest-ink">
                No expense records for {periodLabel.toLowerCase()}.
              </p>
            </div>
          )}
        </article>
      </section>

      {propertyStats.length > 1 && (
        <section
          id="property-performance"
          aria-labelledby="property-performance-title"
          className="scroll-mt-4 rounded-[24px] bg-white p-4 sm:px-7 sm:py-6 lg:rounded-card"
        >
          <h2 id="property-performance-title" className="pb-3 text-[18px] font-extrabold leading-6 text-ink">
            Property Performance Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Location</th>
                  <th>Occupancy</th>
                  <th>{expectedLabel}</th>
                  <th>Collected</th>
                  <th>Outstanding</th>
                  <th>Expenses</th>
                  <th>Net Cash Flow</th>
                  <th className="text-right">Property Report</th>
                </tr>
              </thead>
              <tbody>
                {propertyStats.map(({ property, totalUnits, occupiedCount, expected, collected, outstanding, expenses, net }) => (
                  <tr key={property.id}>
                    <td data-label="Property" className="font-bold text-ink">
                      {property.name}
                    </td>
                    <td data-label="Location" className="font-medium text-muted">
                      {property.location}
                    </td>
                    <td data-label="Occupancy">
                      <span className="pill bg-mint text-forest">{occupiedCount} / {totalUnits} Occupied</span>
                    </td>
                    <td data-label={expectedLabel} className="font-semibold tabular-nums text-ink">
                      {currency(expected)}
                    </td>
                    <td data-label="Collected" className="font-bold tabular-nums text-brand-text">
                      {currency(collected)}
                    </td>
                    <td data-label="Outstanding" className="font-bold tabular-nums text-carried-fg">
                      {currency(outstanding)}
                    </td>
                    <td data-label="Expenses" className="font-bold tabular-nums text-danger">
                      {currency(expenses)}
                    </td>
                    <td
                      data-label="Net Cash Flow"
                      className={`font-extrabold tabular-nums ${net >= 0 ? 'text-brand-text' : 'text-danger'}`}
                    >
                      {currency(net)}
                    </td>
                    <td data-label="Property Report">
                      <div className="flex justify-end">
                        <a
                          href={scopedReportUrl('property-detail', month, property.id, period)}
                          download
                          className="btn btn-xs btn-mint"
                        >
                          <Download aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
                          Download
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
