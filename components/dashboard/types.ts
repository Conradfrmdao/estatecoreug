import type { ComposedBalanceData } from '@/components/ui/ComposedBalance'
import type { AvatarTone } from '@/components/ui/Avatar'
import type { RentStatusKind } from '@/components/ui/StatusPill'

/**
 * View models for the dashboard. They are assembled in the page from values
 * getDashboardData already returns - nothing is recalculated here.
 */
export type OwingRow = {
  tenantId: number
  name: string
  initials: string
  propertyName: string
  unitNumber: string
  dueLabel: string
  balance: ComposedBalanceData
  statusKind: RentStatusKind
  statusDetail?: string
}

/** One tenant's rent for the month, for the "Rent paid by unit" card. */
export type UnitRentRow = {
  tenantId: number
  unitNumber: string
  propertyName: string
  name: string
  rentAmount: number
  amountPaid: number
  /** What is still owed, everything due to date - not just this month. */
  owing: number
  carriedForward: number
  statusKind: RentStatusKind
  statusDetail?: string
}

export type RecentPaymentRow = {
  id: number
  tenantId: number
  name: string
  initials: string
  tone: AvatarTone
  unitNumber: string
  propertyName: string
  paidOn: string
  amount: number
  status: 'paid' | 'part_paid' | 'in_advance'
  balanceAfter: number
}

export type CalendarEntry = {
  key: string
  kind: 'payment' | 'due' | 'overdue' | 'expense'
  name: string
  detail: string
  initials: string
  tone: AvatarTone
  amount?: number
}

export type DashboardCalendar = {
  month: string
  monthLabel: string
  monthName: string
  shortMonth: string
  /** Monday-first cells: leading and trailing days belong to the months either side. */
  cells: { day: number; inMonth: boolean }[]
  todayDay: number | null
  /** Before or after the current month, so a day with nothing on it reads right. */
  timing: 'past' | 'current' | 'future'
  entries: Record<number, CalendarEntry[]>
  paymentCount: number
  paymentDayCount: number
  hasDue: boolean
  hasOverdue: boolean
  hasExpenses: boolean
  prevHref: string
  nextHref: string
  monthHrefBase: string
  activeTenantCount: number
  allPaid: boolean
}

export type DashboardView = {
  month: string
  monthLabel: string
  monthName: string
  scrubberMonths: { month: string; label: string; isCurrent: boolean; href: string }[]
  greetingName: string
  headline: string
  collectedThisMonth: number
  totalExpected: number
  collectedPercent: number
  totalOutstanding: number
  carriedForwardTotal: number
  expensesThisMonth: number
  largestExpenseCategory: { category: string; amount: number } | null
  netThisMonth: number
  statusCounts: { paid: number; partPaid: number; due: number; overdue: number; total: number }
  owingRows: OwingRow[]
  fullyPaidCount: number
  unitRows: UnitRentRow[]
  recentPayments: RecentPaymentRow[]
  occupancy: {
    scopeLabel: string
    percent: number
    occupied: number
    vacant: number
    totalUnits: number
    properties: number
    activeTenants: number
  }
  calendar: DashboardCalendar
  properties: { id: number; name: string }[]
  selectedPropertyId: number | null
  links: {
    payments: string
    outstanding: string
    expenses: string
    report: string
  }
}
