import DeleteButton from '@/components/DeleteButton'
import { requireCurrentAppUser } from '@/lib/auth'
import { listPaymentsForUser } from '@/lib/data'
import { currency, formatDate, monthLabel } from '@/lib/format'
import { Download, Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PaymentsPage({
  searchParams
}: {
  searchParams?: { q?: string }
}) {
  const user = await requireCurrentAppUser()
  const q = (searchParams?.q ?? '').toLowerCase()
  const paymentRows = await listPaymentsForUser(user.id)

  const rows = q
    ? paymentRows.filter(({ payment, tenant, unit, property }) =>
        [
          tenant.fullName,
          unit.unitNumber,
          property.name,
          payment.paymentMonth,
          payment.paymentMethod,
          payment.notes ?? ''
        ].some((val) => val.toLowerCase().includes(q))
      )
    : paymentRows

  return (
    <div className="space-y-6 animate-in">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: '#1a1a2e' }}>Rent Payments</h1>
          <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>
            History of all rent collected from your tenants.
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

      {/* Search */}
      <form method="get" className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row"
        style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <input
          name="q"
          defaultValue={searchParams?.q ?? ''}
          placeholder="Search payments by tenant, unit, month, or method…"
          className="field-input min-w-0 flex-1"
        />
        <button
          className="min-h-11 rounded-lg px-5 py-2 text-sm font-semibold text-white transition sm:w-auto"
          style={{ backgroundColor: '#00A550' }}
        >
          Search
        </button>
      </form>

      {/* Table */}
      <section className="overflow-hidden rounded-xl border bg-white"
        style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Unit & Property</th>
                <th>Rent Coverage</th>
                <th>Amount Paid</th>
                <th>Remaining Balance</th>
                <th>Date Paid</th>
                <th>Method</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ payment, tenant, unit, property }) => (
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
                  <td data-label="Unit & Property">
                    <div>
                      <span className="font-semibold block" style={{ color: '#1a1a2e' }}>Unit {unit.unitNumber}</span>
                      <span className="text-xs text-slate-500 block">{property.name}</span>
                    </div>
                  </td>
                  <td data-label="Rent Coverage" style={{ color: '#374151', fontSize: '0.875rem' }}>
                    {monthLabel(payment.paymentMonth)}
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
        {rows.length === 0 && (
          <div className="py-14 text-center">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: '#e6f7ef' }}>
              <svg className="w-6 h-6" fill="none" stroke="#00A550" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: '#374151' }}>No payments found</p>
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
              {q ? 'Try a different search term' : 'Record your first tenant payment to get started'}
            </p>
            {!q && (
              <Link href="/payments/new"
                className="inline-block mt-4 px-5 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: '#00A550' }}>
                Record Payment
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
