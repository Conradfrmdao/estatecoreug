import DeleteButton from '@/components/DeleteButton'
import { requireCurrentAppUser } from '@/lib/auth'
import { listPropertiesForUser, listTenantsForUser } from '@/lib/data'
import { formatDate } from '@/lib/format'
import { daysUntilDate } from '@/lib/rent-cycle'
import { Building2, ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type TenantsPageParams = {
  q?: string
  propertyId?: string
}

function propertyHref(propertyId: number, q: string) {
  const query = new URLSearchParams()
  query.set('propertyId', String(propertyId))
  if (q) query.set('q', q)
  return `/tenants?${query.toString()}`
}

function tenantListHref(q: string) {
  return q ? `/tenants?q=${encodeURIComponent(q)}` : '/tenants'
}

function nextPaymentState(value: Date, active: boolean) {
  if (!active) {
    return {
      badge: 'Inactive',
      className: 'bg-slate-100 text-slate-500'
    }
  }

  const days = daysUntilDate(value)

  if (days < 0) {
    return {
      badge: `${Math.abs(days)} days late`,
      className: 'bg-rose-50 text-rose-700'
    }
  }

  if (days <= 4) {
    return {
      badge: days === 0 ? 'Due today' : `${days} days left`,
      className: 'bg-orange-50 text-orange-700'
    }
  }

  return {
    badge: `${days} days left`,
    className: 'bg-emerald-50 text-emerald-700'
  }
}

export default async function TenantsPage({
  searchParams
}: {
  searchParams?: Promise<TenantsPageParams>
}) {
  const user = await requireCurrentAppUser()
  const params = await searchParams
  const q = (params?.q ?? '').trim().toLowerCase()
  const selectedPropertyId = Number(params?.propertyId ?? '')
  const hasSelectedProperty = Number.isInteger(selectedPropertyId) && selectedPropertyId > 0
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
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: '#1a1a2e' }}>Tenants</h1>
          <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>
            Choose a property first, then manage the tenants inside it.
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
        {hasSelectedProperty && <input type="hidden" name="propertyId" value={selectedPropertyId} />}
        <input
          name="q"
          defaultValue={params?.q ?? ''}
          placeholder="Search tenant, email, phone, unit, property, or status..."
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
            href="/tenants"
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
            <Link href={tenantListHref(q)} className="text-xs font-bold text-slate-500 hover:text-slate-800">
              Show property list only
            </Link>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {propertyCards.map(({ property, allTenants, tenants, activeCount, inactiveCount }) => {
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
                    <p className="text-base font-black text-slate-700">{inactiveCount}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-600">Inactive</p>
                  </div>
                </div>
                <Link
                  href={propertyHref(property.id, q)}
                  className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  {tenants.length === allTenants.length ? 'Show tenants' : `Show ${tenants.length} matching tenants`}
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
            <h2 className="text-sm font-black text-slate-950">{selectedProperty.name} Tenants</h2>
            <p className="mt-0.5 text-xs text-slate-500">Only tenants under this property are shown.</p>
          </div>
          <div className="overflow-x-auto">
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
                {selectedRows.map(({ tenant, unit }) => {
                  const nextPayment = nextPaymentState(tenant.rentDueDate, tenant.active)

                  return (
                    <tr key={tenant.id}>
                      <td data-label="Tenant">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: tenant.active ? '#00A550' : '#94a3b8' }}>
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
                      <td data-label="Contact" style={{ color: '#374151', fontSize: '0.875rem' }}>
                        {tenant.phone}
                      </td>
                      <td data-label="Move In Date" style={{ color: '#64748b', fontSize: '0.875rem' }}>
                        {formatDate(tenant.moveInDate)}
                      </td>
                      <td data-label="Next Payment">
                        <span className="block text-sm font-semibold text-slate-800">{formatDate(tenant.rentDueDate)}</span>
                        <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[11px] font-black ${nextPayment.className}`}>
                          {nextPayment.badge}
                        </span>
                      </td>
                      <td data-label="Status">
                        {tenant.active ? (
                          <span className="badge badge-green">Active</span>
                        ) : (
                          <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>Inactive</span>
                        )}
                      </td>
                      <td data-label="Actions">
                        <div className="flex justify-end items-center gap-2">
                          {tenant.active && (
                            <Link
                              href={`/payments/new?tenantId=${tenant.id}`}
                              className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-slate-50"
                              style={{ borderColor: '#e2e8f0', color: '#00A550' }}
                            >
                              Record Payment
                            </Link>
                          )}
                          <Link
                            href={`/tenants/${tenant.id}/edit`}
                            className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-slate-50"
                            style={{ borderColor: '#e2e8f0', color: '#374151' }}
                          >
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
          </div>
          {selectedRows.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-slate-500">No tenants found for this property and search.</p>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
