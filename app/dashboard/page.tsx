import DesktopDashboard from '@/components/dashboard/DesktopDashboard'
import MobileDashboard from '@/components/dashboard/MobileDashboard'
import type { ActivityRow, DashboardView, OwingRow } from '@/components/dashboard/types'
import { rentStatusKind } from '@/components/ui/StatusPill'
import { requireCurrentAppUser } from '@/lib/auth'
import { getDashboardData } from '@/lib/data'
import {
  currentPaymentMonth,
  dateKey,
  monthLabel,
  monthNameLabel,
  monthShortLabel,
  shiftMonth,
  shortDate
} from '@/lib/format'
import { paymentCoveragePeriods } from '@/lib/rent-cycle'

export const dynamic = 'force-dynamic'

function initialsOf(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function sameMonth(value: Date, month: string) {
  return dateKey(value).slice(0, 7) === month
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Promise<{ month?: string }>
}) {
  const user = await requireCurrentAppUser()
  const params = await searchParams
  const month = params?.month || currentPaymentMonth()
  const data = await getDashboardData(user.id, month)

  /* Status counts come from the rent status the app already computed per tenant. */
  const statusCounts = data.tenantBalances.reduce(
    (running, row) => {
      const kind = rentStatusKind(row.paymentStatus)
      if (kind === 'paid') running.paid += 1
      else if (kind === 'part_paid') running.partPaid += 1
      else if (kind === 'overdue') running.overdue += 1
      else running.due += 1
      running.total += 1
      return running
    },
    { paid: 0, partPaid: 0, due: 0, overdue: 0, total: 0 }
  )

  const balanceByTenant = new Map(data.tenantBalances.map((row) => [row.tenant.id, row]))

  const owingRows: OwingRow[] = data.outstandingTenants
    .slice()
    .sort((a, b) => b.balance - a.balance)
    .map((row) => {
      const periodBalance = balanceByTenant.get(row.tenant.id)
      const kind = periodBalance ? rentStatusKind(periodBalance.paymentStatus) : 'overdue'
      const statusDetail =
        kind === 'overdue'
          ? row.periods > 1
            ? `${row.periods} mo`
            : undefined
          : kind === 'due'
            ? shortDate(periodBalance?.dueDate ?? row.oldestDueDate)
            : undefined

      return {
        tenantId: row.tenant.id,
        name: row.tenant.fullName,
        initials: initialsOf(row.tenant.fullName),
        propertyName: row.property.name,
        unitNumber: row.unit.unitNumber,
        dueLabel: `due ${shortDate(periodBalance?.dueDate ?? row.oldestDueDate)}`,
        balance: {
          total: row.balance,
          currentMonthBalance: row.currentMonthBalance,
          carriedForwardBalance: row.carriedForwardBalance,
          outstandingMonths: row.outstandingMonths,
          currentMonth: month
        },
        statusKind: kind,
        statusDetail
      }
    })

  const monthlyExpenses = data.expenses.filter(({ expense }) => sameMonth(expense.expenseDate, month))
  const expenseByCategory = new Map<string, number>()
  for (const { expense } of monthlyExpenses) {
    expenseByCategory.set(expense.category, (expenseByCategory.get(expense.category) ?? 0) + expense.amount)
  }
  const largestExpense = Array.from(expenseByCategory.entries()).sort((a, b) => b[1] - a[1])[0]

  const activity: ActivityRow[] = [
    ...data.recentPayments
      .filter(({ payment }) => sameMonth(payment.paymentDate, month))
      .map(({ payment, tenant, unit, property }) => {
        const coverage = paymentCoveragePeriods(payment)
        const paidInMonth = dateKey(payment.paymentDate).slice(0, 7)
        const isAdvance = coverage.length > 0 && coverage.every((period) => period.month > paidInMonth)
        const coverageLabel = coverage.map((period) => monthShortLabel(period.month)).join(', ')

        return {
          id: `payment-${payment.id}`,
          kind: (isAdvance ? 'advance' : 'payment') as ActivityRow['kind'],
          title: `${isAdvance ? 'Payment in advance' : 'Payment'} · ${tenant.fullName}`,
          detail: `${property.name} ${unit.unitNumber} · ${coverageLabel} · ${shortDate(payment.paymentDate)}`,
          amount: payment.amountPaid,
          sortKey: payment.paymentDate.getTime()
        }
      }),
    ...monthlyExpenses.slice(0, 5).map(({ expense, property }) => ({
      id: `expense-${expense.id}`,
      kind: 'expense' as ActivityRow['kind'],
      title: `Expense · ${expense.title}`,
      detail: `${property.name} · ${expense.category} · ${shortDate(expense.expenseDate)}`,
      amount: expense.amount,
      sortKey: expense.expenseDate.getTime()
    }))
  ]
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, 4)
    .map(({ sortKey: _sortKey, ...row }) => row)

  const view: DashboardView = {
    month,
    monthLabel: monthLabel(month),
    monthName: monthNameLabel(month),
    scrubberMonths: [-2, -1, 0, 1, 2].map((offset) => {
      const target = shiftMonth(month, offset)
      return {
        month: target,
        label: offset === 0 ? monthNameLabel(target) : monthShortLabel(target).split(' ')[0],
        isCurrent: offset === 0
      }
    }),
    greetingName: user.name.split(' ')[0] || 'Landlord',
    collectedThisMonth: data.summary.collectedThisMonth,
    totalExpected: data.summary.totalExpected,
    collectedPercent: data.summary.totalExpected
      ? Math.round((data.summary.collectedThisMonth / data.summary.totalExpected) * 100)
      : 0,
    totalOutstanding: data.summary.totalOutstanding,
    carriedForwardTotal: data.outstandingTenants.reduce(
      (running, row) => running + row.carriedForwardBalance,
      0
    ),
    expensesThisMonth: data.summary.expensesThisMonth,
    largestExpenseCategory: largestExpense
      ? { category: largestExpense[0], amount: largestExpense[1] }
      : null,
    netThisMonth: data.summary.netThisMonth,
    portfolio: [
      { label: 'Properties', value: data.summary.totalProperties, href: '/properties' },
      { label: 'Units', value: data.summary.totalUnits, href: '/units' },
      { label: 'Occupied', value: data.summary.occupiedUnits, href: '/units?status=occupied' },
      { label: 'Vacant', value: data.summary.vacantUnits, href: '/units?status=vacant' },
      { label: 'Tenants', value: data.summary.activeTenants, href: '/tenants' }
    ],
    statusCounts,
    owingRows,
    fullyPaidCount: statusCounts.paid,
    activity
  }

  return (
    <div className="animate-in">
      <MobileDashboard view={view} />
      <DesktopDashboard view={view} />
    </div>
  )
}
