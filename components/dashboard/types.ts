import type { ComposedBalanceData } from '@/components/ui/ComposedBalance'
import type { RentStatusKind } from '@/components/ui/StatusPill'

/**
 * View models for the redesigned dashboard. These are assembled in the page
 * from values getDashboardData already returns — nothing is recalculated here.
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

export type ActivityRow = {
  id: string
  kind: 'payment' | 'advance' | 'expense'
  title: string
  detail: string
  amount: number
}

export type DashboardView = {
  month: string
  monthLabel: string
  monthName: string
  scrubberMonths: { month: string; label: string; isCurrent: boolean }[]
  greetingName: string
  collectedThisMonth: number
  totalExpected: number
  collectedPercent: number
  totalOutstanding: number
  carriedForwardTotal: number
  expensesThisMonth: number
  largestExpenseCategory: { category: string; amount: number } | null
  netThisMonth: number
  portfolio: { label: string; value: number; href: string }[]
  statusCounts: { paid: number; partPaid: number; due: number; overdue: number; total: number }
  owingRows: OwingRow[]
  fullyPaidCount: number
  activity: ActivityRow[]
}
