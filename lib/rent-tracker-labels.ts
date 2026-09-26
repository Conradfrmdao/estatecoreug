import { currency, monthNameLabel } from './format.ts'
import type { PaymentTiming } from './rent-cycle.ts'
import type { RentTrackerStatus, RentTrackerTenant } from './rent-tracker.ts'

/*
 * The rent tracker's words, shared by the pop-up and its PDF so both say the
 * same thing. Nothing here calculates - it only describes a tracker row.
 */

export type RentTrackerFilter = 'all' | 'paid' | 'owing' | 'late'

export function normalizeRentTrackerFilter(value: string | null | undefined): RentTrackerFilter {
  return value === 'paid' || value === 'owing' || value === 'late' ? value : 'all'
}

export function rentTrackerRowMatches(row: Pick<RentTrackerTenant, 'left' | 'overdue'>, filter: RentTrackerFilter) {
  if (filter === 'paid') return row.left <= 0
  if (filter === 'owing') return row.left > 0
  if (filter === 'late') return row.overdue
  return true
}

export const rentTrackerFilterLabel: Record<RentTrackerFilter, string> = {
  all: 'Everyone',
  paid: 'Paid',
  owing: 'Not paid yet',
  late: 'Late'
}

export function timingLabel(timing: PaymentTiming) {
  return timing === 'arrears' ? 'Pay at the end of the month' : 'Pay at the start of the month'
}

export function statusLabel(row: Pick<RentTrackerTenant, 'status' | 'overdue' | 'daysUntilDue'>) {
  const labels: Record<RentTrackerStatus, string> = {
    paid: 'Paid',
    part_paid: row.overdue ? 'Part paid · late' : 'Part paid',
    not_yet: row.daysUntilDue === 0 ? 'Due today' : 'Not paid yet',
    late: 'Late'
  }
  return labels[row.status]
}

/** "August", "July and August", "June, July and August". */
function monthList(months: string[]) {
  const names = months.map(monthNameLabel)
  return names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

/** What a landlord needs to know beyond the figures, one sentence each. */
export function rentTrackerNotes(row: RentTrackerTenant, month: string) {
  const notes: string[] = []
  const monthName = monthNameLabel(month)
  const earlier = row.appliedToEarlier.reduce((total, entry) => total + entry.amount, 0)
  const ahead = row.appliedAhead.reduce((total, entry) => total + entry.amount, 0)

  if (earlier > 0) {
    notes.push(
      `${currency(earlier)} handed over in ${monthName} paid for ${monthList(row.appliedToEarlier.map((entry) => entry.month))}.`
    )
  }
  if (ahead > 0) {
    notes.push(`${currency(ahead)} paid ahead for ${monthList(row.appliedAhead.map((entry) => entry.month))}.`)
  }
  if (row.earlierOwed > 0) {
    notes.push(
      `Also owes ${currency(row.earlierOwed)} for ${monthList(row.earlierOwedMonths.map((entry) => entry.month))}.`
    )
  }

  return notes
}
