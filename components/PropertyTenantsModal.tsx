'use client'

import DeleteButton from '@/components/DeleteButton'
import PropertyRecordsModal from '@/components/PropertyRecordsModal'
import { currency, formatDate } from '@/lib/format'
import type { RentDisplayStatus } from '@/lib/rent-display'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

type TenantRecord = {
  id: number
  fullName: string
  phone: string
  email: string | null
  unitNumber: string
  moveInDate: string
  nextPaymentDate: string
  totalOutstandingBalance: number
  displayPaymentStatus: RentDisplayStatus
  active: boolean
}

function rentAccountState(status: RentDisplayStatus, active: boolean) {
  if (!active) return { badge: 'Inactive', className: 'bg-slate-100 text-slate-500' }
  if (status === 'outstanding') return { badge: 'Outstanding', className: 'bg-rose-50 text-rose-700' }
  if (status === 'paid') return { badge: 'Paid', className: 'bg-emerald-50 text-emerald-700' }
  return { badge: 'Cleared', className: 'bg-slate-100 text-slate-600' }
}

export default function PropertyTenantsModal({
  propertyName,
  propertyLocation,
  tenants,
  downloadHref
}: {
  propertyName: string
  propertyLocation: string
  tenants: TenantRecord[]
  downloadHref: string
}) {
  const [query, setQuery] = useState('')
  const filteredTenants = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return tenants

    return tenants.filter((tenant) =>
      [
        tenant.fullName,
        tenant.phone,
        tenant.email ?? '',
        tenant.unitNumber,
        tenant.active ? 'active' : 'inactive',
        formatDate(tenant.moveInDate),
        formatDate(tenant.nextPaymentDate),
        tenant.displayPaymentStatus
      ].some((value) => value.toLowerCase().includes(search))
    )
  }, [query, tenants])

  return (
    <PropertyRecordsModal
      buttonLabel="View tenants"
      title={`${propertyName} Tenants`}
      description={`${propertyLocation} - ${tenants.length} tenant${tenants.length === 1 ? '' : 's'}`}
      downloadHref={downloadHref}
    >
      <div className="sticky top-0 z-10 border-b border-slate-100 bg-white p-3 sm:px-5 sm:py-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.9} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="field-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search tenant, unit, phone, email, or status..."
            aria-label={`Search tenants in ${propertyName}`}
          />
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-500">
          {filteredTenants.length} of {tenants.length} tenants
        </p>
      </div>

      <div className="overflow-x-auto p-3 sm:p-5">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Unit</th>
              <th>Contact</th>
              <th>Move In Date</th>
              <th>Next Scheduled</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.map((tenant) => {
              const rentAccount = rentAccountState(tenant.displayPaymentStatus, tenant.active)
              return (
                <tr key={tenant.id}>
                  <td data-label="Tenant">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ backgroundColor: tenant.active ? '#00A550' : '#94a3b8' }}>
                        {tenant.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="block font-semibold text-slate-950">{tenant.fullName}</span>
                        {tenant.email && <span className="block truncate text-xs text-slate-400">{tenant.email}</span>}
                      </div>
                    </div>
                  </td>
                  <td data-label="Unit"><span className="block font-semibold text-slate-950">Unit {tenant.unitNumber}</span></td>
                  <td data-label="Contact" className="text-sm text-slate-700">{tenant.phone}</td>
                  <td data-label="Move In Date" className="text-sm text-slate-500">{formatDate(tenant.moveInDate)}</td>
                  <td data-label="Next Scheduled">
                    <span className="block text-sm font-semibold text-slate-800">{formatDate(tenant.nextPaymentDate)}</span>
                    <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[11px] font-black ${rentAccount.className}`}>
                      {tenant.displayPaymentStatus === 'outstanding'
                        ? `${currency(tenant.totalOutstandingBalance)} outstanding`
                        : rentAccount.badge}
                    </span>
                  </td>
                  <td data-label="Status">
                    <span className={tenant.active ? 'badge badge-green' : 'badge bg-slate-100 text-slate-500'}>
                      {tenant.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className="flex items-center justify-end gap-2">
                      {tenant.active && tenant.displayPaymentStatus === 'outstanding' && (
                        <Link href={`/payments/new?tenantId=${tenant.id}`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-slate-50">
                          Record Payment
                        </Link>
                      )}
                      <Link href={`/tenants/${tenant.id}/edit`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                        Edit
                      </Link>
                      <DeleteButton endpoint={`/api/tenants/${tenant.id}`} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filteredTenants.length === 0 && (
          <p className="py-12 text-center text-sm font-semibold text-slate-500">No tenants match that search.</p>
        )}
      </div>
    </PropertyRecordsModal>
  )
}
