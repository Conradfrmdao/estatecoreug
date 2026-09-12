export type RentDisplayStatus = 'paid' | 'cleared' | 'outstanding'

export function getRentDisplayStatus({
  outstandingBalance,
  amountPaid = 0,
  hasRecordedPayment = false
}: {
  outstandingBalance: number
  amountPaid?: number
  hasRecordedPayment?: boolean
}): RentDisplayStatus {
  if (outstandingBalance > 0) return 'outstanding'
  if (amountPaid > 0 || hasRecordedPayment) return 'paid'
  return 'cleared'
}

export type OutstandingMonthSummary = {
  month: string
  balance: number
}

export type CarryForwardSummary = {
  total: number
  currentMonthBalance: number
  carriedForwardBalance: number
  carriedForwardMonths: OutstandingMonthSummary[]
  futureBalance: number
}

export function summarizeCarryForward(
  months: OutstandingMonthSummary[],
  currentMonth: string
): CarryForwardSummary {
  const owing = months.filter((entry) => entry.balance > 0)
  const carriedForwardMonths = owing
    .filter((entry) => entry.month < currentMonth)
    .sort((a, b) => a.month.localeCompare(b.month))

  return {
    total: owing.reduce((running, entry) => running + entry.balance, 0),
    currentMonthBalance: owing
      .filter((entry) => entry.month === currentMonth)
      .reduce((running, entry) => running + entry.balance, 0),
    carriedForwardBalance: carriedForwardMonths.reduce((running, entry) => running + entry.balance, 0),
    carriedForwardMonths,
    futureBalance: owing
      .filter((entry) => entry.month > currentMonth)
      .reduce((running, entry) => running + entry.balance, 0)
  }
}
