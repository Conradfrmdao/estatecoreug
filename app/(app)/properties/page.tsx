import DeleteButton from '@/components/DeleteButton'
import PageHeader from '@/components/shell/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import SearchBar from '@/components/ui/SearchBar'
import { requireCurrentAppUser } from '@/lib/auth'
import { listPropertiesForUser, listUnitsForUser } from '@/lib/data'
import { Building2, Eye, MapPin, Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PropertiesPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string }>
}) {
  const user = await requireCurrentAppUser()
  const params = await searchParams
  const q = (params?.q ?? '').trim().toLowerCase()
  const [properties, unitRows] = await Promise.all([
    listPropertiesForUser(user.id),
    listUnitsForUser(user.id)
  ])
  const rows = q
    ? properties.filter((property) =>
        [property.name, property.location].some((value) => value.toLowerCase().includes(q))
      )
    : properties

  const shownUnits = unitRows.filter(({ unit }) => rows.some((property) => property.id === unit.propertyId))
  const vacantCount = shownUnits.filter(({ unit }) => unit.status !== 'occupied').length
  const occupancyNote =
    shownUnits.length === 0
      ? 'No units added yet'
      : vacantCount === 0
        ? 'All units occupied'
        : `${vacantCount} vacant unit${vacantCount === 1 ? '' : 's'}`

  return (
    <div className="page-fill stagger space-y-[22px]">
      <PageHeader
        title="Properties"
        subtitle="Rental houses and buildings in your portfolio."
        actions={
          <Link href="/properties/new" className="btn btn-lg btn-ink max-lg:flex-1">
            <Plus aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
            New Property
          </Link>
        }
      />

      <SearchBar
        action="/properties"
        defaultValue={params?.q ?? ''}
        placeholder="Search by name or location..."
        label="Search by name or location"
        clearHref={q ? '/properties' : undefined}
      />

      <section
        aria-label="Your properties"
        className="flex min-h-[420px] flex-col rounded-[24px] bg-white p-4 sm:px-7 sm:py-6 lg:flex-1 lg:rounded-card"
      >
        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-[38%]">Property</th>
                  <th className="w-[22%]">Location</th>
                  <th className="w-[18%]">Units</th>
                  <th className="w-[22%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((property) => {
                  const unitsForProperty = unitRows.filter(({ unit }) => unit.propertyId === property.id)
                  const occupiedCount = unitsForProperty.filter(({ unit }) => unit.status === 'occupied').length

                  return (
                    <tr key={property.id}>
                      <td data-label="Property" className="!py-[18px]">
                        <div className="flex items-center gap-3.5">
                          <span
                            aria-hidden="true"
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-hi text-[18px] font-extrabold text-ink"
                          >
                            {property.name.trim().charAt(0).toUpperCase()}
                          </span>
                          <Link
                            href={`/properties/${property.id}`}
                            className="min-w-0 text-[15px] font-extrabold leading-5 tracking-[0.01em] text-ink transition hover:text-brand-text"
                          >
                            {property.name}
                          </Link>
                        </div>
                      </td>
                      <td data-label="Location">
                        <span className="flex items-center gap-2 text-[14px] font-semibold leading-5 text-ink-soft">
                          <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={1.9} />
                          {property.location}
                        </span>
                      </td>
                      <td data-label="Units">
                        <span className="flex flex-wrap items-center gap-3">
                          <span className="text-[18px] font-extrabold leading-6 tabular-nums">{unitsForProperty.length}</span>
                          {unitsForProperty.length > 0 && (
                            <span className="badge badge-green">
                              {occupiedCount}/{unitsForProperty.length} occupied
                            </span>
                          )}
                        </span>
                      </td>
                      <td data-label="Actions">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/properties/${property.id}`} className="btn btn-outline text-[13.5px]">
                            <Eye aria-hidden="true" className="h-[17px] w-[17px]" strokeWidth={1.9} />
                            View
                          </Link>
                          <Link href={`/properties/${property.id}/edit`} className="btn btn-outline text-[13.5px]">
                            Edit
                          </Link>
                          <DeleteButton
                            endpoint={`/api/properties/${property.id}`}
                            confirmMessage="Delete this property and all linked units, tenants, payments, and expenses?"
                            className="btn btn-danger text-[13.5px]"
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Building2}
            title="No properties found"
            body={q ? 'Try a different search term' : 'Add your first property to get started'}
            action={
              q ? undefined : (
                <Link href="/properties/new" className="btn btn-lg btn-ink">
                  <Plus aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
                  Add Property
                </Link>
              )
            }
          />
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 rounded-panel bg-canvas px-5 py-4 max-sm:mt-4">
          <span className="text-[13px] font-semibold leading-[18px] text-muted">
            Showing {rows.length} propert{rows.length === 1 ? 'y' : 'ies'}
            {q ? ` for “${params?.q?.trim()}”` : ''}
          </span>
          <span className="flex items-center gap-2 text-[13px] font-bold leading-[18px] text-ink">
            <span
              aria-hidden="true"
              className={`h-2 w-2 rounded-full ${vacantCount > 0 ? 'bg-carried-bar' : 'bg-brand'}`}
            />
            {occupancyNote}
          </span>
        </div>
      </section>
    </div>
  )
}
