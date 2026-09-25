import DesktopDashboard from '@/components/dashboard/DesktopDashboard'
import MobileDashboard from '@/components/dashboard/MobileDashboard'
import type {
  CalendarEntry,
  DashboardCalendar,
  DashboardView,
  OwingRow,
  RecentPaymentRow,
  UnitRentRow
} from '@/components/dashboard/types'
import { initialsOf, toneFor } from '@/components/ui/Avatar'
import { rentStatusKind } from '@/components/ui/StatusPill'
import { requireCurrentAppUser } from '@/lib/auth'
import { getDashboardData } from '@/lib/data'
import {
  currency,
  currentPaymentMonth,
  dateKey,
  firstNameFrom,
  formatDate,
  monthLabel,
  monthNameLabel,
  monthShortLabel,
  shiftMonth,
  shortDate
} from '@/lib/format'
import { paymentBillingPeriods } from '@/lib/rent-cycle'

export const dynamic = 'force-dynamic'

function sameMonth(value: Date, month: string) {
  return dateKey(value).slice(0, 7) === month
}

function dayOfMonth(value: Date) {
  return Number(dateKey(value).slice(8, 10))
}

function daysIn(month: string) {
  const [year, monthNumber] = month.split('-').map(Number)
  return new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
}

/** Monday-first grid, padded with the days of the months either side. */
function monthCells(month: string) {
  const [year, monthNumber] = month.split('-').map(Number)
  const offset = (new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay() + 6) % 7
  const total = daysIn(month)
  const previousTotal = daysIn(shiftMonth(month, -1))
  const cells: { day: number; inMonth: boolean }[] = []

  for (let index = offset; index > 0; index -= 1) {
    cells.push({ day: previousTotal - index + 1, inMonth: false })
  }
  for (let day = 1; day <= total; day += 1) {
    cells.push({ day, inMonth: true })
  }
  for (let day = 1; cells.length % 7 !== 0; day += 1) {
    cells.push({ day, inMonth: false })
  }

  return cells
}

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Promise<{ month?: string; property?: string }>
}) {
  const user = await requireCurrentAppUser()
  const params = await searchParams
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(params?.month ?? '') ? params!.month! : currentPaymentMonth()
  const requestedProperty = Number(params?.property)
  const wantsProperty = Number.isInteger(requestedProperty) && requestedProperty > 0
  let scoped = await getDashboardData(user.id, month, wantsProperty ? requestedProperty : null)
  /* An id that is not one of this landlord's properties falls back to all of them. */
  const selectedPropertyId =
    wantsProperty && scoped.allProperties.some((property) => property.id === requestedProperty)
      ? requestedProperty
      : null
  if (wantsProperty && !selectedPropertyId) {
    scoped = await getDashboardData(user.id, month)
  }

  const monthName = monthNameLabel(month)
  const scopeQuery = selectedPropertyId ? `&property=${selectedPropertyId}` : ''

  /* Status counts come from the rent status the app already computed per tenant. */
  const statusCounts = scoped.tenantBalances.reduce(
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

  const balanceByTenant = new Map(scoped.tenantBalances.map((row) => [row.tenant.id, row]))
  const outstandingByTenant = new Map(scoped.outstandingTenants.map((row) => [row.tenant.id, row]))

  const owingRows: OwingRow[] = scoped.outstandingTenants
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

  /* A tenant can owe without being billed for this month - someone who moved
     in on the 20th owes their first rent before "their" month begins - so the
     owing list is folded in as well as the month's bills. */
  const owingOnlyRows: UnitRentRow[] = scoped.outstandingTenants
    .filter((row) => !balanceByTenant.has(row.tenant.id))
    .map((row) => ({
      tenantId: row.tenant.id,
      unitNumber: row.unit.unitNumber,
      propertyName: row.property.name,
      name: row.tenant.fullName,
      rentAmount: row.unit.rentAmount,
      amountPaid: 0,
      owing: row.balance,
      carriedForward: row.carriedForwardBalance,
      statusKind: 'overdue',
      statusDetail: row.periods > 1 ? `${row.periods} mo` : undefined
    }))

  /* One row per tenant billed this month; whoever still owes comes first. */
  const unitRows: UnitRentRow[] = [...scoped.tenantBalances
    .map((row) => {
      const outstanding = outstandingByTenant.get(row.tenant.id)
      const kind = rentStatusKind(row.paymentStatus)
      const statusDetail =
        kind === 'overdue' && outstanding && outstanding.periods > 1
          ? `${outstanding.periods} mo`
          : kind === 'due'
            ? shortDate(row.dueDate)
            : undefined

      return {
        tenantId: row.tenant.id,
        unitNumber: row.unit.unitNumber,
        propertyName: row.property.name,
        name: row.tenant.fullName,
        rentAmount: row.unit.rentAmount,
        amountPaid: row.amountPaid,
        owing: outstanding?.balance ?? 0,
        carriedForward: outstanding?.carriedForwardBalance ?? 0,
        statusKind: kind,
        statusDetail
      } satisfies UnitRentRow
    }), ...owingOnlyRows]
    .sort((a, b) => {
      if ((a.owing > 0) !== (b.owing > 0)) return a.owing > 0 ? -1 : 1
      if (a.owing !== b.owing) return b.owing - a.owing
      return a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true })
    })

  const monthlyExpenses = scoped.expenses.filter(({ expense }) => sameMonth(expense.expenseDate, month))
  const expenseByCategory = new Map<string, number>()
  for (const { expense } of monthlyExpenses) {
    expenseByCategory.set(expense.category, (expenseByCategory.get(expense.category) ?? 0) + expense.amount)
  }
  const largestExpense = Array.from(expenseByCategory.entries()).sort((a, b) => b[1] - a[1])[0]

  /* Money that arrived this month, by the day it arrived. */
  const receivedThisMonth = scoped.payments
    .filter(({ payment }) => sameMonth(payment.paymentDate, month))
    .sort((a, b) => b.payment.paymentDate.getTime() - a.payment.paymentDate.getTime() || b.payment.id - a.payment.id)

  const recentPayments: RecentPaymentRow[] = receivedThisMonth.slice(0, 5).map(({ payment, tenant, unit, property }) => {
    const coverage = paymentBillingPeriods(payment)
    const paidInMonth = dateKey(payment.paymentDate).slice(0, 7)
    const isAdvance = coverage.length > 0 && coverage.every((period) => period.month > paidInMonth)

    return {
      id: payment.id,
      tenantId: tenant.id,
      name: tenant.fullName,
      initials: initialsOf(tenant.fullName),
      tone: toneFor(tenant.id),
      unitNumber: unit.unitNumber,
      propertyName: property.name,
      paidOn: formatDate(payment.paymentDate),
      amount: payment.amountPaid,
      status: isAdvance ? 'in_advance' : payment.balanceAfterPayment > 0 ? 'part_paid' : 'paid',
      balanceAfter: payment.balanceAfterPayment
    }
  })

  /* Calendar: payments by the day they were received, rent by the day it falls
     due, expenses by the day they were paid - all from rows already loaded. */
  const entries: Record<number, CalendarEntry[]> = {}
  const push = (day: number, entry: CalendarEntry) => {
    ;(entries[day] ??= []).push(entry)
  }

  for (const { payment, tenant, unit, property } of receivedThisMonth.slice().reverse()) {
    push(dayOfMonth(payment.paymentDate), {
      key: `payment-${payment.id}`,
      kind: 'payment',
      name: tenant.fullName,
      detail: `Unit ${unit.unitNumber} · ${property.name}`,
      initials: initialsOf(tenant.fullName),
      tone: toneFor(tenant.id),
      amount: payment.amountPaid
    })
  }
  for (const row of scoped.tenantBalances) {
    if (!sameMonth(row.dueDate, month)) continue
    const kind = rentStatusKind(row.paymentStatus)
    if (kind === 'paid') continue
    push(dayOfMonth(row.dueDate), {
      key: `due-${row.tenant.id}`,
      kind: kind === 'overdue' ? 'overdue' : 'due',
      name: row.tenant.fullName,
      detail: `${kind === 'overdue' ? 'Overdue' : kind === 'part_paid' ? 'Part paid' : 'Rent due'} · Unit ${row.unit.unitNumber}`,
      initials: initialsOf(row.tenant.fullName),
      tone: toneFor(row.tenant.id),
      amount: row.balance
    })
  }
  for (const { expense, property, unit } of monthlyExpenses) {
    push(dayOfMonth(expense.expenseDate), {
      key: `expense-${expense.id}`,
      kind: 'expense',
      name: expense.title,
      detail: `${expense.category.charAt(0).toUpperCase()}${expense.category.slice(1)} · ${property.name}${unit ? ` ${unit.unitNumber}` : ''}`,
      initials: '',
      tone: 'plain',
      amount: expense.amount
    })
  }

  const todayKey = dateKey()
  const currentMonth = todayKey.slice(0, 7)
  const paymentDays = new Set(receivedThisMonth.map(({ payment }) => dayOfMonth(payment.paymentDate)))
  const allEntries = Object.values(entries).flat()

  const calendar: DashboardCalendar = {
    month,
    monthLabel: monthLabel(month),
    monthName,
    shortMonth: monthShortLabel(month).split(' ')[0],
    cells: monthCells(month),
    todayDay: currentMonth === month ? Number(todayKey.slice(8, 10)) : null,
    timing: month < currentMonth ? 'past' : month > currentMonth ? 'future' : 'current',
    entries,
    paymentCount: receivedThisMonth.length,
    paymentDayCount: paymentDays.size,
    hasDue: allEntries.some((entry) => entry.kind === 'due'),
    hasOverdue: allEntries.some((entry) => entry.kind === 'overdue'),
    hasExpenses: allEntries.some((entry) => entry.kind === 'expense'),
    prevHref: `/dashboard?month=${shiftMonth(month, -1)}${scopeQuery}`,
    nextHref: `/dashboard?month=${shiftMonth(month, 1)}${scopeQuery}`,
    monthHrefBase: `/dashboard?${selectedPropertyId ? `property=${selectedPropertyId}&` : ''}month=`,
    activeTenantCount: statusCounts.total,
    allPaid: statusCounts.total > 0 && statusCounts.paid === statusCounts.total
  }

  const owingCount = owingRows.length
  const headline =
    statusCounts.total === 0
      ? scoped.summary.totalUnits === 0
        ? 'Add a property and its units to start tracking rent.'
        : `No tenant is billed for ${monthName} yet.`
      : statusCounts.paid === statusCounts.total
        ? statusCounts.total === 1
          ? `Your tenant has paid their ${monthName} rent.`
          : `All ${statusCounts.total} tenants have paid their ${monthName} rent.`
        : owingCount > 0
          ? `${plural(owingCount, 'tenant')} ${owingCount === 1 ? 'owes' : 'owe'} rent - ${currency(scoped.summary.totalOutstanding)} in all.`
          : statusCounts.total === 1
            ? `Your tenant has not paid their ${monthName} rent yet.`
            : `${statusCounts.paid} of ${statusCounts.total} tenants have paid their ${monthName} rent.`

  const selectedProperty = scoped.allProperties.find((property) => property.id === selectedPropertyId)
  const scopeLabel = selectedProperty
    ? selectedProperty.name
    : scoped.allProperties.length === 1
      ? scoped.allProperties[0].name
      : plural(scoped.allProperties.length, 'property', 'properties')

  const view: DashboardView = {
    month,
    monthLabel: monthLabel(month),
    monthName,
    scrubberMonths: [-2, -1, 0, 1, 2].map((offset) => {
      const target = shiftMonth(month, offset)
      return {
        month: target,
        label: offset === 0 ? monthNameLabel(target) : monthShortLabel(target).split(' ')[0],
        isCurrent: offset === 0,
        href: `/dashboard?month=${target}${scopeQuery}`
      }
    }),
    greetingName: firstNameFrom(user.name || user.email),
    headline,
    collectedThisMonth: scoped.summary.collectedThisMonth,
    totalExpected: scoped.summary.totalExpected,
    collectedPercent: scoped.summary.totalExpected
      ? Math.round((scoped.summary.collectedThisMonth / scoped.summary.totalExpected) * 100)
      : 0,
    totalOutstanding: scoped.summary.totalOutstanding,
    carriedForwardTotal: scoped.outstandingTenants.reduce(
      (running, row) => running + row.carriedForwardBalance,
      0
    ),
    expensesThisMonth: scoped.summary.expensesThisMonth,
    largestExpenseCategory: largestExpense
      ? { category: largestExpense[0], amount: largestExpense[1] }
      : null,
    netThisMonth: scoped.summary.netThisMonth,
    statusCounts,
    owingRows,
    fullyPaidCount: statusCounts.paid,
    unitRows,
    recentPayments,
    occupancy: {
      scopeLabel,
      percent: scoped.summary.totalUnits
        ? Math.round((scoped.summary.occupiedUnits / scoped.summary.totalUnits) * 100)
        : 0,
      occupied: scoped.summary.occupiedUnits,
      vacant: scoped.summary.vacantUnits,
      totalUnits: scoped.summary.totalUnits,
      properties: scoped.summary.totalProperties,
      activeTenants: scoped.summary.activeTenants
    },
    calendar,
    properties: scoped.allProperties
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((property) => ({ id: property.id, name: property.name })),
    selectedPropertyId,
    links: {
      payments: `/payments?month=${month}${selectedPropertyId ? `&propertyId=${selectedPropertyId}` : ''}`,
      outstanding: `/reports?month=${month}&status=outstanding#tenant-rent-report`,
      expenses: `/expenses?month=${month}`,
      report: `/reports?month=${month}`
    }
  }

  return (
    <>
      <MobileDashboard view={view} />
      <DesktopDashboard view={view} />
    </>
  )
}
