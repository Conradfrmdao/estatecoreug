import DeleteButton from '@/components/DeleteButton'
import PropertyRecordsModal from '@/components/PropertyRecordsModal'
import { requireCurrentAppUser } from '@/lib/auth'
import { listPropertiesForUser, listTenantsForUser } from '@/lib/data'
import { currentPaymentMonth, formatDate } from '@/lib/format'
import { daysUntilDate } from '@/lib/rent-cycle'
import { Building2, Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type TenantsPageParams = {
  q?: string
}

function nextPaymentState(value: Date, active: boolean) {
  if (!active) {
    return { badge: 'Inactive', className: 'bg-slate-100 text-slate-500' }
  }

  const days = daysUntilDate(value)
  if (days < 0) {
    return { badge: `${Math.abs(days)} days late`, className: 'bg-rose-50 text-rose-700' }
  }
  if (days <= 4) {
    return {
      badge: days === 0 ? 'Due today' : `${days} days left`,
      className: 'bg-orange-50 text-orange-700'
    }
  }
  return { badge: `${days} days left`, className: 'bg-emerald-50 text-emerald-700' }
}

export default async function TenantsPage({
  searchParams
}: {
  searchParams?: Promise<TenantsPageParams>
}) {
  const user = await requireCurrentAppUser()
  const params = await searchParams
  const q = (params?.q ?? '').trim().toLowerCase()
  const month = currentPaymentMonth()
  const [properties, tenantRows] = await Promise.all([
    listPropertiesForUser(user.id),
    listTenantsForUser(user.id)
  ])

  const filteredRows = tenantRows.filter(({ tenant, unit, property }) => {
    if (!q) return true

    return [
      tenant.fullName,
      tenant.phone,
      tenant.email ?? '',
      unit.unitNumber,
      property.name,
      property.location,
      tenant.active ? 'active' : 'inactive',
      formatDate(tenant.moveInDate),
      formatDate(tenant.rentDueDate)
    ].some((value) => value.toLowerCase().includes(q))
  })

  const propertyCards = properties
    .map((property) => {
      const allTenants = tenantRows.filter(({ property: rowProperty }) => rowProperty.id === property.id)
      const tenants = filteredRows.filter(({ property: rowProperty }) => rowProperty.id === property.id)
      const propertyMatches = q
        ? [property.name, property.location].some((value) => value.toLowerCase().includes(q))
        : true

      return {
        property,
        allTenants,
        tenants,
        propertyMatches,
        activeCount: allTenants.filter(({ tenant }) => tenant.active).length,
        inactiveCount: allTenants.filter(({ tenant }) => !tenant.active).length
      }
    })
    .filter(({ tenants, propertyMatches }) => !q || propertyMatches || tenants.length > 0)

  return (
    <div className="space-y-6 animate-in">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: '#1a1a2e' }}>Tenants</h1>
          <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>
            Open a property to view and manage only its tenants.
          </p>
        </div>
        <Link
          href="/tenants/new"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition sm:w-auto"
          style={{ backgroundColor: '#00A550', boxShadow: '0 4px 14px rgba(0,165,80,0.3)' }}
        >
          <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
          New Tenant
        </Link>
      </section>

      <form method="get" className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row"
        style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <input
          name="q"
          defaultValue={params?.q ?? ''}
          placeholder="Search tenant, email, phone, unit, property, or status..."
          className="field-input min-w-0 flex-1"
        />
        <button className="min-h-11 rounded-lg px-5 py-2 text-sm font-semibold text-white transition sm:w-auto" style={{ backgroundColor: '#00A550' }}>
          Search
        </button>
        {q && (
          <Link href="/tenants" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 sm:w-auto">
            Clear
          </Link>
        )}
      </form>

      <section className="space-y-3">
        <h2 className="text-sm font-black text-slate-950">Properties</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {propertyCards.map(({ property, allTenants, tenants: propertyTenants, activeCount, inactiveCount }) => (
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
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 px-2 py-2">
                  <p className="text-base font-black text-slate-950">{allTenants.length}</p>
                  <p className="text-[10px] font-bold uppercase text-slate-500">Tenants</p>
                </div>
                <div className="rounded-lg bg-emerald-50 px-2 py-2">
                  <p className="text-base font-black text-emerald-700">{activeCount}</p>
                  <p className="text-[10px] font-bold uppercase text-emerald-700">Active</p>
                </div>
                <div className="rounded-lg bg-slate-100 px-2 py-2">
                  <p className="text-base font-black text-slate-600">{inactiveCount}</p>
                  <p className="text-[10px] font-bold uppercase text-slate-500">Inactive</p>
                </div>
              </div>
              <PropertyRecordsModal
                buttonLabel={propertyTenants.length === allTenants.length ? 'View tenants' : `View ${propertyTenants.length} matching tenants`}
                title={`${property.name} Tenants`}
                description={`${property.location} - ${propertyTenants.length} tenant${propertyTenants.length === 1 ? '' : 's'} shown`}
                downloadHref={`/api/reports/property-detail?month=${month}&propertyId=${property.id}`}
              >
                <div className="overflow-x-auto p-3 sm:p-5">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Tenant</th>
                        <th>Unit</th>
                        <th>Contact</th>
                        <th>Move In Date</th>
                        <th>Next Payment</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertyTenants.map(({ tenant, unit }) => {
                        const nextPayment = nextPaymentState(tenant.rentDueDate, tenant.active)
                        return (
                          <tr key={tenant.id}>
                            <td data-label="Tenant">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                                  style={{ backgroundColor: tenant.active ? '#00A550' : '#94a3b8' }}>
                                  {tenant.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <span className="block font-semibold text-slate-950">{tenant.fullName}</span>
                                  {tenant.email && <span className="block truncate text-xs text-slate-400">{tenant.email}</span>}
                                </div>
                              </div>
                            </td>
                            <td data-label="Unit"><span className="block font-semibold text-slate-950">Unit {unit.unitNumber}</span></td>
                            <td data-label="Contact" className="text-sm text-slate-700">{tenant.phone}</td>
                            <td data-label="Move In Date" className="text-sm text-slate-500">{formatDate(tenant.moveInDate)}</td>
                            <td data-label="Next Payment">
                              <span className="block text-sm font-semibold text-slate-800">{formatDate(tenant.rentDueDate)}</span>
                              <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[11px] font-black ${nextPayment.className}`}>
                                {nextPayment.badge}
                              </span>
                            </td>
                            <td data-label="Status">
                              <span className={tenant.active ? 'badge badge-green' : 'badge bg-slate-100 text-slate-500'}>
                                {tenant.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td data-label="Actions">
                              <div className="flex items-center justify-end gap-2">
                                {tenant.active && (
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
                  {propertyTenants.length === 0 && (
                    <p className="py-12 text-center text-sm font-semibold text-slate-500">No tenants found for this property and search.</p>
                  )}
                </div>
              </PropertyRecordsModal>
            </article>
          ))}
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
