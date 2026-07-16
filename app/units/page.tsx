import DeleteButton from '@/components/DeleteButton'
import PropertyRecordsModal from '@/components/PropertyRecordsModal'
import { requireCurrentAppUser } from '@/lib/auth'
import { listPropertiesForUser, listUnitsForUser } from '@/lib/data'
import { currency, currentPaymentMonth } from '@/lib/format'
import { Building2, Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type UnitsPageParams = {
  q?: string
  status?: string
}

export default async function UnitsPage({
  searchParams
}: {
  searchParams?: Promise<UnitsPageParams>
}) {
  const user = await requireCurrentAppUser()
  const params = await searchParams
  const q = (params?.q ?? '').trim().toLowerCase()
  const statusFilter = params?.status ?? ''
  const month = currentPaymentMonth()

  const [properties, unitRows] = await Promise.all([
    listPropertiesForUser(user.id),
    listUnitsForUser(user.id)
  ])

  const filteredRows = unitRows.filter(({ unit, property }) => {
    if (statusFilter && unit.status !== statusFilter) return false

    if (q) {
      return [unit.unitNumber, unit.status, property.name, property.location]
        .some((value) => value.toLowerCase().includes(q))
    }

    return true
  })

  const propertyCards = properties
    .map((property) => {
      const allUnits = unitRows.filter(({ unit }) => unit.propertyId === property.id)
      const units = filteredRows.filter(({ unit }) => unit.propertyId === property.id)
      const propertyMatches = q
        ? [property.name, property.location].some((value) => value.toLowerCase().includes(q))
        : true

      return {
        property,
        allUnits,
        units,
        propertyMatches,
        occupiedCount: allUnits.filter(({ unit }) => unit.status === 'occupied').length,
        vacantCount: allUnits.filter(({ unit }) => unit.status === 'vacant').length
      }
    })
    .filter(({ units, propertyMatches }) => !q || propertyMatches || units.length > 0)

  const occupiedCount = unitRows.filter(({ unit }) => unit.status === 'occupied').length
  const vacantCount = unitRows.filter(({ unit }) => unit.status === 'vacant').length

  return (
    <div className="space-y-6 animate-in">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: '#1a1a2e' }}>Units</h1>
          <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>
            Open a property to view and manage only its units.
          </p>
        </div>
        <Link
          href="/units/new"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition sm:w-auto"
          style={{ backgroundColor: '#00A550', boxShadow: '0 4px 14px rgba(0,165,80,0.3)' }}
        >
          <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
          New Unit
        </Link>
      </section>

      <div className="grid grid-cols-2 gap-2 min-[430px]:grid-cols-3 sm:gap-4">
        <div className="rounded-xl border bg-white p-3 text-center sm:p-4"
          style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p className="text-xl font-bold sm:text-2xl" style={{ color: '#1a1a2e' }}>{unitRows.length}</p>
          <p className="mt-1 text-xs" style={{ color: '#64748b' }}>Total Units</p>
        </div>
        <div className="rounded-xl border bg-white p-3 text-center sm:p-4"
          style={{ borderColor: '#e2e8f0', backgroundColor: '#e6f7ef', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p className="text-xl font-bold sm:text-2xl" style={{ color: '#007038' }}>{occupiedCount}</p>
          <p className="mt-1 text-xs" style={{ color: '#00A550' }}>Occupied</p>
        </div>
        <div className="col-span-2 rounded-xl border bg-white p-3 text-center min-[430px]:col-span-1 sm:p-4"
          style={{ borderColor: '#fef3c7', backgroundColor: '#fffbeb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p className="text-xl font-bold sm:text-2xl" style={{ color: '#92400e' }}>{vacantCount}</p>
          <p className="mt-1 text-xs" style={{ color: '#f59e0b' }}>Vacant</p>
        </div>
      </div>

      <form method="get" className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-center"
        style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <input
          name="q"
          defaultValue={params?.q ?? ''}
          placeholder="Search property, location, unit, or status..."
          className="field-input min-w-0"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="field-input min-w-0 sm:w-auto sm:min-w-[140px]"
        >
          <option value="">All statuses</option>
          <option value="occupied">Occupied</option>
          <option value="vacant">Vacant</option>
        </select>
        <button className="min-h-11 rounded-lg px-5 py-2 text-sm font-semibold text-white transition" style={{ backgroundColor: '#00A550' }}>
          Filter
        </button>
        {(q || statusFilter) && (
          <Link href="/units" className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition"
            style={{ color: '#64748b', border: '1px solid #e2e8f0' }}>
            Clear
          </Link>
        )}
      </form>

      <section className="space-y-3">
        <h2 className="text-sm font-black text-slate-950">Properties</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {propertyCards.map(({ property, allUnits, units, occupiedCount: propertyOccupied, vacantCount: propertyVacant }) => (
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
                  <p className="text-base font-black text-slate-950">{allUnits.length}</p>
                  <p className="text-[10px] font-bold uppercase text-slate-500">Units</p>
                </div>
                <div className="rounded-lg bg-emerald-50 px-2 py-2">
                  <p className="text-base font-black text-emerald-700">{propertyOccupied}</p>
                  <p className="text-[10px] font-bold uppercase text-emerald-700">Occupied</p>
                </div>
                <div className="rounded-lg bg-amber-50 px-2 py-2">
                  <p className="text-base font-black text-amber-700">{propertyVacant}</p>
                  <p className="text-[10px] font-bold uppercase text-amber-700">Vacant</p>
                </div>
              </div>
              <PropertyRecordsModal
                buttonLabel={units.length === allUnits.length ? 'View units' : `View ${units.length} matching units`}
                title={`${property.name} Units`}
                description={`${property.location} - ${units.length} unit${units.length === 1 ? '' : 's'} shown`}
                downloadHref={`/api/reports/property-detail?month=${month}&propertyId=${property.id}`}
              >
                <div className="overflow-x-auto p-3 sm:p-5">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Unit</th>
                        <th>Monthly Rent</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {units.map(({ unit }) => (
                        <tr key={unit.id}>
                          <td data-label="Unit"><span className="font-semibold text-slate-950">Unit {unit.unitNumber}</span></td>
                          <td data-label="Monthly Rent" className="font-semibold text-slate-950">{currency(unit.rentAmount)}</td>
                          <td data-label="Status">
                            <span className={unit.status === 'occupied' ? 'badge badge-green' : 'badge badge-amber'}>
                              {unit.status === 'occupied' ? 'Occupied' : 'Vacant'}
                            </span>
                          </td>
                          <td data-label="Actions">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/units/${unit.id}/edit`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                                Edit
                              </Link>
                              <DeleteButton endpoint={`/api/units/${unit.id}`} confirmMessage="Delete this unit and all linked tenants, payments, and expenses?" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {units.length === 0 && (
                    <p className="py-12 text-center text-sm font-semibold text-slate-500">No units found for this property and filter.</p>
                  )}
                </div>
              </PropertyRecordsModal>
            </article>
          ))}
        </div>
        {propertyCards.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-600">No properties match this filter.</p>
          </div>
        )}
      </section>
    </div>
  )
}
