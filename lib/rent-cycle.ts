import type { RentPayment, RentPaymentAllocation, Tenant, Unit } from '@/drizzle/schema'

export type TenantRentStatus = 'paid' | 'partial' | 'not_due' | 'unpaid' | 'upcoming' | 'due_today' | 'overdue'
export type PaymentTiming = 'advance' | 'arrears'

export function isOutstandingRentStatus(status: TenantRentStatus) {
  return ['partial', 'unpaid', 'due_today', 'overdue'].includes(status)
}

export type TenantPaymentTerms = {
  paymentTiming: PaymentTiming
  billingCycleMonths: number
  coverageStart: Date
  dueDate: Date
}

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
  allocations?: RentPaymentAllocation[] | null
}

export type TenantCycleLike = {
  tenant: Tenant
  unit: Unit
}

const dayMs = 24 * 60 * 60 * 1000
const defaultTimeZone = 'Africa/Kampala'
const tinyBalanceTolerance = 100

export class PaymentAllocationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PaymentAllocationError'
  }
}

function monthIndex(month: string) {
  const [year, monthNumber] = month.split('-').map(Number)
  if (!year || !monthNumber || monthNumber < 1 || monthNumber > 12) {
    throw new Error(`Invalid payment month: ${month}`)
  }

  return year * 12 + monthNumber - 1
}

function compareMonths(a: string, b: string) {
  return monthIndex(a) - monthIndex(b)
}

function nextMonth(month: string) {
  return monthFromDate(addMonths(parseMonth(month).start, 1))
}

function sortedUniqueMonths(months: string[]) {
  return Array.from(new Set(months)).sort(compareMonths)
}

function sanitizeAllocations(value: unknown): RentPaymentAllocation[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((allocation) => {
      if (!allocation || typeof allocation !== 'object') {
        return null
      }

      const row = allocation as Partial<RentPaymentAllocation>
      const month = typeof row.month === 'string' ? row.month : ''
      const amount = Number(row.amount)
      const rentAmount = Number(row.rentAmount)
      const balanceAfterAllocation = Number(row.balanceAfterAllocation)

      try {
        parseMonth(month)
      } catch {
        return null
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        return null
      }

      return {
        month,
        amount: Math.round(amount),
        rentAmount: Number.isFinite(rentAmount) && rentAmount > 0 ? Math.round(rentAmount) : 0,
        balanceAfterAllocation: Number.isFinite(balanceAfterAllocation) && balanceAfterAllocation > 0
          ? Math.round(balanceAfterAllocation)
          : 0
      }
    })
    .filter((allocation): allocation is RentPaymentAllocation => allocation !== null)
}

export function paymentAllocations(payment: PaymentLike) {
  return sanitizeAllocations(payment.allocations)
}

export function startOfUtcDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()))
}

export function dateKeyInTimeZone(value = new Date(), timeZone = defaultTimeZone) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(value)

  const year = parts.find((part) => part.type === 'year')?.value ?? '1970'
  const month = parts.find((part) => part.type === 'month')?.value ?? '01'
  const day = parts.find((part) => part.type === 'day')?.value ?? '01'

  return `${year}-${month}-${day}`
}

export function startOfTimeZoneDay(value: Date, timeZone = defaultTimeZone) {
  return new Date(`${dateKeyInTimeZone(value, timeZone)}T00:00:00.000Z`)
}

