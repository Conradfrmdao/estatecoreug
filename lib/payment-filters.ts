import { dateKey } from './format.ts'

export type PaymentPeriod = 'all' | 'day' | 'month' | 'year'

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
