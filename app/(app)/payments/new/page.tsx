import PaymentForm from '@/components/PaymentForm'
import FormPage from '@/components/shell/FormPage'

export default function NewPaymentPage() {
  return (
    <FormPage
      backHref="/payments"
      backLabel="Back to payments"
      title="Record Payment"
      subtitle="Log a rent payment received from a tenant."
    >
      <PaymentForm />
    </FormPage>
  )
}
