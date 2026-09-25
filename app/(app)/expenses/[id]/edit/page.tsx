import ExpenseForm from '@/components/ExpenseForm'
import FormPage from '@/components/shell/FormPage'
import { requireCurrentAppUser } from '@/lib/auth'
import { getExpenseForUser } from '@/lib/data'
import { toDateInputValue } from '@/lib/format'
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
    <FormPage
      backHref="/expenses"
      backLabel="Back to expenses"
      title="Edit Expense"
      subtitle="Update the recorded expense details."
    >
      <ExpenseForm initialData={initialData} />
    </FormPage>
  )
}
