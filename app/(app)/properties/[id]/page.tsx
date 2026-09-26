import { Download, MapPin, Pencil, Receipt, Wallet } from 'lucide-react'
import Form from 'next/form'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import PropertySummaryCards from '@/components/PropertySummaryCards'
import PageHeader from '@/components/shell/PageHeader'
import BackLink from '@/components/ui/BackLink'
import PdfDownload from '@/components/ui/PdfDownload'
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
    <div className="stagger space-y-[22px]">
      <div>
        <BackLink href="/properties" label="Back to properties" />
      </div>

      <PageHeader
        eyebrow="Property summary"
        title={data.property.name}
        subtitle={
          <span className="inline-flex items-center gap-1.5">
            <MapPin aria-hidden="true" className="h-4 w-4" strokeWidth={1.9} />
            {data.property.location}
          </span>
        }
        actions={
          <>
            <Form action={`/properties/${data.property.id}`} className="flex items-center gap-1.5 rounded-full bg-white p-1.5 max-lg:w-full">
              <label className="min-w-0 flex-1">
                <span className="sr-only">Month</span>
                <input
                  name="month"
                  type="month"
                  defaultValue={month}
                  className="field-input !min-h-10 !py-0 lg:w-[170px]"
                />
              </label>
              <button type="submit" className="btn btn-sm btn-ink">View</button>
            </Form>
            <PdfDownload
              href={`/api/reports/property-detail?month=${month}&propertyId=${data.property.id}`}
              className="btn btn-lg btn-hi max-lg:flex-1"
            >
              <Download aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2} />
              Download Report
            </PdfDownload>
            <Link href={`/properties/${data.property.id}/edit`} className="btn btn-lg btn-outline max-lg:flex-1">
              <Pencil aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
              Edit
            </Link>
          </>
        }
        tools={{ user: false }}
      />

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
        outstanding={data.outstandingTenants.map(({
          tenant,
          unit,
          balance,
          periods,
          oldestDueDate,
          carriedForwardBalance,
          carriedForwardMonths,
          currentMonthBalance
        }) => ({
          tenantId: tenant.id,
          tenantName: tenant.fullName,
          unitNumber: unit.unitNumber,
          balance,
          periods,
          oldestDueDate: formatDate(oldestDueDate),
          carriedForwardBalance,
          carriedForwardMonths,
          currentMonthBalance
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

      <section className="rounded-[24px] bg-white p-4 sm:px-7 sm:py-6 lg:rounded-card">
        <div className="mb-4">
          <h2 className="text-[18px] font-extrabold leading-6 text-ink">Units, tenants, rent, and balances</h2>
          <p className="mt-0.5 text-[13px] font-medium text-muted">
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
                  <td data-label="Unit" className="font-extrabold text-ink">
                    Unit {unit.unitNumber}
                  </td>

                  <td data-label="Tenant">
                    {activeTenant ? (
                      <div>
                        <span className="block font-bold text-ink">{activeTenant.fullName}</span>
                        <span className="block text-[12.5px] font-medium text-muted">{activeTenant.phone}</span>
                      </div>
                    ) : (
                      <span className="font-semibold text-faint">No active tenant</span>
                    )}
                  </td>

                  <td data-label="Monthly Rent" className="font-bold tabular-nums text-ink">
                    {currency(unit.rentAmount)}
                  </td>

                  <td data-label="Paid" className="font-bold tabular-nums text-brand-text">
                    {currency(monthlyAmountPaid)}
                  </td>

                  <td data-label="Outstanding" className={`font-bold tabular-nums ${outstandingBalance > 0 ? 'text-carried-fg' : 'text-muted'}`}>
                    {outstandingBalance > 0 ? currency(outstandingBalance) : 'Cleared'}
                  </td>

                  <td data-label="Expenses" className="font-bold tabular-nums text-danger">
                    {currency(monthlyExpenses)}
                  </td>

                  <td data-label="Status">
                    {statusBadge(Boolean(activeTenant), outstandingBalance, monthlyAmountPaid)}
                  </td>
                </tr>
              ))}

              {data.unitSummaries.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[14px] font-semibold text-muted">
                    No units have been added to this property yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[24px] bg-white p-5 sm:p-6 lg:rounded-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2.5 text-[18px] font-extrabold text-ink">
              <Wallet aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
              Recent payments
            </h2>
            <span className="text-[12.5px] font-bold text-muted">
              {currency(data.summary.totalCollected)} all time
            </span>
          </div>

          <div className="space-y-2">
            {data.recentPayments.map(({ payment, tenant, unit }) => (
              <div
                key={payment.id}
                className="flex items-start justify-between gap-3 rounded-tile bg-canvas px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold text-ink">{tenant.fullName}</p>
                  <p className="truncate text-[12.5px] font-medium text-muted">
                    Unit {unit.unitNumber} - {formatDate(payment.paymentDate)}
                  </p>
                </div>

                <p className="shrink-0 text-right text-[14px] font-extrabold tabular-nums text-brand-text">
                  {currency(payment.amountPaid)}
                </p>
              </div>
            ))}

            {data.recentPayments.length === 0 && (
              <p className="rounded-tile bg-canvas px-4 py-6 text-center text-[13.5px] font-semibold text-muted">
                No payments recorded for this property yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[24px] bg-white p-5 sm:p-6 lg:rounded-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2.5 text-[18px] font-extrabold text-ink">
              <Receipt aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
              Recent expenses
            </h2>
            <span className="text-[12.5px] font-bold text-muted">
              {currency(data.summary.totalExpenses)} all time
            </span>
          </div>

          <div className="space-y-2">
            {data.recentExpenses.map(({ expense, unit }) => (
              <div
                key={expense.id}
                className="flex items-start justify-between gap-3 rounded-tile bg-canvas px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold text-ink">{expense.title}</p>
                  <p className="truncate text-[12.5px] font-medium text-muted">
                    {unit ? `Unit ${unit.unitNumber}` : 'Entire property'} - {formatDate(expense.expenseDate)}
                  </p>
                </div>

                <p className="shrink-0 text-right text-[14px] font-extrabold tabular-nums text-danger">
                  {currency(expense.amount)}
                </p>
              </div>
            ))}

            {data.recentExpenses.length === 0 && (
              <p className="rounded-tile bg-canvas px-4 py-6 text-center text-[13.5px] font-semibold text-muted">
                No expenses recorded for this property yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
