import type { RentPayment } from '@/drizzle/schema'
import type {
  PaymentWithTenant,
  TenantBalance,
  TenantOutstandingBalance,
  TenantPaymentTarget,
  TenantWithUnit
} from '@/lib/data'
import { dateKey } from './format.ts'
import {
  addMonths,
  billingMonthForCoverage,
  billingMonthForTenantPeriod,
  calculateNextScheduledRentDate,
  calculateOutstandingRentThroughDate,
  calculateTenantPeriodBalance,
  findOldestOutstandingRent,
  inferTenantPaymentTerms,
  outstandingRentForPeriods,
  parseMonth,
  tenantPeriodForBillingMonth,
  type OutstandingMonth
} from './rent-cycle.ts'
import { getRentDisplayStatus, summarizeCarryForward, type OutstandingMonthSummary } from './rent-display.ts'

/*
 * Tenant balances shared by every screen - dashboard, tenants, payments,
 * property pages, reports, notifications and alerts. Kept free of the database
 * so the rules can be tested directly.
 *
 * One rule runs through all of it: a month means the rent *for* that month.
 * The period covering 30 Aug - 30 Sep is September's rent, the same label the
 * receipts, the payments table and "Collected this month" use. For a tenant
 * whose rent falls due in the first half of the month this is exactly the stored
 * period, so their figures are unchanged.
 */

export function groupPaymentsByTenant(paymentRows: Pick<PaymentWithTenant, 'payment'>[]) {
  const paymentsByTenant = new Map<number, RentPayment[]>()

  for (const { payment } of paymentRows) {
    const rows = paymentsByTenant.get(payment.tenantId) ?? []
    rows.push(payment)
    paymentsByTenant.set(payment.tenantId, rows)
  }

  return paymentsByTenant
}

/** Re-key outstanding rent periods by the month the rent is for. */
export function outstandingMonthsByBillingMonth(
  moveInDate: Date,
  months: Pick<OutstandingMonth, 'month' | 'balance'>[]
): OutstandingMonthSummary[] {
  const totals = new Map<string, number>()

  for (const { month, balance } of months) {
    const billingMonth = billingMonthForTenantPeriod(moveInDate, month)
    totals.set(billingMonth, (totals.get(billingMonth) ?? 0) + balance)
  }

  return Array.from(totals, ([month, balance]) => ({ month, balance }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

export function buildTenantBalances(
  tenantRows: TenantWithUnit[],
  paymentRows: Pick<PaymentWithTenant, 'payment'>[],
  month: string,
  referenceDate = new Date()
) {
  const paymentsByTenant = groupPaymentsByTenant(paymentRows)

  return tenantRows
    .filter(({ tenant }) => tenant.active)
    .flatMap((row) => {
      const period = tenantPeriodForBillingMonth(row.tenant.moveInDate, month)
      const balance = calculateTenantPeriodBalance(
        row,
        paymentsByTenant.get(row.tenant.id) ?? [],
        period,
        referenceDate
      )

      if (!balance) {
        return []
      }

      return [{
        ...row,
        ...balance
      } satisfies TenantBalance]
    })
}

export function buildOutstandingTenantBalances(
  tenantRows: TenantWithUnit[],
  paymentRows: Pick<PaymentWithTenant, 'payment'>[],
  referenceDate = new Date()
) {
  const currentMonth = dateKey(referenceDate).slice(0, 7)
  const paymentsByTenant = groupPaymentsByTenant(paymentRows)

  return tenantRows.flatMap((row) => {
    const outstanding = calculateOutstandingRentThroughDate(
      row,
      paymentsByTenant.get(row.tenant.id) ?? [],
      referenceDate
    )

    if (outstanding.balance <= 0 || !outstanding.oldestDueDate) {
      return []
    }

    const outstandingMonths = outstandingMonthsByBillingMonth(row.tenant.moveInDate, outstanding.months)
    const carryForward = summarizeCarryForward(outstandingMonths, currentMonth)

    return [{
      ...row,
      balance: outstanding.balance,
      periods: outstanding.periods,
      oldestDueDate: outstanding.oldestDueDate,
      outstandingMonths,
      carriedForwardBalance: carryForward.carriedForwardBalance,
      carriedForwardMonths: carryForward.carriedForwardMonths,
      currentMonthBalance: carryForward.currentMonthBalance
    } satisfies TenantOutstandingBalance]
  })
}

export function buildTenantPaymentTarget(
  row: TenantWithUnit,
  tenantPayments: RentPayment[],
  referenceDate = new Date()
): TenantPaymentTarget {
  const currentMonth = dateKey(referenceDate).slice(0, 7)
  const target = findOldestOutstandingRent({
    moveInDate: row.tenant.moveInDate,
    billingStartDate: row.tenant.billingStartDate,
    rentAmount: row.unit.rentAmount,
    payments: tenantPayments,
    preferredStartDate: row.tenant.rentDueDate
  })
  const terms = inferTenantPaymentTerms({
    moveInDate: row.tenant.moveInDate,
    billingStartDate: row.tenant.billingStartDate,
    rentDueDate: row.tenant.rentDueDate,
    rentAmount: row.unit.rentAmount,
    payments: tenantPayments,
    paymentTiming: row.tenant.paymentTiming,
    billingCycleMonths: row.tenant.billingCycleMonths
  })
  const outstanding = calculateOutstandingRentThroughDate(row, tenantPayments, referenceDate)
  const targetPeriodBalance = calculateTenantPeriodBalance(
    row,
    tenantPayments,
    parseMonth(target.month),
    referenceDate
  )
  const hasRecordedPayment = tenantPayments.some((payment) => payment.amountPaid > 0)
  const outstandingMonths = outstandingMonthsByBillingMonth(row.tenant.moveInDate, outstanding.months)
  const carryForward = summarizeCarryForward(outstandingMonths, currentMonth)

  return {
    ...row,
    targetMonth: billingMonthForCoverage(target.dueDate, addMonths(target.dueDate, 1)),
    targetDueDate: targetPeriodBalance?.dueDate ?? terms.dueDate,
    targetCoverageStart: target.dueDate,
    nextPaymentDate: calculateNextScheduledRentDate({
      moveInDate: row.tenant.moveInDate,
      billingStartDate: row.tenant.billingStartDate,
      billingCycleMonths: terms.billingCycleMonths,
      rentAmount: row.unit.rentAmount,
      payments: tenantPayments,
      referenceDate
    }),
    targetAmountPaid: target.amountPaid,
    targetBalance: target.balance,
    targetScheduledBalance: outstanding.balance > 0
      ? outstanding.balance
      : outstandingRentForPeriods({
          startMonth: target.month,
          months: terms.billingCycleMonths,
          rentAmount: row.unit.rentAmount,
          payments: tenantPayments
        }),
    totalOutstandingBalance: outstanding.balance,
    totalOutstandingPeriods: outstanding.periods,
    outstandingMonths,
    carriedForwardBalance: carryForward.carriedForwardBalance,
    carriedForwardMonths: carryForward.carriedForwardMonths,
    currentMonthBalance: carryForward.currentMonthBalance,
    displayPaymentStatus: getRentDisplayStatus({
      outstandingBalance: outstanding.balance,
      amountPaid: target.amountPaid,
      hasRecordedPayment
    })
  } satisfies TenantPaymentTarget
}
