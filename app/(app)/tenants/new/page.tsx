import TenantForm from '@/components/TenantForm'
import FormPage from '@/components/shell/FormPage'

export default function NewTenantPage() {
  return (
    <FormPage
      backHref="/tenants"
      backLabel="Back to tenants"
      title="New Tenant"
      subtitle="Assign a tenant to an available unit."
    >
      <TenantForm />
    </FormPage>
  )
}
