import DeleteButton from '@/components/DeleteButton'
import PageHeader from '@/components/shell/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import SearchBar from '@/components/ui/SearchBar'
import { requireCurrentAppUser } from '@/lib/auth'
import { listExpensesForUser } from '@/lib/data'
import { currency, dateKey, formatDate, monthLabel } from '@/lib/format'
import { Plus, ReceiptText } from 'lucide-react'
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

  const total = rows.reduce((running, { expense }) => running + expense.amount, 0)
  const scopeLabel = monthFilter
    ? `Expenses in ${monthLabel(monthFilter)}`
    : q
      ? 'Matching expenses'
      : 'All recorded expenses'

  return (
    <div className="page-fill stagger space-y-[22px]">
      <PageHeader
        title="Expenses"
        subtitle={
          monthFilter
            ? `Showing ${monthLabel(monthFilter)}. Track maintenance, repair, utility, and other property-related costs.`
            : 'Track maintenance, repair, utility, and other property-related costs.'
        }
        actions={
          <Link href="/expenses/new" className="btn btn-lg btn-ink max-lg:flex-1">
            <Plus aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
            New Expense
          </Link>
        }
      />

      <SearchBar
        action="/expenses"
        defaultValue={params?.q ?? ''}
        placeholder="Search expenses by title, property, unit, amount, or category..."
        label="Search expenses by title, property, unit, amount, or category"
        hidden={monthFilter ? { month: monthFilter } : undefined}
        clearHref={q ? (monthFilter ? `/expenses?month=${monthFilter}` : '/expenses') : undefined}
      />

      <section
        aria-label="Expenses"
        className="flex min-h-[420px] flex-col rounded-[24px] bg-white p-4 sm:px-7 sm:py-6 lg:flex-1 lg:rounded-card"
      >
        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Expense details</th>
                  <th>Property &amp; unit</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date paid</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ expense, property, unit }) => (
                  <tr key={expense.id}>
                    <td data-label="Expense details">
                      <span className="block font-bold text-ink">{expense.title}</span>
                      {expense.description && (
                        <span className="mt-0.5 block text-[12.5px] font-medium text-muted">{expense.description}</span>
                      )}
                    </td>
                    <td data-label="Property & unit">
                      <span className="block font-bold text-ink">{property.name}</span>
                      <span className="block text-[12.5px] font-medium text-muted">
                        {unit ? `Unit ${unit.unitNumber}` : 'Entire property'}
                      </span>
                    </td>
                    <td data-label="Category">
                      <span className={`badge ${categoryTone(expense.category)}`}>{expense.category}</span>
                    </td>
                    <td data-label="Amount" className="font-extrabold tabular-nums text-ink">
                      {currency(expense.amount)}
                    </td>
                    <td data-label="Date paid" className="font-medium text-ink-soft">
                      {formatDate(expense.expenseDate)}
                    </td>
                    <td data-label="Actions">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/expenses/${expense.id}/edit`} className="btn btn-sm btn-outline">
                          Edit
                        </Link>
                        <DeleteButton endpoint={`/api/expenses/${expense.id}`} className="btn btn-sm btn-danger" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={ReceiptText}
            title="No expenses found"
            body={q ? 'Try a different search term' : 'Add your first property expense to get started'}
            action={
              q ? undefined : (
                <Link href="/expenses/new" className="btn btn-lg btn-ink px-[26px]">
                  <Plus aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
                  Add Expense
                </Link>
              )
            }
          >
            {!q && (
              <span className="mt-2 flex flex-wrap items-center justify-center gap-2">
                {['Repairs', 'Renovation', 'Cleaning', 'Plumbing', 'Electricity', 'Other'].map((category) => (
                  <span key={category} className="rounded-full bg-canvas px-3.5 py-[7px] text-[12.5px] font-bold text-ink-soft">
                    {category}
                  </span>
                ))}
              </span>
            )}
          </EmptyState>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 rounded-panel bg-canvas px-5 py-4 max-sm:mt-4">
          <span className="text-[13px] font-semibold leading-[18px] text-muted">
            {scopeLabel}
            {monthFilter && (
              <>
                {' · '}
                <Link href="/expenses" className="font-bold text-brand-text hover:text-ink">
                  Show all months
                </Link>
              </>
            )}
          </span>
          <span className="text-[18px] font-extrabold leading-6 tabular-nums text-ink">{currency(total)}</span>
        </div>
      </section>
    </div>
  )
}

function categoryTone(category: string) {
  switch (category.toLowerCase()) {
    case 'renovation':
    case 'renovations':
      return 'badge-amber'
    case 'repairs':
      return 'badge-red'
    case 'cleaning':
      return 'bg-advance-bg text-advance-fg'
    case 'plumbing':
      return 'badge-green'
    case 'electricity':
      return 'bg-hi text-ink'
    default:
      return 'badge-slate'
  }
}
