import PaymentForm from '@/components/PaymentForm'
import FormPage from '@/components/shell/FormPage'
import { requireCurrentAppUser } from '@/lib/auth'
import { getPaymentForUser } from '@/lib/data'
import { toDateInputValue } from '@/lib/format'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditPaymentPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireCurrentAppUser()
  const { id } = await params
  const paymentId = Number(id)
  if (Number.isNaN(paymentId)) {
    notFound()
  }

  const row = await getPaymentForUser(user.id, paymentId)
  if (!row) {
    notFound()
  }

  const initialData = {
    id: row.payment.id,
    tenantId: row.payment.tenantId,
    amountPaid: row.payment.amountPaid,
    paymentMonth: row.payment.paymentMonth,
    coverageStart: toDateInputValue(row.payment.coverageStart),
    coverageEnd: toDateInputValue(row.payment.coverageEnd),
    monthsCovered: row.payment.monthsCovered,
    paymentDate: toDateInputValue(row.payment.paymentDate),
    paymentMethod: row.payment.paymentMethod,
    notes: row.payment.notes
  }

  return (
    <FormPage
      backHref="/payments"
      backLabel="Back to payments"
      title="Edit Payment"
      subtitle="Update the recorded payment details."
    >
      <PaymentForm initialData={initialData} />
    </FormPage>
  )
}
