import UnitForm from '@/components/UnitForm'
import FormPage from '@/components/shell/FormPage'
import { requireCurrentAppUser } from '@/lib/auth'
import { getUnitForUser } from '@/lib/data'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

type EditUnitPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditUnitPage({ params }: EditUnitPageProps) {
  const user = await requireCurrentAppUser()
  const { id } = await params
  const row = await getUnitForUser(user.id, Number(id))

  if (!row) notFound()

  const { unit } = row

  return (
    <FormPage
      backHref="/units"
      backLabel="Back to units"
      title="Edit Unit"
      subtitle={`Update Unit ${unit.unitNumber}.`}
    >
      <UnitForm
        initialData={{
          id: unit.id,
          propertyId: unit.propertyId,
          unitNumber: unit.unitNumber,
          rentAmount: unit.rentAmount,
          status: unit.status
        }}
      />
    </FormPage>
  )
}