export function daysUntilDate(value: Date, referenceDate = new Date(), timeZone = defaultTimeZone) {
  const dueDay = startOfTimeZoneDay(value, timeZone)
  const referenceDay = startOfTimeZoneDay(referenceDate, timeZone)

  return Math.ceil((dueDay.getTime() - referenceDay.getTime()) / dayMs)
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

export function rentDueDateForPeriod(moveInDate: Date, period: RentPeriod) {
  const source = new Date(moveInDate)
  const dueDate = new Date(Date.UTC(
    period.start.getUTCFullYear(),
    period.start.getUTCMonth(),
    source.getUTCDate(),
    source.getUTCHours(),
    source.getUTCMinutes(),
    source.getUTCSeconds(),
    source.getUTCMilliseconds()
  ))

  if (dueDate.getUTCMonth() !== period.start.getUTCMonth()) {
    dueDate.setUTCDate(0)
  }

  return dueDate
}

function monthsBetweenDates(start: Date, end: Date) {
  return Math.max(
    0,
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
      end.getUTCMonth() - start.getUTCMonth()
  )
}

export function inferTenantPaymentTerms(params: {
  moveInDate: Date
  rentDueDate: Date
  rentAmount: number
  payments: PaymentLike[]
  paymentTiming?: string
  billingCycleMonths?: number
}): TenantPaymentTerms {
  const coverageStart = calculateNextRentDueDate({
    moveInDate: params.moveInDate,
    rentAmount: params.rentAmount,
    payments: params.payments
  })
  const dueDate = new Date(params.rentDueDate)
  if (params.paymentTiming === 'advance' || params.paymentTiming === 'arrears') {
    const paymentTiming = params.paymentTiming
    return {
      paymentTiming,
      billingCycleMonths: paymentTiming === 'arrears'
        ? Math.max(1, Math.trunc(params.billingCycleMonths ?? 1))
        : 1,
      coverageStart,
      dueDate: paymentTiming === 'arrears' ? dueDate : coverageStart
    }
  }

  const billingCycleMonths = monthsBetweenDates(coverageStart, dueDate)
  const isArrears = billingCycleMonths > 0 && dueDate.getTime() > coverageStart.getTime()

  return {
    paymentTiming: isArrears ? 'arrears' : 'advance',
    billingCycleMonths: isArrears ? billingCycleMonths : 1,
    coverageStart,
    dueDate: isArrears ? dueDate : coverageStart
  }
}

export function scheduledRentDueDateForPeriod(
  moveInDate: Date,
  period: RentPeriod,
  terms: Pick<TenantPaymentTerms, 'paymentTiming' | 'billingCycleMonths'>
) {
  if (terms.paymentTiming === 'advance') {
    return rentDueDateForPeriod(moveInDate, period)
  }

  const moveInMonth = monthFromDate(moveInDate)
  const monthOffset = Math.max(0, compareMonths(period.month, moveInMonth))
  const cycleMonths = Math.max(1, Math.trunc(terms.billingCycleMonths))
  const cycleEndOffset = (Math.floor(monthOffset / cycleMonths) + 1) * cycleMonths
  return addMonths(moveInDate, cycleEndOffset)
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
  const allocations = paymentAllocations(payment)
  if (allocations.length > 0) {
    return allocations
      .filter((allocation) => allocation.month === period.month)
      .reduce((total, allocation) => total + allocation.amount, 0)
  }

  if (!paymentCoveragePeriods(payment).some((coveredPeriod) => coveredPeriod.month === period.month)) {
    return 0
  }

  return Math.round(payment.amountPaid / getPaymentCoverage(payment).monthsCovered)
}

export function paymentCoveragePeriods(payment: PaymentLike) {
  const allocations = paymentAllocations(payment)
  if (allocations.length > 0) {
    return sortedUniqueMonths(allocations.map((allocation) => allocation.month)).map(parseMonth)
  }

  const coverage = getPaymentCoverage(payment)

  return Array.from({ length: coverage.monthsCovered }, (_, index) =>
    parseMonth(monthFromDate(addMonths(coverage.start, index)))
  )
}

export function paymentCoverageDateForPeriod(payment: PaymentLike, period: RentPeriod) {
  const coverage = getPaymentCoverage(payment)
  const monthOffset =
    (period.start.getUTCFullYear() - coverage.start.getUTCFullYear()) * 12 +
    (period.start.getUTCMonth() - coverage.start.getUTCMonth())

  return addMonths(coverage.start, Math.max(0, monthOffset))
}

function paidByMonth(payments: PaymentLike[]) {
  const totals = new Map<string, number>()

  for (const payment of payments) {
    for (const period of paymentCoveragePeriods(payment)) {
      totals.set(
        period.month,
        (totals.get(period.month) ?? 0) + allocatedPaymentForPeriod(payment, period)
      )
    }
  }

  return totals
}

export function outstandingRentForPeriods(params: {
  startMonth: string
  months: number
  rentAmount: number
  payments: PaymentLike[]
}) {
  const totals = paidByMonth(params.payments)
  let cursor = params.startMonth
  let outstanding = 0

  for (let index = 0; index < Math.max(1, Math.trunc(params.months)); index += 1) {
    outstanding += Math.max(params.rentAmount - (totals.get(cursor) ?? 0), 0)
    cursor = nextMonth(cursor)
  }

  return outstanding
}

export function calculateNextRentDueDate(params: {
  moveInDate: Date
  rentAmount: number
  payments: PaymentLike[]
  maxMonths?: number
}) {
  const totals = paidByMonth(params.payments)
  let cursor = monthFromDate(new Date(params.moveInDate))
  const maxMonths = params.maxMonths ?? 240

  for (let index = 0; index < maxMonths; index += 1) {
    if ((totals.get(cursor) ?? 0) < params.rentAmount) {
      return rentDueDateForPeriod(new Date(params.moveInDate), parseMonth(cursor))
    }

    cursor = nextMonth(cursor)
  }

  return rentDueDateForPeriod(new Date(params.moveInDate), parseMonth(cursor))
}

export function findOldestOutstandingRent(params: {
  moveInDate: Date
  rentAmount: number
  payments: PaymentLike[]
  preferredStartDate?: Date
}) {
  const moveInDate = new Date(params.moveInDate)
  const preferredDate = params.preferredStartDate ? new Date(params.preferredStartDate) : moveInDate
  const startMonth = monthFromDate(moveInDate)
  const preferredMonth = compareMonths(monthFromDate(preferredDate), startMonth) < 0
    ? startMonth
    : monthFromDate(preferredDate)
  const totals = paidByMonth(params.payments)
  let cursor = startMonth

  while (compareMonths(cursor, preferredMonth) <= 0) {
    const paid = totals.get(cursor) ?? 0
    const balance = Math.max(params.rentAmount - paid, 0)
    if (balance > 0) {
      return {
        month: cursor,
        dueDate: rentDueDateForPeriod(moveInDate, parseMonth(cursor)),
        amountPaid: paid,
        balance
      }
    }

    cursor = nextMonth(cursor)
  }

  const paid = totals.get(preferredMonth) ?? 0
  return {
    month: preferredMonth,
    dueDate: rentDueDateForPeriod(moveInDate, parseMonth(preferredMonth)),
    amountPaid: paid,
    balance: Math.max(params.rentAmount - paid, 0)
  }
}

export function buildPaymentAllocationPlan(params: {
  amountPaid: number
  moveInDate: Date
  rentAmount: number
  payments: PaymentLike[]
  preferredStartDate?: Date
  maxMonths?: number
}) {
  const amountPaid = Math.round(params.amountPaid)
  if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
    throw new Error('A positive payment amount is required.')
  }

  const moveInDate = new Date(params.moveInDate)
  const totals = paidByMonth(params.payments)
  const target = findOldestOutstandingRent({
    moveInDate,
    rentAmount: params.rentAmount,
    payments: params.payments,
    preferredStartDate: params.preferredStartDate
  })
  const allocations: RentPaymentAllocation[] = []
  const maxMonths = params.maxMonths ?? 240
  let cursor = target.month
  let remaining = amountPaid

  for (let index = 0; remaining > 0 && index < maxMonths; index += 1) {
    const alreadyPaid = totals.get(cursor) ?? 0
    const balance = Math.max(params.rentAmount - alreadyPaid, 0)

    if (balance > 0) {
      const amount = Math.min(remaining, balance)
      const nextBalance = Math.max(balance - amount, 0)
      allocations.push({
        month: cursor,
        amount,
        rentAmount: params.rentAmount,
        balanceAfterAllocation: nextBalance
      })
      totals.set(cursor, alreadyPaid + amount)
      remaining -= amount
    }

    cursor = nextMonth(cursor)
  }

  if (remaining > 0) {
    throw new Error('Payment allocation is too far into the future.')
  }

  const tinyResidual = allocations.find((allocation) =>
    allocation.balanceAfterAllocation > 0 &&
    allocation.balanceAfterAllocation <= tinyBalanceTolerance
  )

  if (tinyResidual) {
    throw new PaymentAllocationError(
      `This payment leaves only ${tinyResidual.balanceAfterAllocation.toLocaleString('en-UG')} UGX for ${tinyResidual.month}. Enter the exact settling amount instead.`
    )
  }

  const months = sortedUniqueMonths(allocations.map((allocation) => allocation.month))
  const firstMonth = months[0] ?? target.month
  const lastMonth = months[months.length - 1] ?? firstMonth
  const coverageStart = rentDueDateForPeriod(moveInDate, parseMonth(firstMonth))
  const coverageEnd = addMonths(
    coverageStart,
    Math.max(1, compareMonths(lastMonth, firstMonth) + 1)
  )

  return {
    allocations,
    paymentMonth: firstMonth,
    coverageStart,
    coverageEnd,
    monthsCovered: Math.max(1, months.length),
    balanceAfterPayment: allocations[0]?.balanceAfterAllocation ?? target.balance,
    nextRentDueDate: calculateNextRentDueDate({
      moveInDate,
      rentAmount: params.rentAmount,
      payments: [
        ...params.payments,
        {
          amountPaid,
          paymentMonth: firstMonth,
          coverageStart,
          coverageEnd,
          monthsCovered: Math.max(1, months.length),
          allocations
        }
      ]
    }),
    target
  }
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
  const terms = inferTenantPaymentTerms({
    moveInDate,
    rentDueDate: row.tenant.rentDueDate,
    rentAmount: row.unit.rentAmount,
    payments,
    paymentTiming: row.tenant.paymentTiming,
    billingCycleMonths: row.tenant.billingCycleMonths
  })
  const storedDueDate = new Date(row.tenant.rentDueDate)
  const scheduledDueDate = scheduledRentDueDateForPeriod(moveInDate, period, terms)
  const arrearsCoverageStart = parseMonth(monthFromDate(terms.coverageStart)).start
  const arrearsCoverageEnd = addMonths(arrearsCoverageStart, terms.billingCycleMonths)
  const isCurrentArrearsCycle = terms.paymentTiming === 'arrears' &&
    period.start >= arrearsCoverageStart &&
    period.start < arrearsCoverageEnd
  const usesStoredAdvanceDueDate = terms.paymentTiming === 'advance' &&
    monthFromDate(storedDueDate) === period.month
  const dueDate = isCurrentArrearsCycle || usesStoredAdvanceDueDate
    ? storedDueDate
    : scheduledDueDate
  const daysUntilDue = daysUntilDate(dueDate, referenceDate)

  let paymentStatus: TenantRentStatus = 'not_due'
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

export function calculateOutstandingRentThroughDate(
  row: TenantCycleLike,
  payments: PaymentLike[],
  referenceDate = new Date(),
  maxMonths = 240
) {
  const moveInDate = new Date(row.tenant.moveInDate)
  const finalMonth = monthFromDate(startOfTimeZoneDay(referenceDate))
  let cursor = monthFromDate(moveInDate)
  let balance = 0
  let periods = 0
  let oldestDueDate: Date | null = null

  if (!row.tenant.active || moveInDate > referenceDate) {
    return { balance, periods, oldestDueDate }
  }

  for (
    let index = 0;
    compareMonths(cursor, finalMonth) <= 0 && index < maxMonths;
    index += 1
  ) {
    const periodBalance = calculateTenantPeriodBalance(
      row,
      payments,
      parseMonth(cursor),
      referenceDate
    )

    if (periodBalance && isOutstandingRentStatus(periodBalance.paymentStatus)) {
      balance += periodBalance.balance
      periods += 1
      oldestDueDate ??= periodBalance.dueDate
    }

    cursor = nextMonth(cursor)
  }

  return { balance, periods, oldestDueDate }
}
