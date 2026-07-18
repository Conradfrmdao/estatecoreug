import DeleteButton from '@/components/DeleteButton'
import PaymentFilters from '@/components/PaymentFilters'
import PropertyRecordsModal from '@/components/PropertyRecordsModal'
import { requireCurrentAppUser } from '@/lib/auth'
import { listPaymentsForUser, listPropertiesForUser } from '@/lib/data'
import { currency, dateKey, formatDate, monthLabel } from '@/lib/format'
import { normalizePaymentFilters, paymentMatchesSearch, paymentReceivedInPeriod } from '@/lib/payment-filters'
import { paymentBillingPeriods } from '@/lib/rent-cycle'
import { Building2, Download, Plus, WalletCards } from 'lucide-react'
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
  const [properties, paymentRows] = await Promise.all([
    listPropertiesForUser(user.id),
    listPaymentsForUser(user.id)
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
    year: params?.year
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

      return {
        property,
        allPayments,
        payments,
        propertyMatches,
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

  return (
    <div className="space-y-6 animate-in">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: '#1a1a2e' }}>Rent Payments</h1>
          <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>
            Open a property to review only the payments collected there.
          </p>
        </div>
        <Link
          href="/payments/new"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition sm:w-auto"
          style={{ backgroundColor: '#00A550', boxShadow: '0 4px 14px rgba(0,165,80,0.3)' }}
        >
          <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
          Record Payment
        </Link>
      </section>

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

      <section className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-slate-500">Payments found</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{filteredRows.length}</p>
          <p className="mt-1 truncate text-xs text-slate-500">{periodLabel}</p>
        </div>
        <div className="min-w-0 border-l border-slate-200 pl-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <WalletCards className="h-4 w-4 shrink-0" strokeWidth={1.9} />
            <p className="text-xs font-black uppercase">Filtered total</p>
          </div>
          <p className="mt-1 break-words text-xl font-black text-emerald-700 sm:text-2xl">{currency(filteredTotal)}</p>
          <p className="mt-1 truncate text-xs text-slate-500">Payments received</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-black text-slate-950">Properties</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {propertyCards.map(({ property, allPayments, payments: propertyPayments, totalPaid, matchingPaid }) => {
            const downloadParams = new URLSearchParams({
              propertyId: String(property.id),
              period,
              date: dayFilter,
              month: monthFilter,
              year: yearFilter
            })
            if (q) downloadParams.set('q', q)

            return (
            <article key={property.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Building2 className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-black text-slate-950">{property.name}</h3>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{property.location}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-slate-50 px-2 py-2">
                  <p className="text-base font-black text-slate-950">{allPayments.length}</p>
                  <p className="text-[10px] font-bold uppercase text-slate-500">Payments</p>
                </div>
                <div className="rounded-lg bg-emerald-50 px-2 py-2">
                  <p className="truncate text-base font-black text-emerald-700">{currency(q ? matchingPaid : totalPaid)}</p>
                  <p className="text-[10px] font-bold uppercase text-emerald-700">{q ? 'Matching paid' : 'Total paid'}</p>
                </div>
              </div>
              <PropertyRecordsModal
                buttonLabel={propertyPayments.length === allPayments.length ? 'View payments' : `View ${propertyPayments.length} matching payments`}
                title={`${property.name} Payments`}
                description={`${property.location} - ${propertyPayments.length} payment${propertyPayments.length === 1 ? '' : 's'} shown`}
                downloadHref={`/api/reports/payment-history?${downloadParams.toString()}`}
              >
                <div className="overflow-x-auto p-3 sm:p-5">
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
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                                {tenant.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <span className="block font-semibold text-slate-950">{tenant.fullName}</span>
                                {tenant.email && <span className="block truncate text-xs text-slate-400">{tenant.email}</span>}
                              </div>
                            </div>
                          </td>
                          <td data-label="Unit"><span className="block font-semibold text-slate-950">Unit {unit.unitNumber}</span></td>
                          <td data-label="Rent Coverage" className="text-sm text-slate-700">
                            {paymentBillingPeriods(payment).map((period) => monthLabel(period.month)).join(', ')}
                            <span className="mt-1 block text-xs text-slate-400">{payment.monthsCovered} month{payment.monthsCovered === 1 ? '' : 's'}</span>
                          </td>
                          <td data-label="Amount Paid" className="font-bold text-emerald-600">{currency(payment.amountPaid)}</td>
                          <td data-label="Remaining Balance" className={payment.balanceAfterPayment > 0 ? 'text-sm text-amber-700' : 'text-sm text-slate-500'}>
                            {payment.balanceAfterPayment > 0 ? currency(payment.balanceAfterPayment) : 'Fully Paid'}
                          </td>
                          <td data-label="Date Paid" className="text-sm text-slate-500">{formatDate(payment.paymentDate)}</td>
                          <td data-label="Method"><span className="badge bg-slate-100 text-slate-700">{payment.paymentMethod.toUpperCase()}</span></td>
                          <td data-label="Actions">
                            <div className="flex items-center justify-end gap-2">
                              <a href={`/api/receipts/${payment.id}`} download className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700">
                                <Download aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
                                Receipt
                              </a>
                              <Link href={`/payments/${payment.id}/edit`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                                Edit
                              </Link>
                              <DeleteButton endpoint={`/api/rent-payments/${payment.id}`} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {propertyPayments.length === 0 && (
                    <p className="py-12 text-center text-sm font-semibold text-slate-500">No payments found for this property and search.</p>
                  )}
                </div>
              </PropertyRecordsModal>
            </article>
            )
          })}
        </div>
        {propertyCards.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-600">No properties match this search.</p>
          </div>
        )}
      </section>
    </div>
  )
}
