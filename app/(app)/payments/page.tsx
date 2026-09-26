import DeleteButton from '@/components/DeleteButton'
import PaymentFilters from '@/components/PaymentFilters'
import PropertyCard from '@/components/PropertyCard'
import PropertyRecordsModal from '@/components/PropertyRecordsModal'
import TenantRentDemandList from '@/components/TenantRentDemandList'
import PageHeader from '@/components/shell/PageHeader'
import Avatar, { initialsOf, toneFor } from '@/components/ui/Avatar'
import EmptyState from '@/components/ui/EmptyState'
import PdfDownload from '@/components/ui/PdfDownload'
import { requireCurrentAppUser } from '@/lib/auth'
import { listPaymentsForUser, listPropertiesForUser, listTenantPaymentTargets } from '@/lib/data'
import { currency, dateKey, formatDate, monthLabel, monthShortLabel } from '@/lib/format'
import { normalizePaymentFilters, paymentMatchesSearch, paymentReceivedInPeriod } from '@/lib/payment-filters'
import { paymentAllocationBillingMonth, paymentAllocations, paymentBillingPeriods } from '@/lib/rent-cycle'
import { Banknote, Download, Plus, Rows3, Wallet } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type PaymentsPageParams = {
  q?: string
  propertyId?: string
  period?: string
  date?: string
  month?: string
  year?: string
}

