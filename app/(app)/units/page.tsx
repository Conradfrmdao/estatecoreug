import DeleteButton from '@/components/DeleteButton'
import PropertyCard from '@/components/PropertyCard'
import PropertyUnitsModal from '@/components/PropertyUnitsModal'
import PageHeader from '@/components/shell/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import SearchBar from '@/components/ui/SearchBar'
import { requireCurrentAppUser } from '@/lib/auth'
import { listPropertiesForUser, listUnitsForUser } from '@/lib/data'
import { currency, currentPaymentMonth } from '@/lib/format'
import { Building2, Grid2x2, Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type UnitsPageParams = {
  q?: string
  status?: string
}

function CountCard({ value, label, tone }: { value: number; label: string; tone: 'night' | 'mint' | 'white' }) {
  const surface =
    tone === 'night' ? 'bg-night text-white' : tone === 'mint' ? 'bg-mint text-forest' : 'bg-white text-ink'

  return (
    <article className={`relative flex h-[132px] flex-col justify-between overflow-hidden rounded-[24px] px-5 py-[18px] sm:h-40 sm:px-6 sm:py-[22px] lg:rounded-card ${surface}`}>
      {tone === 'night' && (
        <svg aria-hidden="true" width="120" height="110" viewBox="0 0 120 110" className="absolute -right-1.5 -top-2.5">
          <path d="M120 0H46c-4 18 8 28 22 34c18 8 26 24 30 42c4 16 14 26 22 30Z" fill="rgb(var(--c-hi))" opacity="0.18" />
        </svg>
      )}
      <span className="relative text-[36px] font-extrabold leading-[40px] tracking-[-0.03em] tabular-nums sm:text-[44px] sm:leading-[48px]">
        {value}
      </span>
      <span className="relative text-[14px] font-bold leading-5">{label}</span>
    </article>
  )
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
  const filtering = Boolean(q || statusFilter)

  return (
    <div className="stagger space-y-[22px]">
      <PageHeader
        title="Units"
        subtitle="Open a property to view and manage only its units."
        actions={
          <Link href="/units/new" className="btn btn-lg btn-ink max-lg:flex-1">
            <Plus aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
            New Unit
          </Link>
        }
      />

      <section aria-label="Unit counts" className="grid grid-cols-3 gap-2.5 sm:gap-5">
        <CountCard value={unitRows.length} label="Total Units" tone="night" />
        <CountCard value={occupiedCount} label="Occupied" tone="mint" />
        <CountCard value={vacantCount} label="Vacant" tone="white" />
      </section>

      <SearchBar
        action="/units"
        defaultValue={params?.q ?? ''}
        placeholder="Search property, location, unit, or status..."
        label="Search property, location, unit, or status"
        buttonLabel="Filter"
        clearHref={filtering ? '/units' : undefined}
      >
        <label className="sm:w-[180px]">
          <span className="sr-only">Unit status</span>
          <select name="status" defaultValue={statusFilter} className="field-input font-semibold">
            <option value="">All statuses</option>
            <option value="occupied">Occupied</option>
            <option value="vacant">Vacant</option>
          </select>
        </label>
      </SearchBar>

      {filtering && (
        <section aria-label="Unit results" className="space-y-4">
          <div>
            <h2 className="text-[18px] font-extrabold leading-6 text-ink">Unit results</h2>
            <p className="mt-0.5 text-[13px] font-medium text-muted">
              {filteredRows.length} matching unit{filteredRows.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="rounded-[24px] bg-white p-4 sm:px-7 sm:py-6 lg:rounded-card">
            {filteredRows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Unit</th>
                      <th>Property</th>
                      <th>Monthly Rent</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map(({ unit, property }) => (
                      <tr key={unit.id}>
                        <td data-label="Unit">
                          <span className="font-extrabold text-ink">Unit {unit.unitNumber}</span>
                        </td>
                        <td data-label="Property">
                          <Link href={`/properties/${property.id}`} className="font-bold text-brand-text transition hover:text-ink">
                            {property.name}
                          </Link>
                          <span className="mt-0.5 block text-[12.5px] font-medium text-muted">{property.location}</span>
                        </td>
                        <td data-label="Monthly Rent" className="font-bold tabular-nums text-ink">
                          {currency(unit.rentAmount)}
                        </td>
                        <td data-label="Status">
                          <span className={unit.status === 'occupied' ? 'badge badge-green' : 'badge badge-amber'}>
                            {unit.status === 'occupied' ? 'Occupied' : 'Vacant'}
                          </span>
                        </td>
                        <td data-label="Actions">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/units/${unit.id}/edit`} className="btn btn-sm btn-outline">
                              Edit
                            </Link>
                            <DeleteButton
                              endpoint={`/api/units/${unit.id}`}
                              confirmMessage="Delete this unit and all linked tenants, payments, and expenses?"
                              className="btn btn-sm btn-danger"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon={Grid2x2} title="No units found" body="No units match this search and status filter." />
            )}
          </div>
        </section>
      )}

      {!filtering && (
        <section aria-label="Properties" className="space-y-4">
          <h2 className="text-[18px] font-extrabold leading-6 text-ink">Properties</h2>
          {propertyCards.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {propertyCards.map(({ property, allUnits, units, occupiedCount: propertyOccupied, vacantCount: propertyVacant }) => (
                <PropertyCard
                  key={property.id}
                  propertyId={property.id}
                  name={property.name}
                  location={property.location}
                  stats={[
                    { label: 'Units', value: allUnits.length },
                    { label: 'Occupied', value: propertyOccupied, tone: 'mint' },
                    { label: 'Vacant', value: propertyVacant, tone: propertyVacant > 0 ? 'warn' : 'plain' }
                  ]}
                >
                  <PropertyUnitsModal
                    propertyName={property.name}
                    propertyLocation={property.location}
                    units={units.map(({ unit }) => ({
                      id: unit.id,
                      unitNumber: unit.unitNumber,
                      rentAmount: unit.rentAmount,
                      status: unit.status
                    }))}
                    downloadHref={`/api/reports/property-detail?month=${month}&propertyId=${property.id}`}
                  />
                </PropertyCard>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] bg-white lg:rounded-card">
              <EmptyState
                icon={Building2}
                title="No properties yet"
                body="Add a property first, then add its units."
                action={
                  <Link href="/properties/new" className="btn btn-lg btn-ink">
                    <Plus aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
                    Add Property
                  </Link>
                }
              />
            </div>
          )}
        </section>
      )}
    </div>
  )
}
