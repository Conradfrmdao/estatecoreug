import type {
  ExpenseWithProperty,
  getDashboardData,
  PaymentWithTenant,
  TenantWithUnit
} from './data'

export type ReportPeriod = 'month' | 'all'

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>

export type ReportTenantRow = TenantWithUnit & {
  expected: number
  amountPaid: number
  balance: number
}

export type ReportPaymentRow = PaymentWithTenant & {
  reportAmount: number
  reportDate: Date
}

export type ReportPeriodSnapshot = {
  period: ReportPeriod
  month: string
  tenantRows: ReportTenantRow[]
  payments: ReportPaymentRow[]
  expenses: ExpenseWithProperty[]
  summary: {
    expected: number
    collected: number
    outstanding: number
    expenses: number
    net: number
    paidTenants: number
    outstandingTenants: number
    tenantCount: number
  }
}

export function normalizeReportPeriod(value: string | null | undefined): ReportPeriod {
  return value === 'all' ? 'all' : 'month'
}

export function normalizeReportMonth(value: string | null | undefined, fallback: string) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value ?? '') ? value as string : fallback
}

function monthKey(value: Date | string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Kampala',
    year: 'numeric',
    month: '2-digit'
  }).formatToParts(new Date(value))
  const year = parts.find((part) => part.type === 'year')?.value ?? '1970'
  const month = parts.find((part) => part.type === 'month')?.value ?? '01'

  return `${year}-${month}`
}

function matchesProperty(propertyId: number | null, rowPropertyId: number) {
  return propertyId === null || propertyId === rowPropertyId
}

export function buildReportPeriodSnapshot(
  data: DashboardData,
  {
    period,
    month,
    propertyId = null
  }: {
    period: ReportPeriod
    month: string
    propertyId?: number | null
  }
): ReportPeriodSnapshot {
  let tenantRows: ReportTenantRow[]
  let payments: ReportPaymentRow[]
  let periodExpenses: ExpenseWithProperty[]

  if (period === 'all') {
    const paidByTenant = new Map<number, number>()
    for (const { payment } of data.payments) {
      paidByTenant.set(
        payment.tenantId,
        (paidByTenant.get(payment.tenantId) ?? 0) + payment.amountPaid
      )
    }

    const outstandingByTenant = new Map(
      data.outstandingTenants.map((row) => [row.tenant.id, row.balance])
    )

    tenantRows = data.tenants
      .filter(({ unit }) => matchesProperty(propertyId, unit.propertyId))
      .map((row) => {
        const amountPaid = paidByTenant.get(row.tenant.id) ?? 0
        const balance = outstandingByTenant.get(row.tenant.id) ?? 0

        return {
          ...row,
          expected: amountPaid + balance,
          amountPaid,
          balance
        }
      })

    payments = data.payments
      .filter(({ unit }) => matchesProperty(propertyId, unit.propertyId))
      .map((row) => ({
        ...row,
        reportAmount: row.payment.amountPaid,
        reportDate: new Date(row.payment.paymentDate)
      }))

    periodExpenses = data.expenses
      .filter(({ expense }) => matchesProperty(propertyId, expense.propertyId))
  } else {
    tenantRows = data.tenantBalances
      .filter(({ unit }) => matchesProperty(propertyId, unit.propertyId))
      .map((row) => ({
        tenant: row.tenant,
        unit: row.unit,
        property: row.property,
        expected: row.unit.rentAmount,
        amountPaid: row.amountPaid,
        balance: row.balance
      }))

    payments = data.monthlyPayments
      .filter(({ unit }) => matchesProperty(propertyId, unit.propertyId))
      .map((row) => ({
        payment: row.payment,
        tenant: row.tenant,
        unit: row.unit,
        property: row.property,
        reportAmount: row.allocatedAmount,
        reportDate: new Date(row.coverageDate)
      }))

    periodExpenses = data.expenses
      .filter(({ expense }) =>
        matchesProperty(propertyId, expense.propertyId) && monthKey(expense.expenseDate) === month
      )
  }

  const expected = tenantRows.reduce((total, row) => total + row.expected, 0)
  const collected = payments.reduce((total, row) => total + row.reportAmount, 0)
  const outstanding = tenantRows.reduce((total, row) => total + row.balance, 0)
  const expenses = periodExpenses.reduce((total, row) => total + row.expense.amount, 0)

  return {
    period,
    month,
    tenantRows,
    payments,
    expenses: periodExpenses,
    summary: {
      expected,
      collected,
      outstanding,
      expenses,
      net: collected - expenses,
      paidTenants: tenantRows.filter((row) => row.amountPaid > 0 && row.balance <= 0).length,
      outstandingTenants: tenantRows.filter((row) => row.balance > 0).length,
      tenantCount: tenantRows.length
    }
  }
}
