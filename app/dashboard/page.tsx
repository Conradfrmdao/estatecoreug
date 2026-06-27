import Link from 'next/link'
import { requireCurrentAppUser } from '@/lib/auth'
import { getDashboardData } from '@/lib/data'
import { currency, currentPaymentMonth, formatDate, monthLabel } from '@/lib/format'

export const dynamic = 'force-dynamic'

function StatCard({
  label,
  value,
  sub,
  color = 'default'
}: {
  label: string
  value: string | number
  sub?: string
  color?: 'default' | 'green' | 'amber' | 'red' | 'dark'
}) {
  const styles = {
    default: { bg: '#fff', text: '#1a1a2e', badge: '#f1f5f9', badgeText: '#64748b' },
    green: { bg: '#e6f7ef', text: '#007038', badge: '#c8edd9', badgeText: '#005a2b' },
    amber: { bg: '#fffbeb', text: '#92400e', badge: '#fef3c7', badgeText: '#78350f' },
    red: { bg: '#fef2f2', text: '#991b1b', badge: '#fee2e2', badgeText: '#7f1d1d' },
    dark: { bg: '#1a1a2e', text: '#fff', badge: '#2d2d45', badgeText: '#94a3b8' }
  }[color]

  return (
    <div
      className="rounded-xl p-5 border transition-all duration-200 hover:-translate-y-0.5"
      style={{
        backgroundColor: styles.bg,
        borderColor: color === 'dark' ? 'transparent' : '#e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: color === 'dark' ? '#94a3b8' : '#64748b' }}>
        {label}
      </p>
      <p className="text-2xl sm:text-3xl font-bold" style={{ color: styles.text }}>{value}</p>
      {sub && <p className="mt-1.5 text-xs font-medium" style={{ color: color === 'dark' ? '#64748b' : '#94a3b8' }}>{sub}</p>}
    </div>
  )
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: { month?: string }
}) {
  const user = await requireCurrentAppUser()
  const month = searchParams?.month || currentPaymentMonth()
  const data = await getDashboardData(user.id, month)
  const maxFlow = Math.max(data.summary.collectedThisMonth, data.summary.expensesThisMonth, 1)
  const paymentPct = data.summary.activeTenants
    ? Math.round((data.summary.paidTenants / data.summary.activeTenants) * 100)
    : 0

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#00A550' }}>
            {monthLabel(month)}
          </p>
          <h1 className="text-3xl font-bold" style={{ color: '#1a1a2e' }}>Dashboard</h1>
          <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>
            Rent collection, tenant balances, and property expenses
          </p>
        </div>
        <form className="flex gap-2" method="get">
          <input
            name="month"
            type="month"
            defaultValue={month}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: '#e2e8f0', color: '#1a1a2e' }}
          />
          <button
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition"
            style={{ backgroundColor: '#00A550' }}
          >
            View
          </button>
        </form>
      </section>

      {/* Primary Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Collected this month" value={currency(data.summary.collectedThisMonth)} color="green"
          sub={`of ${currency(data.summary.totalExpected)} expected`} />
        <StatCard label="Outstanding rent" value={currency(data.summary.totalOutstanding)} color="amber"
          sub={`${data.summary.unpaidTenants} tenants unpaid`} />
        <StatCard label="Monthly expenses" value={currency(data.summary.expensesThisMonth)} />
        <StatCard label="Monthly net profit" value={currency(data.summary.netThisMonth)} color="dark" />
      </section>

      {/* Portfolio Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Properties" value={data.summary.totalProperties} />
        <StatCard label="Total units" value={data.summary.totalUnits} />
        <StatCard label="Occupied" value={data.summary.occupiedUnits} color="green" />
        <StatCard label="Vacant" value={data.summary.vacantUnits} color="amber" />
      </section>

      {/* Charts Row */}
      <section className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        {/* Payment Status */}
        <div className="rounded-xl border bg-white p-6"
          style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-bold" style={{ color: '#1a1a2e' }}>Payment Status</h2>
              <p className="mt-0.5 text-xs" style={{ color: '#64748b' }}>
                {data.summary.paidTenants} paid · {data.summary.unpaidTenants} unpaid or partial
              </p>
            </div>
            <Link href="/tenants" className="text-xs font-semibold transition"
              style={{ color: '#00A550' }}>
              View tenants →
            </Link>
          </div>

          {/* Donut-style meter */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#00A550" strokeWidth="3"
                  strokeDasharray={`${paymentPct} ${100 - paymentPct}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold" style={{ color: '#1a1a2e' }}>{paymentPct}%</span>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: '#00A550' }} />
                  <span style={{ color: '#374151' }}>Paid</span>
                </div>
                <span className="font-semibold" style={{ color: '#1a1a2e' }}>{data.summary.paidTenants}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: '#f59e0b' }} />
                  <span style={{ color: '#374151' }}>Unpaid / Partial</span>
                </div>
                <span className="font-semibold" style={{ color: '#1a1a2e' }}>{data.summary.unpaidTenants}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/payments/new"
              className="rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white transition"
              style={{ backgroundColor: '#00A550' }}
            >
              Record Payment
            </Link>
            <Link
              href="/expenses/new"
              className="rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition"
              style={{ border: '1.5px solid #e2e8f0', color: '#374151' }}
            >
              Add Expense
            </Link>
          </div>
        </div>

        {/* Income vs Expense */}
        <div className="rounded-xl border bg-white p-6"
          style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 className="text-base font-bold mb-1" style={{ color: '#1a1a2e' }}>Income vs Expenses</h2>
          <p className="text-xs mb-6" style={{ color: '#64748b' }}>Monthly operating cashflow</p>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium" style={{ color: '#374151' }}>Rent collected</span>
                <span className="font-semibold" style={{ color: '#00A550' }}>{currency(data.summary.collectedThisMonth)}</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#f1f5f9' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(data.summary.collectedThisMonth / maxFlow) * 100}%`, backgroundColor: '#00A550' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium" style={{ color: '#374151' }}>Expenses</span>
                <span className="font-semibold" style={{ color: '#ef4444' }}>{currency(data.summary.expensesThisMonth)}</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#f1f5f9' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(data.summary.expensesThisMonth / maxFlow) * 100}%`, backgroundColor: '#ef4444' }} />
              </div>
            </div>

            <div className="pt-3 border-t" style={{ borderColor: '#f1f5f9' }}>
              <div className="flex justify-between">
                <span className="text-sm font-semibold" style={{ color: '#374151' }}>Net profit</span>
                <span className="text-sm font-bold" style={{
                  color: data.summary.netThisMonth >= 0 ? '#00A550' : '#ef4444'
                }}>
                  {currency(data.summary.netThisMonth)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tables Row */}
      <section className="grid gap-6 xl:grid-cols-2">
        {/* Unpaid Tenants */}
        <div className="rounded-xl border bg-white overflow-hidden"
          style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between gap-3 p-5 border-b"
            style={{ borderColor: '#f1f5f9' }}>
            <h2 className="font-bold text-base" style={{ color: '#1a1a2e' }}>Unpaid Tenants</h2>
            <Link href={`/tenants?month=${month}&status=unpaid`}
              className="text-xs font-semibold" style={{ color: '#00A550' }}>
              View all →
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: '#f8fafc' }}>
            {data.tenantBalances.filter((row) => row.paymentStatus !== 'paid').slice(0, 5).map((row) => (
              <div key={row.tenant.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: '#1a1a2e' }}>{row.tenant.fullName}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#94a3b8' }}>
                    {row.property.name} · Unit {row.unit.unitNumber}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm" style={{ color: '#f59e0b' }}>{currency(row.balance)}</p>
                  <span className="badge badge-amber mt-1">{row.paymentStatus}</span>
                </div>
              </div>
            ))}
            {data.tenantBalances.every((row) => row.paymentStatus === 'paid') && (
              <div className="px-5 py-8 text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: '#e6f7ef' }}>
                  <svg className="w-5 h-5" fill="none" stroke="#00A550" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-medium" style={{ color: '#00A550' }}>All tenants paid!</p>
                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Great work this month.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="rounded-xl border bg-white overflow-hidden"
          style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between gap-3 p-5 border-b"
            style={{ borderColor: '#f1f5f9' }}>
            <h2 className="font-bold text-base" style={{ color: '#1a1a2e' }}>Recent Payments</h2>
            <Link href="/payments" className="text-xs font-semibold" style={{ color: '#00A550' }}>
              View all →
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: '#f8fafc' }}>
            {data.recentPayments.map(({ payment, tenant, unit }) => (
              <div key={payment.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: '#1a1a2e' }}>{tenant.fullName}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                    Unit {unit.unitNumber} · {formatDate(payment.paymentDate)}
                  </p>
                </div>
                <p className="font-bold text-sm flex-shrink-0" style={{ color: '#00A550' }}>
                  {currency(payment.amountPaid)}
                </p>
              </div>
            ))}
            {data.recentPayments.length === 0 && (
              <p className="px-5 py-8 text-center text-sm" style={{ color: '#94a3b8' }}>
                No payments recorded yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
