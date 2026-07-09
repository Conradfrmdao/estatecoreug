import DeleteButton from '@/components/DeleteButton'
import { requireCurrentAppUser } from '@/lib/auth'
import { listPaymentsForUser, listPropertiesForUser } from '@/lib/data'
import { currency, formatDate, monthLabel } from '@/lib/format'
import { paymentCoveragePeriods } from '@/lib/rent-cycle'
import { Building2, ChevronRight, Download, Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type PaymentsPageParams = {
  q?: string
  propertyId?: string
}

function propertyHref(propertyId: number, q: string) {
  const query = new URLSearchParams()
  query.set('propertyId', String(propertyId))
  if (q) query.set('q', q)
  return `/payments?${query.toString()}`
}

function paymentListHref(q: string) {
  return q ? `/payments?q=${encodeURIComponent(q)}` : '/payments'
}

export default async function PaymentsPage({
  searchParams
}: {
  searchParams?: Promise<PaymentsPageParams>
}) {
  const user = await requireCurrentAppUser()
  const params = await searchParams
  const q = (params?.q ?? '').trim().toLowerCase()
  const selectedPropertyId = Number(params?.propertyId ?? '')
  const hasSelectedProperty = Number.isInteger(selectedPropertyId) && selectedPropertyId > 0
  const [properties, paymentRows] = await Promise.all([
    listPropertiesForUser(user.id),
    listPaymentsForUser(user.id)
  ])

  const filteredRows = paymentRows.filter(({ payment, tenant, unit, property }) => {
    if (!q) return true

    return [
      tenant.fullName,
      tenant.email ?? '',
      unit.unitNumber,
      property.name,
      property.location,
      payment.paymentMonth,
      payment.paymentMethod,
      formatDate(payment.paymentDate),
      String(payment.amountPaid),
      currency(payment.amountPaid),
      ...paymentCoveragePeriods(payment).map((period) => monthLabel(period.month)),
      payment.notes ?? ''
    ].some((value) => value.toLowerCase().includes(q))
  })

  const propertyCards = properties
    .map((property) => {
      const allPayments = paymentRows.filter(({ property: rowProperty }) => rowProperty.id === property.id)
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

  const selectedProperty = hasSelectedProperty
    ? properties.find((property) => property.id === selectedPropertyId) ?? null
    : null
  const selectedRows = selectedProperty
    ? filteredRows.filter(({ property }) => property.id === selectedProperty.id)
    : []

  return (
    <div className="space-y-6 animate-in">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: '#1a1a2e' }}>Rent Payments</h1>
          <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>
            Choose a property first, then view payments collected there.
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

      <form method="get" className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row"
        style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {hasSelectedProperty && <input type="hidden" name="propertyId" value={selectedPropertyId} />}
        <input
          name="q"
          defaultValue={params?.q ?? ''}
          placeholder="Search payments by tenant, property, unit, month, amount, or method..."
          className="field-input min-w-0 flex-1"
        />
        <button
          className="min-h-11 rounded-lg px-5 py-2 text-sm font-semibold text-white transition sm:w-auto"
          style={{ backgroundColor: '#00A550' }}
        >
          Search
        </button>
        {(q || hasSelectedProperty) && (
          <Link
            href="/payments"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 sm:w-auto"
          >
            Clear
          </Link>
        )}
      </form>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black text-slate-950">Properties</h2>
          {hasSelectedProperty && (
            <Link href={paymentListHref(q)} className="text-xs font-bold text-slate-500 hover:text-slate-800">
              Show property list only
            </Link>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {propertyCards.map(({ property, allPayments, payments, totalPaid, matchingPaid }) => {
            const active = selectedProperty?.id === property.id
            return (
              <article
                key={property.id}
                className={`rounded-xl border bg-white p-4 shadow-sm transition ${active ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200'}`}
              >
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
                <Link
                  href={propertyHref(property.id, q)}
                  className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  {payments.length === allPayments.length ? 'Show payments' : `Show ${payments.length} matching payments`}
                  <ChevronRight className="h-4 w-4" strokeWidth={1.9} />
                </Link>
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

      {selectedProperty && (
        <section className="overflow-hidden rounded-xl border bg-white"
          style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-black text-slate-950">{selectedProperty.name} Payments</h2>
            <p className="mt-0.5 text-xs text-slate-500">Only payments under this property are shown.</p>
          </div>
          <div className="overflow-x-auto">
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
                {selectedRows.map(({ payment, tenant, unit }) => (
                  <tr key={payment.id}>
                    <td data-label="Tenant">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: '#00A550' }}>
                          {tenant.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold block" style={{ color: '#1a1a2e' }}>{tenant.fullName}</span>
                          {tenant.email && (
                            <span className="text-xs block text-slate-400">{tenant.email}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td data-label="Unit">
                      <span className="font-semibold block" style={{ color: '#1a1a2e' }}>Unit {unit.unitNumber}</span>
                    </td>
                    <td data-label="Rent Coverage" style={{ color: '#374151', fontSize: '0.875rem' }}>
                      {paymentCoveragePeriods(payment).map((period) => monthLabel(period.month)).join(', ')}
                      <span className="mt-1 block text-xs text-slate-400">
                        {payment.monthsCovered} month{payment.monthsCovered === 1 ? '' : 's'}
                      </span>
                    </td>
                    <td data-label="Amount Paid" className="font-bold" style={{ color: '#00A550' }}>
                      {currency(payment.amountPaid)}
                    </td>
                    <td data-label="Remaining Balance" style={{ color: payment.balanceAfterPayment > 0 ? '#b45309' : '#64748b', fontSize: '0.875rem' }}>
                      {payment.balanceAfterPayment > 0 ? currency(payment.balanceAfterPayment) : 'Fully Paid'}
                    </td>
                    <td data-label="Date Paid" style={{ color: '#64748b', fontSize: '0.875rem' }}>
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td data-label="Method">
                      <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#374151' }}>
                        {payment.paymentMethod.toUpperCase()}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className="flex justify-end items-center gap-2">
                        <a
                          href={`/api/receipts/${payment.id}`}
                          download
                          className="rounded-lg border px-2 py-1.5 text-xs font-medium transition text-white hover:opacity-90 flex items-center gap-1"
                          style={{ backgroundColor: '#00A550', borderColor: 'transparent' }}
                        >
                          <Download aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
                          Receipt
                        </a>
                        <Link
                          href={`/payments/${payment.id}/edit`}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-slate-50"
                          style={{ borderColor: '#e2e8f0', color: '#374151' }}
                        >
                          Edit
                        </Link>
                        <DeleteButton endpoint={`/api/rent-payments/${payment.id}`} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedRows.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-slate-500">No payments found for this property and search.</p>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
