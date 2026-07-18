import { currency, dateKey, formatDate, monthLabel } from './format.ts'
import { paymentBillingPeriods, type PaymentLike } from './rent-cycle.ts'

export type PaymentPeriod = 'all' | 'day' | 'month' | 'year'

export type PaymentFilterInput = {
  period?: string | null
  date?: string | null
  month?: string | null
  year?: string | null
}

export type PaymentSearchRow = {
  payment: PaymentLike & {
    paymentDate: Date
    paymentMethod: string
    notes?: string | null
  }
  tenant: { fullName: string; email?: string | null }
  unit: { unitNumber: string }
  property: { name: string; location: string }
}

export function normalizePaymentFilters(input: PaymentFilterInput, today = dateKey()) {
  const requestedPeriod = input.period
  const period: PaymentPeriod = ['all', 'day', 'month', 'year'].includes(requestedPeriod ?? '')
    ? requestedPeriod as PaymentPeriod
    : input.date ? 'day' : input.month ? 'month' : input.year ? 'year' : 'all'
  const day = /^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(input.date ?? '')
    ? input.date!
    : today
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(input.month ?? '')
    ? input.month!
    : today.slice(0, 7)
  const year = /^\d{4}$/.test(input.year ?? '')
    ? input.year!
    : today.slice(0, 4)

  return { period, day, month, year }
}

export function paymentReceivedInPeriod(
  paymentDate: Date,
  period: PaymentPeriod,
  filters: { day: string; month: string; year: string }
) {
  const paidDate = dateKey(paymentDate)

  if (period === 'day') return paidDate === filters.day
  if (period === 'month') return paidDate.slice(0, 7) === filters.month
  if (period === 'year') return paidDate.slice(0, 4) === filters.year
  return true
}

export function paymentMatchesSearch(row: PaymentSearchRow, query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  const { payment, tenant, unit, property } = row
  return [
    tenant.fullName,
    tenant.email ?? '',
    unit.unitNumber,
    property.name,
    property.location,
    payment.paymentMonth,
    payment.paymentMethod,
    formatDate(payment.paymentDate),
    String(payment.amountPaid),
    currency(payment.amountPaid),
    ...paymentBillingPeriods(payment).map((period) => monthLabel(period.month)),
    payment.notes ?? ''
  ].some((value) => value.toLowerCase().includes(normalizedQuery))
}
