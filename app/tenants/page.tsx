import DeleteButton from '@/components/DeleteButton'
import { requireCurrentAppUser } from '@/lib/auth'
import { listTenantsForUser } from '@/lib/data'
import { formatDate } from '@/lib/format'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TenantsPage({
  searchParams
}: {
  searchParams?: { q?: string }
}) {
  const user = await requireCurrentAppUser()
  const q = (searchParams?.q ?? '').toLowerCase()
  const tenantRows = await listTenantsForUser(user.id)

  const rows = q
    ? tenantRows.filter(({ tenant, unit, property }) =>
        [tenant.fullName, tenant.phone, tenant.email ?? '', unit.unitNumber, property.name]
          .some((val) => val.toLowerCase().includes(q))
      )
    : tenantRows

  return (
    <div className="space-y-6 animate-in">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: '#1a1a2e' }}>Tenants</h1>
          <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>
            Manage profiles, unit assignments, and contact details of active and inactive tenants.
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

      {/* Search */}
      <form method="get" className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row"
        style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <input
          name="q"
          defaultValue={searchParams?.q ?? ''}
          placeholder="Search by name, phone, unit, or property…"
          className="field-input min-w-0 flex-1"
        />
        <button
          className="min-h-11 rounded-lg px-5 py-2 text-sm font-semibold text-white transition sm:w-auto"
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
                <th>Tenant</th>
                <th>Unit & Property</th>
                <th>Contact</th>
                <th>Move In Date</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ tenant, unit, property }) => (
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
                  <td data-label="Unit & Property">
                    <div>
                      <span className="font-semibold block" style={{ color: '#1a1a2e' }}>Unit {unit.unitNumber}</span>
                      <span className="text-xs text-slate-500 block">{property.name}</span>
                    </div>
                  </td>
                  <td data-label="Contact" style={{ color: '#374151', fontSize: '0.875rem' }}>
                    {tenant.phone}
                  </td>
                  <td data-label="Move In Date" style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    {formatDate(tenant.moveInDate)}
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
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="py-14 text-center">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: '#e6f7ef' }}>
              <svg className="w-6 h-6" fill="none" stroke="#00A550" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: '#374151' }}>No tenants found</p>
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
              {q ? 'Try a different search term' : 'Add your first tenant to get started'}
            </p>
            {!q && (
              <Link href="/tenants/new"
                className="inline-block mt-4 px-5 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: '#00A550' }}>
                Add Tenant
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
