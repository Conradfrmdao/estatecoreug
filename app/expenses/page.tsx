import DeleteButton from '@/components/DeleteButton'
import { requireCurrentAppUser } from '@/lib/auth'
import { listExpensesForUser } from '@/lib/data'
import { currency, dateKey, formatDate } from '@/lib/format'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type ExpensesPageParams = {
  q?: string
  month?: string
}

export default async function ExpensesPage({
  searchParams
}: {
  searchParams?: Promise<ExpensesPageParams>
}) {
  const user = await requireCurrentAppUser()
  const params = await searchParams
  const q = (params?.q ?? '').trim().toLowerCase()
  const requestedMonth = params?.month ?? ''
  const monthFilter = /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth) ? requestedMonth : ''
  const expenseRows = await listExpensesForUser(user.id)
  const monthRows = monthFilter
    ? expenseRows.filter(({ expense }) => dateKey(expense.expenseDate).slice(0, 7) === monthFilter)
    : expenseRows

  const rows = q
    ? monthRows.filter(({ expense, property, unit }) =>
        [
          expense.title,
          expense.category,
          expense.description ?? '',
          property.name,
          unit?.unitNumber ?? '',
          String(expense.amount),
          currency(expense.amount),
          formatDate(expense.expenseDate)
        ].some((val) => val.toLowerCase().includes(q))
      )
    : monthRows

  const getCategoryBadgeStyles = (category: string) => {
    switch (category.toLowerCase()) {
      case 'renovations':
        return { backgroundColor: '#fef3c7', color: '#d97706' } // Amber
      case 'repairs':
        return { backgroundColor: '#ffe4e6', color: '#e11d48' } // Rose/Red
      case 'cleaning':
        return { backgroundColor: '#e0f2fe', color: '#0284c7' } // Sky Blue
      case 'plumbing':
        return { backgroundColor: '#ccfbf1', color: '#0d9488' } // Teal
      case 'electricity':
        return { backgroundColor: '#fef9c3', color: '#ca8a04' } // Yellow
      default:
        return { backgroundColor: '#f1f5f9', color: '#475569' } // Slate
    }
  }

  return (
    <div className="space-y-6 animate-in">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: '#1a1a2e' }}>Expenses</h1>
          <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>
            Track maintenance, repair, utility, and other property-related costs.
          </p>
        </div>
        <Link
          href="/expenses/new"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition sm:w-auto"
          style={{ backgroundColor: '#00A550', boxShadow: '0 4px 14px rgba(0,165,80,0.3)' }}
        >
          <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
          New Expense
        </Link>
      </section>

      {/* Search */}
      <form method="get" className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row"
        style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {monthFilter && <input type="hidden" name="month" value={monthFilter} />}
        <input
          name="q"
          defaultValue={params?.q ?? ''}
          placeholder="Search expenses by title, property, unit, amount, or category..."
          className="field-input min-w-0 flex-1"
        />
        <button
          className="min-h-11 rounded-lg px-5 py-2 text-sm font-semibold text-white transition sm:w-auto"
          style={{ backgroundColor: '#00A550' }}
        >
          Search
        </button>
        {q && (
          <Link
            href={monthFilter ? `/expenses?month=${monthFilter}` : '/expenses'}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 sm:w-auto"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <section className="overflow-hidden rounded-xl border bg-white"
        style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Expense Details</th>
                <th>Property & Unit</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date Paid</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ expense, property, unit }) => (
                <tr key={expense.id}>
                  <td data-label="Expense Details">
                    <div>
                      <span className="font-semibold block" style={{ color: '#1a1a2e' }}>{expense.title}</span>
                      {expense.description && (
                        <span className="text-xs block text-slate-500 mt-0.5">{expense.description}</span>
                      )}
                    </div>
                  </td>
                  <td data-label="Property & Unit">
                    <div>
                      <span className="font-semibold block" style={{ color: '#1a1a2e' }}>{property.name}</span>
                      {unit && (
                        <span className="text-xs text-slate-500 block">Unit {unit.unitNumber}</span>
                      )}
                    </div>
                  </td>
                  <td data-label="Category">
                    <span className="badge" style={getCategoryBadgeStyles(expense.category)}>
                      {expense.category.toUpperCase()}
                    </span>
                  </td>
                  <td data-label="Amount" className="font-bold text-slate-900">
                    {currency(expense.amount)}
                  </td>
                  <td data-label="Date Paid" style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    {formatDate(expense.expenseDate)}
                  </td>
                  <td data-label="Actions">
                    <div className="flex justify-end items-center gap-2">
                      <Link
                        href={`/expenses/${expense.id}/edit`}
                        className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-slate-50"
                        style={{ borderColor: '#e2e8f0', color: '#374151' }}
                      >
                        Edit
                      </Link>
                      <DeleteButton endpoint={`/api/expenses/${expense.id}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="py-14 text-center">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: '#ffe4e6' }}>
              <svg className="w-6 h-6" fill="none" stroke="#e11d48" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: '#374151' }}>No expenses found</p>
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
              {q ? 'Try a different search term' : 'Add your first property expense to get started'}
            </p>
            {!q && (
              <Link href="/expenses/new"
                className="inline-block mt-4 px-5 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: '#00A550' }}>
                Add Expense
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
