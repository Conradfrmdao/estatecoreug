import DeleteButton from '@/components/DeleteButton'
import { requireCurrentAppUser } from '@/lib/auth'
import { listPropertiesForUser, listUnitsForUser } from '@/lib/data'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PropertiesPage({
  searchParams
}: {
  searchParams?: { q?: string }
}) {
  const user = await requireCurrentAppUser()
  const q = (searchParams?.q ?? '').toLowerCase()
  const [properties, unitRows] = await Promise.all([
    listPropertiesForUser(user.id),
    listUnitsForUser(user.id)
  ])
  const rows = q
    ? properties.filter((property) =>
        [property.name, property.location].some((value) => value.toLowerCase().includes(q))
      )
    : properties

  return (
    <div className="space-y-6 animate-in">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#1a1a2e' }}>Properties</h1>
          <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>
            Rental houses and buildings in your portfolio.
          </p>
        </div>
        <Link
          href="/properties/new"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition"
          style={{ backgroundColor: '#00A550', boxShadow: '0 4px 14px rgba(0,165,80,0.3)' }}
        >
          <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
          New Property
        </Link>
      </section>

      {/* Search */}
      <form method="get" className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row"
        style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <input
          name="q"
          defaultValue={searchParams?.q ?? ''}
          placeholder="Search by name or location…"
          className="field-input min-w-0 flex-1"
        />
        <button
          className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition"
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
                <th>Property</th>
                <th>Location</th>
                <th>Units</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((property) => {
                const unitsForProperty = unitRows.filter(({ unit }) => unit.propertyId === property.id)
                const occupiedCount = unitsForProperty.filter(({ unit }) => unit.status === 'occupied').length

                return (
                  <tr key={property.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: '#00A550' }}>
                          {property.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold" style={{ color: '#1a1a2e' }}>{property.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#64748b' }}>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {property.location}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold" style={{ color: '#1a1a2e' }}>{unitsForProperty.length}</span>
                        {unitsForProperty.length > 0 && (
                          <span className="badge badge-green">{occupiedCount}/{unitsForProperty.length} occupied</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-end items-center gap-2">
                        <Link
                          href={`/properties/${property.id}/edit`}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-slate-50"
                          style={{ borderColor: '#e2e8f0', color: '#374151' }}
                        >
                          Edit
                        </Link>
                        <DeleteButton
                          endpoint={`/api/properties/${property.id}`}
                          confirmMessage="Delete this property and all linked units, tenants, payments, and expenses?"
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="py-14 text-center">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: '#e6f7ef' }}>
              <svg className="w-6 h-6" fill="none" stroke="#00A550" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: '#374151' }}>No properties found</p>
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
              {q ? 'Try a different search term' : 'Add your first property to get started'}
            </p>
            {!q && (
              <Link href="/properties/new"
                className="inline-block mt-4 px-5 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: '#00A550' }}>
                Add Property
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
