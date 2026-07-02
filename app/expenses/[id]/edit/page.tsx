import ExpenseForm from '@/components/ExpenseForm'
import { requireCurrentAppUser } from '@/lib/auth'
import { getExpenseForUser } from '@/lib/data'
import { toDateInputValue } from '@/lib/format'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditExpensePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireCurrentAppUser()
  const { id } = await params
  const expenseId = Number(id)
  if (Number.isNaN(expenseId)) {
    notFound()
  }

  const row = await getExpenseForUser(user.id, expenseId)
  if (!row) {
    notFound()
  }

  const initialData = {
    id: row.expense.id,
    propertyId: row.expense.propertyId,
    unitId: row.expense.unitId,
    title: row.expense.title,
    category: row.expense.category,
    amount: row.expense.amount,
    expenseDate: toDateInputValue(row.expense.expenseDate),
    description: row.expense.description
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6 animate-in">
      <div>
        <Link href="/expenses"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition"
          style={{ color: '#64748b' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to expenses
        </Link>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl" style={{ color: '#1a1a2e' }}>Edit Expense</h1>
        <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>Update the recorded expense details.</p>
      </div>

      <section className="rounded-xl border bg-white p-4 sm:p-6"
        style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <ExpenseForm initialData={initialData} />
      </section>
    </div>
  )
}
