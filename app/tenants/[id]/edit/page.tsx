import TenantForm from '@/components/TenantForm'
import { requireCurrentAppUser } from '@/lib/auth'
import { getTenantForUser } from '@/lib/data'
import { toDateInputValue } from '@/lib/format'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditTenantPage({
  params
}: {
  params: { id: string }
}) {
  const user = await requireCurrentAppUser()
  const tenantId = Number(params.id)
  if (Number.isNaN(tenantId)) {
    notFound()
  }

  const row = await getTenantForUser(user.id, tenantId)
  if (!row) {
    notFound()
  }

  const initialData = {
    id: row.tenant.id,
    unitId: row.tenant.unitId,
    fullName: row.tenant.fullName,
    phone: row.tenant.phone,
    email: row.tenant.email,
    moveInDate: toDateInputValue(row.tenant.moveInDate),
    rentDueDate: toDateInputValue(row.tenant.rentDueDate),
    active: row.tenant.active
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6 animate-in">
      <div>
        <Link href="/tenants"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition"
          style={{ color: '#64748b' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to tenants
        </Link>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl" style={{ color: '#1a1a2e' }}>Edit Tenant</h1>
        <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>Update tenant contact information and assignment.</p>
      </div>

      <section className="rounded-xl border bg-white p-4 sm:p-6"
        style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <TenantForm initialData={initialData} />
      </section>
    </div>
  )
}
