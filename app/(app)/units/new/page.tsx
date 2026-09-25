import UnitForm from '@/components/UnitForm'
import FormPage from '@/components/shell/FormPage'

export default function NewUnitPage() {
  return (
    <FormPage
      backHref="/units"
      backLabel="Back to units"
      title="New Unit"
      subtitle="Add a new rental unit to a property."
    >
      <UnitForm />
    </FormPage>
  )
}
