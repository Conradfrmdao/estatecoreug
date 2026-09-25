import TenantForm from '@/components/TenantForm'
import FormPage from '@/components/shell/FormPage'
import { requireCurrentAppUser } from '@/lib/auth'
import { getTenantForUser } from '@/lib/data'
import { toDateInputValue } from '@/lib/format'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditTenantPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireCurrentAppUser()
  const { id } = await params
  const tenantId = Number(id)
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
    paymentTiming: row.tenant.paymentTiming === 'arrears' ? 'arrears' as const : 'advance' as const,
    active: row.tenant.active
  }

  return (
    <FormPage
      backHref="/tenants"
      backLabel="Back to tenants"
      title="Edit Tenant"
      subtitle="Update tenant contact information and assignment."
    >
      <TenantForm initialData={initialData} />
    </FormPage>
  )
}
