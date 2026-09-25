import ExpenseForm from '@/components/ExpenseForm'
import FormPage from '@/components/shell/FormPage'

export default function NewExpensePage() {
  return (
    <FormPage
      backHref="/expenses"
      backLabel="Back to expenses"
      title="New Expense"
      subtitle="Record a utility, repair, maintenance, or other cash expense."
    >
      <ExpenseForm />
    </FormPage>
  )
}
