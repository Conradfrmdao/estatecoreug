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
