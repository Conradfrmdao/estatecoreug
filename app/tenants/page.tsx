import PropertyTenantsModal from '@/components/PropertyTenantsModal'
import TenantSearchResults from '@/components/TenantSearchResults'
import { requireCurrentAppUser } from '@/lib/auth'
import { listPropertiesForUser, listTenantPaymentTargets } from '@/lib/data'
import { currentPaymentMonth, formatDate } from '@/lib/format'
import { Building2, Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type TenantsPageParams = {
  q?: string
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
    listTenantPaymentTargets(user.id)
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

      {q && (
        <TenantSearchResults
          tenants={filteredRows.map(({
            tenant,
            unit,
            property,
            targetMonth,
            targetDueDate,
            targetAmountPaid,
            targetBalance,
            targetScheduledBalance,
            targetPaymentStatus
          }) => ({
            id: tenant.id,
            fullName: tenant.fullName,
            phone: tenant.phone,
            email: tenant.email,
            active: tenant.active,
            moveInDate: tenant.moveInDate.toISOString(),
            rentDueDate: tenant.rentDueDate.toISOString(),
            paymentTiming: tenant.paymentTiming,
            billingCycleMonths: tenant.billingCycleMonths,
            unitId: unit.id,
            unitNumber: unit.unitNumber,
            unitStatus: unit.status,
            rentAmount: unit.rentAmount,
            propertyId: property.id,
            propertyName: property.name,
            propertyLocation: property.location,
            targetMonth,
            targetDueDate: targetDueDate.toISOString(),
            targetAmountPaid,
            targetBalance,
            targetScheduledBalance,
            targetPaymentStatus
          }))}
        />
      )}

      {!q && (
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
              <PropertyTenantsModal
                propertyName={property.name}
                propertyLocation={property.location}
                tenants={propertyTenants.map(({ tenant, unit }) => ({
                  id: tenant.id,
                  fullName: tenant.fullName,
                  phone: tenant.phone,
                  email: tenant.email,
                  unitNumber: unit.unitNumber,
                  moveInDate: tenant.moveInDate.toISOString(),
                  rentDueDate: tenant.rentDueDate.toISOString(),
                  active: tenant.active
                }))}
                downloadHref={`/api/reports/property-detail?month=${month}&propertyId=${property.id}`}
              />
            </article>
          ))}
        </div>
        {propertyCards.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-600">No properties match this search.</p>
          </div>
        )}
      </section>
      )}
    </div>
  )
}
