import {
  ArrowLeft,
  Download,
  Edit
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import PropertySummaryCards from '@/components/PropertySummaryCards'
import { requireCurrentAppUser } from '@/lib/auth'
import { getPropertySummaryData } from '@/lib/data'
import { currency, currentPaymentMonth, formatDate, monthLabel } from '@/lib/format'

export const dynamic = 'force-dynamic'

type PropertySummaryPageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ month?: string }>
}

function statusBadge(occupied: boolean, outstandingBalance: number, amountPaid: number) {
  if (!occupied) {
    return <span className="badge badge-slate">Vacant</span>
  }

  if (outstandingBalance > 0) {
    return <span className="badge badge-amber">Outstanding</span>
  }

  if (amountPaid > 0) {
    return <span className="badge badge-green">Paid</span>
  }

  return <span className="badge badge-slate">Cleared</span>
}

export default async function PropertySummaryPage({
  params,
  searchParams
}: PropertySummaryPageProps) {
  const user = await requireCurrentAppUser()
  const [{ id }, query] = await Promise.all([params, searchParams])
  const propertyId = Number(id)
  const month = query?.month ?? currentPaymentMonth()

  if (!Number.isInteger(propertyId) || propertyId < 1) {
    notFound()
  }

  const data = await getPropertySummaryData(user.id, propertyId, month)

  if (!data) {
    notFound()
  }

  return (
    <div className="space-y-5 animate-in sm:space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <Link
            href="/properties"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.9} />
            Back to properties
          </Link>

          <p className="mt-4 text-xs font-black uppercase tracking-widest" style={{ color: '#00A550' }}>
            Property summary
          </p>

          <h1 className="mt-1 truncate text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {data.property.name}
          </h1>

          <p className="mt-1 text-sm text-slate-500">{data.property.location}</p>
        </div>

        <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
          <form method="get" className="grid gap-2 min-[390px]:grid-cols-[minmax(0,1fr)_auto]">
            <input
              name="month"
              type="month"
              defaultValue={month}
              className="field-input min-w-0"
            />

            <button
              className="min-h-11 rounded-lg px-4 text-sm font-bold text-white"
              style={{ backgroundColor: '#00A550' }}
            >
              View
            </button>
          </form>

          <a
            href={`/api/reports/property-detail?month=${month}&propertyId=${data.property.id}`}
            download
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold text-white"
            style={{ backgroundColor: '#00A550' }}
          >
            <Download className="h-4 w-4" strokeWidth={1.9} />
            Download Report
          </a>

          <Link
            href={`/properties/${data.property.id}/edit`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <Edit className="h-4 w-4" strokeWidth={1.9} />
            Edit
          </Link>
        </div>
      </section>

      <PropertySummaryCards
        propertyName={data.property.name}
        monthLabel={monthLabel(month)}
        summary={{
          totalUnits: data.summary.totalUnits,
          occupiedUnits: data.summary.occupiedUnits,
          activeTenants: data.summary.activeTenants,
          totalTenants: data.summary.totalTenants,
          monthlyRentRoll: data.summary.monthlyRentRoll,
          collectedThisMonth: data.summary.collectedThisMonth,
          outstandingRent: data.summary.outstandingRent,
          expensesThisMonth: data.summary.expensesThisMonth
        }}
        units={data.unitSummaries.map(({ unit, activeTenant }) => ({
          id: unit.id,
          unitNumber: unit.unitNumber,
          rentAmount: unit.rentAmount,
          status: unit.status,
          tenantName: activeTenant?.fullName ?? null
        }))}
        tenants={data.tenants.map(({ tenant, unit }) => ({
          id: tenant.id,
          fullName: tenant.fullName,
          phone: tenant.phone,
          email: tenant.email,
          unitNumber: unit.unitNumber,
          active: tenant.active,
          moveInDate: formatDate(tenant.moveInDate)
        }))}
        receipts={data.monthlyReceipts.map(({ payment, tenant, unit }) => ({
          id: payment.id,
          tenantName: tenant.fullName,
          unitNumber: unit.unitNumber,
          amountPaid: payment.amountPaid,
          paymentDate: formatDate(payment.paymentDate),
          paymentMethod: payment.paymentMethod
        }))}
        outstanding={data.outstandingTenants.map(({ tenant, unit, balance, periods, oldestDueDate }) => ({
          tenantId: tenant.id,
          tenantName: tenant.fullName,
          unitNumber: unit.unitNumber,
          balance,
          periods,
          oldestDueDate: formatDate(oldestDueDate)
        }))}
        expenses={data.monthlyExpenses.map(({ expense, unit }) => ({
          id: expense.id,
          title: expense.title,
          category: expense.category,
          amount: expense.amount,
          expenseDate: formatDate(expense.expenseDate),
          unitNumber: unit?.unitNumber ?? null
        }))}
      />

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm" style={{ borderColor: '#e2e8f0' }}>
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-black text-slate-950">Units, tenants, rent, and balances</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Paid amounts are receipts recorded in {monthLabel(month)}; outstanding balances include all rent due to date.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Tenant</th>
                <th>Monthly Rent</th>
                <th>Paid</th>
                <th>Outstanding</th>
                <th>Expenses</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {data.unitSummaries.map(({
                unit,
                activeTenant,
                monthlyAmountPaid,
                outstandingBalance,
                monthlyExpenses
              }) => (
                <tr key={unit.id}>
                  <td data-label="Unit" className="font-semibold text-slate-900">
                    Unit {unit.unitNumber}
                  </td>

                  <td data-label="Tenant">
                    {activeTenant ? (
                      <div>
                        <span className="block font-semibold text-slate-900">{activeTenant.fullName}</span>
                        <span className="block text-xs text-slate-500">{activeTenant.phone}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-slate-400">No active tenant</span>
                    )}
                  </td>

                  <td data-label="Monthly Rent" className="font-semibold text-slate-800">
                    {currency(unit.rentAmount)}
                  </td>

                  <td data-label="Paid" className="font-semibold text-emerald-700">
                    {currency(monthlyAmountPaid)}
                  </td>

                  <td data-label="Outstanding" className={`font-semibold ${outstandingBalance > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                    {outstandingBalance > 0 ? currency(outstandingBalance) : 'Cleared'}
                  </td>

                  <td data-label="Expenses" className="font-semibold text-rose-600">
                    {currency(monthlyExpenses)}
                  </td>

                  <td data-label="Status">
                    {statusBadge(Boolean(activeTenant), outstandingBalance, monthlyAmountPaid)}
                  </td>
                </tr>
              ))}

              {data.unitSummaries.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-slate-400">
                    No units have been added to this property yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-black text-slate-950">Recent payments</h2>
            <span className="text-xs font-bold text-slate-400">
              {currency(data.summary.totalCollected)} all time
            </span>
          </div>

          <div className="space-y-2">
            {data.recentPayments.map(({ payment, tenant, unit }) => (
              <div
                key={payment.id}
                className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">{tenant.fullName}</p>
                  <p className="truncate text-xs text-slate-500">
                    Unit {unit.unitNumber} - {formatDate(payment.paymentDate)}
                  </p>
                </div>

                <p className="shrink-0 text-right text-sm font-black text-emerald-700">
                  {currency(payment.amountPaid)}
                </p>
              </div>
            ))}

            {data.recentPayments.length === 0 && (
              <p className="rounded-lg bg-slate-50 px-3 py-5 text-center text-sm font-semibold text-slate-500">
                No payments recorded for this property yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-black text-slate-950">Recent expenses</h2>
            <span className="text-xs font-bold text-slate-400">
              {currency(data.summary.totalExpenses)} all time
            </span>
          </div>

          <div className="space-y-2">
            {data.recentExpenses.map(({ expense, unit }) => (
              <div
                key={expense.id}
                className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">{expense.title}</p>
                  <p className="truncate text-xs text-slate-500">
                    {unit ? `Unit ${unit.unitNumber}` : 'Entire property'} - {formatDate(expense.expenseDate)}
                  </p>
                </div>

                <p className="shrink-0 text-right text-sm font-black text-rose-600">
                  {currency(expense.amount)}
                </p>
              </div>
            ))}

            {data.recentExpenses.length === 0 && (
              <p className="rounded-lg bg-slate-50 px-3 py-5 text-center text-sm font-semibold text-slate-500">
                No expenses recorded for this property yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
