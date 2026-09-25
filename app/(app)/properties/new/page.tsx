import PropertyForm from '@/components/PropertyForm'
import FormPage from '@/components/shell/FormPage'

export default function NewPropertyPage() {
  return (
    <FormPage
      backHref="/properties"
      backLabel="Back to properties"
      title="New Property"
      subtitle="Add a new rental property to your portfolio."
    >
      <PropertyForm />
    </FormPage>
  )
}
