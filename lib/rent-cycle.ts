import type { RentPayment, Tenant, Unit } from '@/drizzle/schema'

export type TenantRentStatus = 'paid' | 'partial' | 'unpaid' | 'upcoming' | 'due_today' | 'overdue'

export type RentPeriod = {
  month: string
  start: Date
  end: Date
}

export type PaymentLike = Pick<
  RentPayment,
  'amountPaid' | 'paymentMonth' | 'monthsCovered'
> & {
  coverageStart?: Date | null
  coverageEnd?: Date | null
}

export type TenantCycleLike = {
  tenant: Tenant
  unit: Unit
}

const dayMs = 24 * 60 * 60 * 1000

export function startOfUtcDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()))
}

export function addMonths(date: Date, months: number) {
  const next = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth() + months,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  ))

  if (next.getUTCDate() !== date.getUTCDate()) {
    next.setUTCDate(0)
  }

  return next
}

export function parseMonth(month: string): RentPeriod {
  const [year, monthNumber] = month.split('-').map(Number)

  if (!year || !monthNumber || monthNumber < 1 || monthNumber > 12) {
    throw new Error(`Invalid payment month: ${month}`)
  }

  const start = new Date(Date.UTC(year, monthNumber - 1, 1))
  return {
    month,
    start,
    end: addMonths(start, 1)
  }
}

export function monthFromDate(date: Date) {
  return date.toISOString().slice(0, 7)
}

export function calculateDueDate(moveInDate: Date, monthsCovered: number) {
  return addMonths(moveInDate, Math.max(1, Math.trunc(monthsCovered)))
}

export function getPaymentCoverage(payment: PaymentLike) {
  const start = payment.coverageStart
    ? new Date(payment.coverageStart)
    : parseMonth(payment.paymentMonth).start
  const monthsCovered = Math.max(1, payment.monthsCovered ?? 1)
  const end = payment.coverageEnd
    ? new Date(payment.coverageEnd)
    : addMonths(start, monthsCovered)

  return { start, end, monthsCovered }
}

export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd
}

export function allocatedPaymentForPeriod(payment: PaymentLike, period: RentPeriod) {
  const coverage = getPaymentCoverage(payment)

  if (!rangesOverlap(coverage.start, coverage.end, period.start, period.end)) {
    return 0
  }

  return Math.round(payment.amountPaid / coverage.monthsCovered)
}

export function calculateTenantPeriodBalance(
  row: TenantCycleLike,
  payments: PaymentLike[],
  period: RentPeriod,
  referenceDate = new Date()
) {
  const moveInDate = new Date(row.tenant.moveInDate)

  if (!row.tenant.active || moveInDate >= period.end) {
    return null
  }

  const amountPaid = payments.reduce(
    (total, payment) => total + allocatedPaymentForPeriod(payment, period),
    0
  )
  const balance = Math.max(row.unit.rentAmount - amountPaid, 0)
  const dueDate = new Date(row.tenant.rentDueDate)
  const referenceDay = startOfUtcDay(referenceDate)
  const dueDay = startOfUtcDay(dueDate)
  const daysUntilDue = Math.ceil((dueDay.getTime() - referenceDay.getTime()) / dayMs)

  let paymentStatus: TenantRentStatus = 'unpaid'
  if (balance <= 0) {
    paymentStatus = 'paid'
  } else if (amountPaid > 0) {
    paymentStatus = 'partial'
  } else if (daysUntilDue > 0 && daysUntilDue <= 5) {
    paymentStatus = 'upcoming'
  } else if (daysUntilDue === 0) {
    paymentStatus = 'due_today'
  } else if (daysUntilDue < 0) {
    paymentStatus = 'overdue'
  }

  return {
    amountPaid,
    balance,
    dueDate,
    daysUntilDue,
    paymentStatus
  }
}
