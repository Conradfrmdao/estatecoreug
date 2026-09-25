'use client'

import DeleteButton from '@/components/DeleteButton'
import CarryForwardNote from '@/components/CarryForwardNote'
import PropertyRecordsModal from '@/components/PropertyRecordsModal'
import Avatar, { initialsOf, toneFor } from '@/components/ui/Avatar'
import { currency, currentPaymentMonth, formatDate, monthShortLabel } from '@/lib/format'
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
  carriedForwardBalance: number
  carriedForwardMonths: { month: string; balance: number }[]
  currentMonthBalance: number
  displayPaymentStatus: RentDisplayStatus
  active: boolean
}

function rentAccountState(status: RentDisplayStatus, active: boolean) {
  if (!active) return { badge: 'Inactive', className: 'bg-line text-muted' }
  if (status === 'outstanding') return { badge: 'Outstanding', className: 'bg-overdue-bg text-overdue-fg' }
  if (status === 'paid') return { badge: 'Paid', className: 'bg-paid-bg text-paid-fg' }
  return { badge: 'Cleared', className: 'bg-line text-ink-soft' }
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
  const currentMonthName = useMemo(() => monthShortLabel(currentPaymentMonth()), [])
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
      <div className="sticky top-0 z-10 bg-white px-4 pb-3 pt-4 sm:px-6">
        <label className="search-field">
          <Search aria-hidden="true" className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
          <span className="sr-only">Search tenants in {propertyName}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tenant, unit, phone, email, or status..."
          />
        </label>
        <p className="mt-2 px-1 text-[12.5px] font-semibold text-muted">
          {filteredTenants.length} of {tenants.length} tenants
        </p>
      </div>

      <div className="overflow-x-auto px-4 pb-5 sm:px-6">
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
                      <Avatar
                        initials={initialsOf(tenant.fullName)}
                        tone={tenant.active ? toneFor(tenant.id) : 'muted'}
                        size={36}
                      />
                      <div className="min-w-0">
                        <span className="block font-bold text-ink">{tenant.fullName}</span>
                        {tenant.email && <span className="block truncate text-[12px] font-medium text-muted">{tenant.email}</span>}
                      </div>
                    </div>
                  </td>
                  <td data-label="Unit"><span className="block font-bold text-ink">Unit {tenant.unitNumber}</span></td>
                  <td data-label="Contact" className="font-medium text-ink-soft">{tenant.phone}</td>
                  <td data-label="Move In Date" className="font-medium text-muted">{formatDate(tenant.moveInDate)}</td>
                  <td data-label="Next Scheduled">
                    <span className="block font-bold text-ink">{formatDate(tenant.nextPaymentDate)}</span>
                    <span className={`pill mt-1 ${rentAccount.className}`}>
                      {tenant.displayPaymentStatus === 'outstanding'
                        ? `${currency(tenant.totalOutstandingBalance)} outstanding`
                        : rentAccount.badge}
                    </span>
                    <CarryForwardNote
                      carriedForwardBalance={tenant.carriedForwardBalance}
                      carriedForwardMonths={tenant.carriedForwardMonths}
                      className="block"
                    />
                    {tenant.carriedForwardBalance > 0 && (
                      <span className="mt-0.5 block text-[11.5px] font-semibold text-muted">
                        {currency(tenant.currentMonthBalance)} for {currentMonthName}
                      </span>
                    )}
                  </td>
                  <td data-label="Status">
                    <span className={tenant.active ? 'badge badge-green' : 'badge badge-slate'}>
                      {tenant.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className="flex items-center justify-end gap-2">
                      {tenant.active && (
                        <Link href={`/payments/new?tenantId=${tenant.id}`} className="btn btn-xs btn-mint">
                          Record Payment
                        </Link>
                      )}
                      <Link href={`/tenants/${tenant.id}/edit`} className="btn btn-xs btn-outline">
                        Edit
                      </Link>
                      <DeleteButton endpoint={`/api/tenants/${tenant.id}`} className="btn btn-xs btn-danger" />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filteredTenants.length === 0 && (
          <p className="py-12 text-center text-[14px] font-semibold text-muted">No tenants match that search.</p>
        )}
      </div>
    </PropertyRecordsModal>
  )
}