export default async function PaymentsPage({
  searchParams
}: {
  searchParams?: Promise<PaymentsPageParams>
}) {
  const user = await requireCurrentAppUser()
  const params = await searchParams
  const q = (params?.q ?? '').trim().toLowerCase()
  const [properties, paymentRows, tenantTargets] = await Promise.all([
    listPropertiesForUser(user.id),
    listPaymentsForUser(user.id),
    listTenantPaymentTargets(user.id)
  ])
  const today = dateKey()
  const requestedPropertyId = Number(params?.propertyId)
  const propertyId = properties.some((property) => property.id === requestedPropertyId)
    ? requestedPropertyId
    : null
  const {
    period,
    day: dayFilter,
    month: monthFilter,
    year: yearFilter
  } = normalizePaymentFilters({
    period: params?.period,
    date: params?.date,
    month: params?.month,
    year: params?.year,
    fallbackPeriod: 'month'
  }, today)
  const availableYears = Array.from(new Set([
    today.slice(0, 4),
    ...paymentRows.map(({ payment }) => dateKey(payment.paymentDate).slice(0, 4))
  ])).sort((a, b) => b.localeCompare(a))

  const periodRows = paymentRows.filter(({ payment, property }) => {
    if (propertyId && property.id !== propertyId) return false

    return paymentReceivedInPeriod(payment.paymentDate, period, {
      day: dayFilter,
      month: monthFilter,
      year: yearFilter
    })
  })

  const filteredRows = periodRows.filter((row) => paymentMatchesSearch(row, q))

  const propertyCards = properties
    .filter((property) => !propertyId || property.id === propertyId)
    .map((property) => {
      const allPayments = periodRows.filter(({ property: rowProperty }) => rowProperty.id === property.id)
      const payments = filteredRows.filter(({ property: rowProperty }) => rowProperty.id === property.id)
      const propertyMatches = q
        ? [property.name, property.location].some((value) => value.toLowerCase().includes(q))
        : true

      const demandRows = tenantTargets
        .filter((row) =>
          row.property.id === property.id && row.tenant.active && row.totalOutstandingBalance > 0
        )
        .sort((a, b) => b.carriedForwardBalance - a.carriedForwardBalance)
        .map((row) => ({
          tenantId: row.tenant.id,
          tenantName: row.tenant.fullName,
          unitNumber: row.unit.unitNumber,
          rentAmount: row.unit.rentAmount,
          nextPaymentDate: row.nextPaymentDate.toISOString(),
          totalOutstandingBalance: row.totalOutstandingBalance,
          carriedForwardBalance: row.carriedForwardBalance,
          carriedForwardMonths: row.carriedForwardMonths,
          currentMonthBalance: row.currentMonthBalance
        }))

      return {
        property,
        allPayments,
        payments,
        propertyMatches,
        demandRows,
        totalPaid: allPayments.reduce((total, { payment }) => total + payment.amountPaid, 0),
        matchingPaid: payments.reduce((total, { payment }) => total + payment.amountPaid, 0)
      }
    })
    .filter(({ payments, propertyMatches }) => !q || propertyMatches || payments.length > 0)
  const filteredTotal = filteredRows.reduce((total, { payment }) => total + payment.amountPaid, 0)
  const periodLabel = period === 'day'
    ? formatDate(`${dayFilter}T00:00:00.000Z`)
    : period === 'month'
      ? monthLabel(monthFilter)
      : period === 'year' ? yearFilter : 'All recorded dates'

  /* Everything active tenants still owe, within the property filter - the
     other side of what the page has collected. */
  const stillOwed = tenantTargets
    .filter((row) => row.tenant.active && row.totalOutstandingBalance > 0 && (!propertyId || row.property.id === propertyId))
    .reduce((total, row) => total + row.totalOutstandingBalance, 0)

  return (
    <div className="stagger space-y-[22px]">
      <PageHeader
        title="Rent Payments"
        subtitle={`Showing ${periodLabel}. Use the period filter to widen the range.`}
        actions={
          <Link href="/payments/new" className="btn btn-lg btn-ink max-lg:flex-1">
            <Plus aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
            Record Payment
          </Link>
        }
        tools={{ user: 'full' }}
      />

      <PaymentFilters
        properties={properties.map((property) => ({ id: property.id, name: property.name }))}
        availableYears={availableYears}
        initialQuery={params?.q ?? ''}
        initialPropertyId={propertyId ? String(propertyId) : ''}
        initialPeriod={period}
        initialDate={dayFilter}
        initialMonth={monthFilter}
        initialYear={yearFilter}
      />

      <section
        aria-label="Payment totals"
        className="flex flex-col gap-5 rounded-[24px] bg-white p-5 sm:flex-row sm:items-stretch sm:gap-7 sm:px-7 sm:py-[26px] lg:rounded-card"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="flex items-center gap-2 text-[12px] font-bold uppercase leading-4 tracking-[0.08em] text-muted">
            <Rows3 aria-hidden="true" className="h-4 w-4" strokeWidth={1.9} />
            Payments found
          </span>
          <span className="text-[34px] font-extrabold leading-[40px] tracking-[-0.03em] tabular-nums text-ink sm:text-[40px] sm:leading-[46px]">
            {filteredRows.length}
          </span>
          <span className="truncate text-[13px] font-medium leading-[18px] text-muted">{periodLabel}</span>
        </div>
        <span aria-hidden="true" className="hidden w-px bg-line sm:block" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="flex items-center gap-2 text-[12px] font-bold uppercase leading-4 tracking-[0.08em] text-brand-text">
            <Banknote aria-hidden="true" className="h-4 w-4" strokeWidth={1.9} />
            {period === 'all' ? 'All-time total' : 'Collected'}
          </span>
          <span className="break-words text-[28px] font-extrabold leading-[34px] tracking-[-0.03em] tabular-nums text-ink sm:text-[40px] sm:leading-[46px]">
            {currency(filteredTotal)}
          </span>
          <span className="truncate text-[13px] font-medium leading-[18px] text-muted">{periodLabel}</span>
        </div>
        <span
          className={`self-start whitespace-nowrap rounded-full px-[18px] py-2.5 text-[13px] font-bold sm:self-center ${
            stillOwed > 0 ? 'bg-carried-bg text-carried-fg' : 'bg-hi text-ink'
          }`}
        >
          {stillOwed > 0 ? `${currency(stillOwed)} still owed` : 'No rent owed'}
        </span>
      </section>

      <section aria-label="Properties" className="space-y-4">
        <h2 className="text-[18px] font-extrabold leading-6 text-ink">Properties</h2>
        {propertyCards.length === 0 && (
          <div className="rounded-[24px] bg-white lg:rounded-card">
            <EmptyState
              icon={Wallet}
              title={properties.length === 0 ? 'No properties yet' : 'No properties match'}
              body={properties.length === 0 ? 'Add a property, its units and tenants to start recording rent.' : 'No properties match this search.'}
            />
          </div>
        )}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {propertyCards.map(({ property, allPayments, payments: propertyPayments, demandRows, totalPaid, matchingPaid }) => {
            const downloadParams = new URLSearchParams({
              propertyId: String(property.id),
              period,
              date: dayFilter,
              month: monthFilter,
              year: yearFilter
            })
            if (q) downloadParams.set('q', q)

            return (
              <PropertyCard
                key={property.id}
                propertyId={property.id}
                name={property.name}
                location={property.location}
                columns={2}
                stats={[
                  { label: 'Payments', value: allPayments.length },
                  {
                    label: q ? 'Matching paid' : period === 'all' ? 'Total paid' : 'Paid',
                    value: currency(q ? matchingPaid : totalPaid),
                    tone: 'mint'
                  }
                ]}
                footnote={
                  demandRows.length > 0 ? (
                    <p className="-mt-2 flex items-start gap-1.5 text-[12px] font-semibold leading-[17px] text-carried-fg">
                      <span aria-hidden="true" className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-carried-bar" />
                      <span>
                        {currency(demandRows.reduce((total, row) => total + row.totalOutstandingBalance, 0))} demanded from{' '}
                        {demandRows.length} tenant{demandRows.length === 1 ? '' : 's'}
                        {demandRows.some((row) => row.carriedForwardBalance > 0) &&
                          ` - includes ${currency(demandRows.reduce((total, row) => total + row.carriedForwardBalance, 0))} carried forward`}
                      </span>
                    </p>
                  ) : undefined
                }
              >
                <PropertyRecordsModal
                  buttonLabel={propertyPayments.length === allPayments.length ? 'View payments' : `View ${propertyPayments.length} matching payments`}
                  title={`${property.name} Payments`}
                  description={`${property.location} - ${propertyPayments.length} payment${propertyPayments.length === 1 ? '' : 's'} shown`}
                  downloadHref={`/api/reports/payment-history?${downloadParams.toString()}`}
                >
                  <TenantRentDemandList rows={demandRows} />
                  <div className="overflow-x-auto px-4 py-4 sm:px-6 sm:py-5">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Tenant</th>
                          <th>Unit</th>
                          <th>Rent Coverage</th>
                          <th>Amount Paid</th>
                          <th>Remaining Balance</th>
                          <th>Date Paid</th>
                          <th>Method</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {propertyPayments.map(({ payment, tenant, unit }) => (
                          <tr key={payment.id}>
                            <td data-label="Tenant">
                              <div className="flex items-center gap-3">
                                <Avatar initials={initialsOf(tenant.fullName)} tone={toneFor(tenant.id)} size={36} />
                                <div className="min-w-0">
                                  <span className="block font-bold text-ink">{tenant.fullName}</span>
                                  {tenant.email && <span className="block truncate text-[12px] font-medium text-muted">{tenant.email}</span>}
                                </div>
                              </div>
                            </td>
                            <td data-label="Unit"><span className="block font-bold text-ink">Unit {unit.unitNumber}</span></td>
                            <td data-label="Rent Coverage" className="font-medium text-ink-soft">
                              {paymentBillingPeriods(payment).map((period) => monthLabel(period.month)).join(', ')}
                              <span className="mt-1 block text-[12px] font-medium text-muted">{payment.monthsCovered} month{payment.monthsCovered === 1 ? '' : 's'}</span>
                              {(() => {
                                const paidMonth = dateKey(payment.paymentDate).slice(0, 7)
                                const allocations = paymentAllocations(payment).map((allocation) => ({
                                  ...allocation,
                                  month: paymentAllocationBillingMonth(payment, allocation)
                                }))
                                const settledMonths = allocations.filter((allocation) => allocation.month < paidMonth)

                                if (allocations.length < 2 && settledMonths.length === 0) {
                                  return null
                                }

                                return (
                                  <span className="mt-1.5 block space-y-0.5">
                                    {allocations.map((allocation) => (
                                      <span key={allocation.month} className="flex items-center justify-between gap-2 text-[11.5px]">
                                        <span className="font-semibold text-muted">
                                          {monthShortLabel(allocation.month)}
                                          {allocation.month < paidMonth && (
                                            <span className="ml-1 rounded-full bg-carried-bg px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-carried-fg">
                                              Arrears
                                            </span>
                                          )}
                                        </span>
                                        <span className="font-extrabold tabular-nums text-ink">{currency(allocation.amount)}</span>
                                      </span>
                                    ))}
                                  </span>
                                )
                              })()}
                            </td>
                            <td data-label="Amount Paid" className="font-extrabold tabular-nums text-brand-text">{currency(payment.amountPaid)}</td>
                            <td data-label="Remaining Balance" className={`font-semibold ${payment.balanceAfterPayment > 0 ? 'text-carried-fg' : 'text-muted'}`}>
                              {payment.balanceAfterPayment > 0 ? currency(payment.balanceAfterPayment) : 'Fully Paid'}
                            </td>
                            <td data-label="Date Paid" className="font-medium text-ink-soft">{formatDate(payment.paymentDate)}</td>
                            <td data-label="Method"><span className="badge badge-slate">{payment.paymentMethod.replace(/_/g, ' ')}</span></td>
                            <td data-label="Actions">
                              <div className="flex items-center justify-end gap-2">
                                <PdfDownload href={`/api/receipts/${payment.id}`} className="btn btn-xs btn-mint">
                                  <Download aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
                                  Receipt
                                </PdfDownload>
                                <Link href={`/payments/${payment.id}/edit`} className="btn btn-xs btn-outline">
                                  Edit
                                </Link>
                                <DeleteButton endpoint={`/api/rent-payments/${payment.id}`} className="btn btn-xs btn-danger" />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {propertyPayments.length === 0 && (
                      <p className="py-12 text-center text-[14px] font-semibold text-muted">No payments found for this property and search.</p>
                    )}
                  </div>
                </PropertyRecordsModal>
              </PropertyCard>
            )
          })}
        </div>
      </section>
    </div>
  )
}
