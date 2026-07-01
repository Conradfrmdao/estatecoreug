import ExpenseForm from '@/components/ExpenseForm'
import Link from 'next/link'

export default function NewExpensePage() {
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
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl" style={{ color: '#1a1a2e' }}>New Expense</h1>
        <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>Record a utility, repair, maintenance, or other cash expense.</p>
      </div>

      <section className="rounded-xl border bg-white p-4 sm:p-6"
        style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <ExpenseForm />
      </section>
    </div>
  )
}
