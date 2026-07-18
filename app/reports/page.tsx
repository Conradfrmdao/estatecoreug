import { requireCurrentAppUser } from '@/lib/auth'
import { getDashboardData } from '@/lib/data'
import { currency, currentPaymentMonth, dateKey, formatDate, monthLabel } from '@/lib/format'
import ReportScopeDownload from '@/components/ReportScopeDownload'
import { Download } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function rentStatusBadge(amountPaid: number, balance: number) {
  if (balance > 0) return { label: 'OUTSTANDING', className: 'bg-red-100 text-red-700' }
  if (amountPaid > 0) return { label: 'PAID', className: 'badge-green' }
  return { label: 'CLEARED', className: 'bg-slate-100 text-slate-600' }
}

export default async function ReportsPage({
  searchParams
}: {
  searchParams?: { month?: string; status?: string }
}) {
  const user = await requireCurrentAppUser()
  const month = searchParams?.month ?? currentPaymentMonth()
  const data = await getDashboardData(user.id, month)
  const outstandingOnly = searchParams?.status === 'outstanding'
  const visibleTenantBalances = outstandingOnly
    ? data.tenantBalances.filter(({ balance }) => balance > 0)
    : data.tenantBalances

  // Calculations for Property Performance Summary
  const propertyStats = data.properties.map((property) => {
    // Units in this property
    const pUnits = data.units.filter(({ unit }) => unit.propertyId === property.id)
    const occupiedUnits = pUnits.filter(({ unit }) => unit.status === 'occupied')

    // Expected rent from active tenants in occupied units
    const expected = pUnits.reduce((acc, { unit }) => {
      // Find active tenant for this unit
      const unitTenant = data.tenantBalances.find(({ tenant }) => tenant.unitId === unit.id)
      return acc + (unitTenant ? unit.rentAmount : 0)
    }, 0)

    // Collected rent for this property in the selected month
    const collected = data.monthlyPayments.reduce((acc, { allocatedAmount, unit }) => {
      if (unit.propertyId === property.id) {
        return acc + allocatedAmount
      }
      return acc
    }, 0)

    // Expenses for this property in the selected month
    const expenses = data.expenses.reduce((acc, { expense }) => {
      // Parse expense month
      const expMonth = dateKey(expense.expenseDate).slice(0, 7)
      if (expMonth === month && expense.propertyId === property.id) {
        return acc + expense.amount
      }
      return acc
    }, 0)

    return {
      property,
      totalUnits: pUnits.length,
      occupiedCount: occupiedUnits.length,
      expected,
      collected,
      expenses,
      net: collected - expenses
    }
  })

  // Expense breakdown by category
  const expenseByCategory = new Map<string, number>()
  data.expenses.forEach(({ expense }) => {
    const expMonth = dateKey(expense.expenseDate).slice(0, 7)
    if (expMonth === month) {
      expenseByCategory.set(
        expense.category,
        (expenseByCategory.get(expense.category) ?? 0) + expense.amount
      )
    }
  })

  const expenseCategories = Array.from(expenseByCategory.entries()).map(([category, amount]) => ({
    category,
    amount
  })).sort((a, b) => b.amount - a.amount)

  return (
    <div className="space-y-6 sm:space-y-8 animate-in">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: '#1a1a2e' }}>Financial Reports</h1>
          <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>
            Analyze rental collections, balances, expenses, and property performance.
          </p>
        </div>

        {/* Month Selector Form */}
        <form method="get" className="grid w-full gap-2 sm:w-auto sm:grid-cols-[auto_auto_auto] sm:items-center">
          {outstandingOnly && <input type="hidden" name="status" value="outstanding" />}
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Report Month:</label>
          <input
            type="month"
            name="month"
            defaultValue={month}
            className="field-input px-3 py-1.5 sm:max-w-[180px]"
          />
          <button
            type="submit"
            className="min-h-11 rounded-lg px-3 py-1.5 text-xs font-semibold text-white sm:min-h-0"
            style={{ backgroundColor: '#00A550' }}
          >
            View
          </button>
        </form>
      </section>

      <ReportScopeDownload
        month={month}
        properties={data.properties.map((property) => ({ id: property.id, name: property.name }))}
      />

      {/* Financial Summary Cards */}
      <section className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-3 space-y-1.5 sm:p-5 sm:space-y-2" style={{ borderColor: '#e2e8f0' }}>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block sm:text-xs">Income Collected</span>
          <span className="text-base font-bold block leading-tight sm:text-2xl" style={{ color: '#00A550' }}>
            {currency(data.summary.collectedThisMonth)}
          </span>
          <span className="text-xs text-slate-500 block">for {monthLabel(month)}</span>
        </div>

        <div className="rounded-xl border bg-white p-3 space-y-1.5 sm:p-5 sm:space-y-2" style={{ borderColor: '#e2e8f0' }}>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block sm:text-xs">Outstanding Rent</span>
          <span className="text-base font-bold block leading-tight text-amber-600 sm:text-2xl">
            {currency(data.summary.totalOutstanding)}
          </span>
          <span className="text-xs text-slate-500 block">unpaid balances</span>
        </div>

        <div className="rounded-xl border bg-white p-3 space-y-1.5 sm:p-5 sm:space-y-2" style={{ borderColor: '#e2e8f0' }}>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block sm:text-xs">Monthly Expenses</span>
          <span className="text-base font-bold block leading-tight text-rose-600 sm:text-2xl">
            {currency(data.summary.expensesThisMonth)}
          </span>
          <span className="text-xs text-slate-500 block">maintenance & operations</span>
        </div>

        <div className="rounded-xl border bg-white p-3 space-y-1.5 sm:p-5 sm:space-y-2" style={{ borderColor: '#e2e8f0' }}>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block sm:text-xs">Net Operating Income</span>
          <span className="text-base font-bold block leading-tight sm:text-2xl" style={{ color: data.summary.netThisMonth >= 0 ? '#00A550' : '#e11d48' }}>
            {currency(data.summary.netThisMonth)}
          </span>
          <span className="text-xs text-slate-500 block">collected - expenses</span>
        </div>
      </section>

      {/* Tabular Reports */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Tenant Rent Report (Main Table) */}
        <div id="tenant-rent-report" className="scroll-mt-4 lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">{outstandingOnly ? 'Outstanding Rent' : 'Rent Status (Monthly Breakdown)'}</h2>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded mt-1 inline-block">
                {data.summary.paidTenants} / {data.summary.activeTenants} Active Occupied Paid
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border bg-white"
            style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Property / Unit</th>
                    <th>Expected</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTenantBalances.map(({ tenant, unit, property, amountPaid, balance }) => (
                    <tr key={tenant.id}>
                      <td data-label="Tenant" className="font-semibold text-slate-800 text-sm">
                        {tenant.fullName}
                      </td>
                      <td data-label="Property / Unit">
                        <span className="block text-xs font-medium text-slate-700">Unit {unit.unitNumber}</span>
                        <span className="block text-[10px] text-slate-400">{property.name}</span>
                      </td>
                      <td data-label="Expected" className="text-xs text-slate-600">
                        {currency(unit.rentAmount)}
                      </td>
                      <td data-label="Paid" className="text-xs font-semibold" style={{ color: '#00A550' }}>
                        {currency(amountPaid)}
                      </td>
                      <td data-label="Balance" className="text-xs font-semibold" style={{ color: balance > 0 ? '#b45309' : '#64748b' }}>
                        {balance > 0 ? currency(balance) : 'Cleared'}
                      </td>
                      <td data-label="Status">
                        <span className={`badge ${rentStatusBadge(amountPaid, balance).className}`}>
                          {rentStatusBadge(amountPaid, balance).label}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {visibleTenantBalances.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-sm text-slate-400">
                        {outstandingOnly ? 'No outstanding rent for this month.' : 'No active occupied units found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Expenses Category Breakdowns */}
        <div id="expense-breakdown" className="scroll-mt-4 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Expense Breakdown</h2>
          <div className="rounded-xl border bg-white p-5 space-y-4" style={{ borderColor: '#e2e8f0' }}>
            {expenseCategories.map(({ category, amount }) => {
              const percentage = data.summary.expensesThisMonth > 0 
                ? (amount / data.summary.expensesThisMonth) * 100 
                : 0
              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-700">
                    <span className="min-w-0 truncate uppercase">{category}</span>
                    <span className="shrink-0 text-right">{currency(amount)} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-rose-500" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
            {expenseCategories.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No expense records for this month.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Property Performance Summary Table */}
      <section id="property-performance" className="scroll-mt-4 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Property Performance Summary</h2>
        <div className="overflow-hidden rounded-xl border bg-white"
          style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Location</th>
                  <th>Occupancy</th>
                  <th>Monthly Expected</th>
                  <th>Monthly Collected</th>
                  <th>Monthly Expenses</th>
                  <th>Net Cash Flow</th>
                  <th>Property Report</th>
                </tr>
              </thead>
              <tbody>
                {propertyStats.map(({ property, totalUnits, occupiedCount, expected, collected, expenses, net }) => (
                  <tr key={property.id}>
                    <td data-label="Property" className="font-semibold text-slate-800 text-sm">
                      {property.name}
                    </td>
                    <td data-label="Location" className="text-xs text-slate-500">
                      {property.location}
                    </td>
                    <td data-label="Occupancy">
                      <span className="badge badge-green">{occupiedCount} / {totalUnits} Occupied</span>
                    </td>
                    <td data-label="Monthly Expected" className="text-xs text-slate-600">
                      {currency(expected)}
                    </td>
                    <td data-label="Monthly Collected" className="text-xs font-semibold" style={{ color: '#00A550' }}>
                      {currency(collected)}
                    </td>
                    <td data-label="Monthly Expenses" className="text-xs font-semibold text-rose-600">
                      {currency(expenses)}
                    </td>
                    <td data-label="Net Cash Flow" className="text-xs font-bold" style={{ color: net >= 0 ? '#00A550' : '#e11d48' }}>
                      {currency(net)}
                    </td>
                    <td data-label="Property Report">
                      <a
                        href={`/api/reports/property-detail?month=${month}&propertyId=${property.id}`}
                        download
                        className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <Download className="h-3.5 w-3.5" strokeWidth={2} />
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
                {propertyStats.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-sm text-slate-400">
                      No properties found in your portfolio.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
