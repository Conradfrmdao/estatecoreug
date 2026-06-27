import DeleteButton from '@/components/DeleteButton'
import { requireCurrentAppUser } from '@/lib/auth'
import { listUnitsForUser } from '@/lib/data'
import { currency } from '@/lib/format'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function UnitsPage({
  searchParams
}: {
  searchParams?: { q?: string; status?: string }
}) {
  const user = await requireCurrentAppUser()
  const q = (searchParams?.q ?? '').toLowerCase()
  const statusFilter = searchParams?.status ?? ''

  const unitRows = await listUnitsForUser(user.id)

  const rows = unitRows.filter(({ unit, property }) => {
    if (statusFilter && unit.status !== statusFilter) return false
    if (q) {
      return [unit.unitNumber, unit.status, property.name, property.location]
        .some((v) => v.toLowerCase().includes(q))
    }
    return true
  })

  const occupiedCount = unitRows.filter(({ unit }) => unit.status === 'occupied').length
  const vacantCount = unitRows.filter(({ unit }) => unit.status === 'vacant').length

  return (
    <div className="space-y-6 animate-in">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#1a1a2e' }}>Units</h1>
          <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>
            All rental units across your properties.
          </p>
        </div>
        <Link
          href="/units/new"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition"
          style={{ backgroundColor: '#00A550', boxShadow: '0 4px 14px rgba(0,165,80,0.3)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Unit
        </Link>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4 text-center"
          style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>{unitRows.length}</p>
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>Total Units</p>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center"
          style={{ borderColor: '#e2e8f0', backgroundColor: '#e6f7ef', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p className="text-2xl font-bold" style={{ color: '#007038' }}>{occupiedCount}</p>
          <p className="text-xs mt-1" style={{ color: '#00A550' }}>Occupied</p>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center"
          style={{ borderColor: '#fef3c7', backgroundColor: '#fffbeb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p className="text-2xl font-bold" style={{ color: '#92400e' }}>{vacantCount}</p>
          <p className="text-xs mt-1" style={{ color: '#f59e0b' }}>Vacant</p>
        </div>
      </div>

      {/* Filters */}
      <form method="get" className="flex flex-wrap gap-3 rounded-xl border bg-white p-4"
        style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <input
          name="q"
          defaultValue={searchParams?.q ?? ''}
          placeholder="Search unit, property…"
          className="field-input flex-1 min-w-[180px]"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="field-input w-auto min-w-[140px]"
        >
          <option value="">All statuses</option>
          <option value="occupied">Occupied</option>
          <option value="vacant">Vacant</option>
        </select>
        <button
          className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition"
          style={{ backgroundColor: '#00A550' }}
        >
          Filter
        </button>
        {(q || statusFilter) && (
          <Link href="/units"
            className="rounded-lg px-4 py-2 text-sm font-medium transition"
            style={{ color: '#64748b', border: '1px solid #e2e8f0' }}>
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <section className="overflow-hidden rounded-xl border bg-white"
        style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
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
              {rows.map(({ unit, property }) => (
                <tr key={unit.id}>
                  <td>
                    <span className="font-semibold" style={{ color: '#1a1a2e' }}>
                      Unit {unit.unitNumber}
                    </span>
                  </td>
                  <td style={{ color: '#64748b' }}>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                      </svg>
                      {property.name}
                    </div>
                  </td>
                  <td className="font-semibold" style={{ color: '#1a1a2e' }}>
                    {currency(unit.rentAmount)}
                  </td>
                  <td>
                    {unit.status === 'occupied' ? (
                      <span className="badge badge-green">Occupied</span>
                    ) : (
                      <span className="badge badge-amber">Vacant</span>
                    )}
                  </td>
                  <td>
                    <div className="flex justify-end items-center gap-2">
                      <Link
                        href={`/units/${unit.id}/edit`}
                        className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-slate-50"
                        style={{ borderColor: '#e2e8f0', color: '#374151' }}
                      >
                        Edit
                      </Link>
                      <DeleteButton endpoint={`/api/units/${unit.id}`} />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: '#374151' }}>No units found</p>
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
              {q || statusFilter ? 'Try a different filter' : 'Add your first unit to get started'}
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
