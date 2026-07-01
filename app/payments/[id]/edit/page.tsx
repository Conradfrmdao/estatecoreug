import PaymentForm from '@/components/PaymentForm'
import { requireCurrentAppUser } from '@/lib/auth'
import { getPaymentForUser } from '@/lib/data'
import { toDateInputValue } from '@/lib/format'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditPaymentPage({
  params
}: {
  params: { id: string }
}) {
  const user = await requireCurrentAppUser()
  const paymentId = Number(params.id)
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
    <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6 animate-in">
      <div>
        <Link href="/payments"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition"
          style={{ color: '#64748b' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to payments
        </Link>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl" style={{ color: '#1a1a2e' }}>Edit Payment</h1>
        <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>Update the recorded payment details.</p>
      </div>

      <section className="rounded-xl border bg-white p-4 sm:p-6"
        style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <PaymentForm initialData={initialData} />
      </section>
    </div>
  )
}
