import PropertyForm from '@/components/PropertyForm'
import FormPage from '@/components/shell/FormPage'
import { requireCurrentAppUser } from '@/lib/auth'
import { getPropertyForUser } from '@/lib/data'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

type EditPropertyPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const user = await requireCurrentAppUser()
  const { id } = await params
  const property = await getPropertyForUser(user.id, Number(id))

  if (!property) notFound()

  return (
    <FormPage
      backHref="/properties"
      backLabel="Back to properties"
      title="Edit Property"
      subtitle={`Update details for ${property.name}.`}
    >
      <PropertyForm
        initialData={{
          id: property.id,
          name: property.name,
          location: property.location
        }}
      />
    </FormPage>
  )
}
