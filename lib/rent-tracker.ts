import type { Property } from '@/drizzle/schema'
import type { PaymentWithTenant, TenantWithUnit, UnitWithProperty } from '@/lib/data'
import { dateKey } from './format.ts'
import {
  billingMonthForTenantPeriod,
  getPaymentCoverage,
  inferTenantPaymentTerms,
  paymentAllocations,
  paymentCoveragePeriods,
  type PaymentLike,
  type PaymentTiming
} from './rent-cycle.ts'
import { buildOutstandingTenantBalances, buildTenantBalances, groupPaymentsByTenant } from './tenant-balances.ts'

/*
 * The rent tracker: one month's rent, property by property, unit by unit,
 * tenant by tenant. Every figure comes from the same balance rules the rest of
 * the app uses (buildTenantBalances, buildOutstandingTenantBalances) - this
 * only arranges them and explains them, so it can never disagree with the
 * dashboard.
 *
 * "A month" means the rent *for* that month. Some tenants pay it at the start
 * of the month and some at the end, so each tenant carries their own due date
 * and nobody is called late before it has passed.
 */

export type RentTrackerStatus = 'paid' | 'part_paid' | 'not_yet' | 'late'

export type RentTrackerMoney = { month: string; amount: number }

export type RentTrackerTenant = {
  tenantId: number
  name: string
  phone: string
  unitId: number
  unitNumber: string
  propertyId: number
  propertyName: string
  paymentTiming: PaymentTiming
  rent: number
  /** Paid towards this month's rent, whenever it was handed over. */
  paid: number
  /** This month's rent still to come. */
  left: number
  /** YYYY-MM-DD, in Kampala. */
  dueDate: string
  daysUntilDue: number
  status: RentTrackerStatus
  /** Something is still owed and the due date has passed - part paid or not. */
  overdue: boolean
  /** The days money towards this month's rent was handed over, newest first. */
  paidOn: string[]
  /** Money handed over during this month, and which months' rent it went to. */
  receivedInMonth: number
  appliedToEarlier: RentTrackerMoney[]
  appliedAhead: RentTrackerMoney[]
  /** Rent still owed for months before this one, as things stand today. */
  earlierOwed: number
  earlierOwedMonths: RentTrackerMoney[]
}

export type RentTrackerUnit = {
  unitId: number
  unitNumber: string
  rent: number
  tenants: RentTrackerTenant[]
}

export type RentTrackerTimingGroup = {
  timing: PaymentTiming
  tenants: number
  expected: number
  paid: number
  left: number
  paidCount: number
  owingCount: number
  firstDue: string
  lastDue: string
}

/** Everyone whose rent for the month falls due on one day. */
export type RentTrackerDueDate = {
  date: string
  timing: PaymentTiming
  tenants: number
  expected: number
  left: number
  paidCount: number
  owingCount: number
}

export type RentTrackerTotals = {
  tenants: number
  expected: number
  paid: number
  left: number
  paidCount: number
  partCount: number
  notYetCount: number
  /** Everyone past their due date with something left - part paid included. */
  lateCount: number
  /** Everyone with something left, whatever the date. */
  owingCount: number
  lateAmount: number
  receivedInMonth: number
  earlierOwed: number
  earlierOwedCount: number
  /** The last due date this month's rent falls on, or null with no tenants. */
  dueBy: string | null
  byTiming: RentTrackerTimingGroup[]
  dueDates: RentTrackerDueDate[]
}

export type RentTrackerProperty = {
  propertyId: number
  name: string
  location: string
  units: RentTrackerUnit[]
  /** Units with nobody billed for this month. */
  emptyUnits: { unitId: number; unitNumber: string }[]
  totals: RentTrackerTotals
}

export type RentTrackerReport = {
  month: string
  /** YYYY-MM-DD, in Kampala: the day these figures were worked out. */
  today: string
  /** Whether the month is behind, on, or ahead of today. */
  timing: 'past' | 'current' | 'future'
  properties: RentTrackerProperty[]
  totals: RentTrackerTotals
}

function addTo(target: Map<string, number>, month: string, amount: number) {
  if (amount > 0) target.set(month, (target.get(month) ?? 0) + amount)
}

function sortedMoney(totals: Map<string, number>): RentTrackerMoney[] {
  return Array.from(totals, ([month, amount]) => ({ month, amount })).sort((a, b) => a.month.localeCompare(b.month))
}

/**
 * How one payment was shared out, by the month the rent is for. This follows
 * allocatedPaymentForPeriod exactly - the rule the balances use - and only
 * renames each stored period by the tenant's billing month.
 */
export function paymentByBillingMonth(payment: PaymentLike, moveInDate: Date) {
  const shares = new Map<string, number>()
  const allocations = paymentAllocations(payment)

  if (allocations.length > 0) {
    for (const allocation of allocations) {
      addTo(shares, billingMonthForTenantPeriod(moveInDate, allocation.month), allocation.amount)
    }
    return shares
  }

  const share = Math.round(payment.amountPaid / getPaymentCoverage(payment).monthsCovered)
  for (const period of paymentCoveragePeriods(payment)) {
    addTo(shares, billingMonthForTenantPeriod(moveInDate, period.month), share)
  }
  return shares
}

export function summarizeRentTracker(tenants: RentTrackerTenant[]): RentTrackerTotals {
  const groups = new Map<PaymentTiming, RentTrackerTimingGroup>()
  const days = new Map<string, RentTrackerDueDate>()
  let dueBy: string | null = null

  const totals = tenants.reduce(
    (running, row) => {
      running.expected += row.rent
      running.paid += row.paid
      running.left += row.left
      running.receivedInMonth += row.receivedInMonth
      if (row.status === 'paid') running.paidCount += 1
      else if (row.status === 'part_paid') running.partCount += 1
      else running.notYetCount += 1
      if (row.left > 0) running.owingCount += 1
      if (row.overdue) {
        running.lateCount += 1
        running.lateAmount += row.left
      }
      if (row.earlierOwed > 0) {
        running.earlierOwed += row.earlierOwed
        running.earlierOwedCount += 1
      }
      if (!dueBy || row.dueDate > dueBy) dueBy = row.dueDate

      const group = groups.get(row.paymentTiming) ?? {
        timing: row.paymentTiming,
        tenants: 0,
        expected: 0,
        paid: 0,
        left: 0,
        paidCount: 0,
        owingCount: 0,
        firstDue: row.dueDate,
        lastDue: row.dueDate
      }
      group.tenants += 1
      group.expected += row.rent
      group.paid += row.paid
      group.left += row.left
      if (row.left > 0) group.owingCount += 1
      else group.paidCount += 1
      if (row.dueDate < group.firstDue) group.firstDue = row.dueDate
      if (row.dueDate > group.lastDue) group.lastDue = row.dueDate
      groups.set(row.paymentTiming, group)

      const dayKey = `${row.dueDate}:${row.paymentTiming}`
      const day = days.get(dayKey) ?? {
        date: row.dueDate,
        timing: row.paymentTiming,
        tenants: 0,
        expected: 0,
        left: 0,
        paidCount: 0,
        owingCount: 0
      }
      day.tenants += 1
      day.expected += row.rent
      day.left += row.left
      if (row.left > 0) day.owingCount += 1
      else day.paidCount += 1
      days.set(dayKey, day)

      return running
    },
    {
      tenants: tenants.length,
      expected: 0,
      paid: 0,
      left: 0,
      paidCount: 0,
      partCount: 0,
      notYetCount: 0,
      lateCount: 0,
      owingCount: 0,
      lateAmount: 0,
      receivedInMonth: 0,
      earlierOwed: 0,
      earlierOwedCount: 0
    }
  )

  /* Those who pay at the start of the month come first, as their day comes first. */
  const byTiming = (['advance', 'arrears'] as const).flatMap((timing) => {
    const group = groups.get(timing)
    return group ? [group] : []
  })

  const dueDates = Array.from(days.values()).sort(
    (a, b) => a.date.localeCompare(b.date) || a.timing.localeCompare(b.timing)
  )

  return { ...totals, dueBy, byTiming, dueDates }
}

export function buildRentTracker(params: {
  properties: Property[]
  units: UnitWithProperty[]
  tenants: TenantWithUnit[]
  payments: Pick<PaymentWithTenant, 'payment'>[]
  month: string
  referenceDate?: Date
}): RentTrackerReport {
  const referenceDate = params.referenceDate ?? new Date()
  const today = dateKey(referenceDate)
  const currentMonth = today.slice(0, 7)
  const month = params.month
  const paymentsByTenant = groupPaymentsByTenant(params.payments)
  const balances = buildTenantBalances(params.tenants, params.payments, month, referenceDate)
  const outstandingByTenant = new Map(
    buildOutstandingTenantBalances(
      balances.map(({ tenant, unit, property }) => ({ tenant, unit, property })),
      params.payments,
      referenceDate
    ).map((row) => [row.tenant.id, row])
  )

  const tenantRows: RentTrackerTenant[] = balances.map((row) => {
    const tenantPayments = paymentsByTenant.get(row.tenant.id) ?? []
    const moveInDate = new Date(row.tenant.moveInDate)
    const terms = inferTenantPaymentTerms({
      moveInDate,
      billingStartDate: row.tenant.billingStartDate,
      rentDueDate: row.tenant.rentDueDate,
      rentAmount: row.unit.rentAmount,
      payments: tenantPayments,
      paymentTiming: row.tenant.paymentTiming,
      billingCycleMonths: row.tenant.billingCycleMonths
    })

    const paidOn = new Set<string>()
    const earlier = new Map<string, number>()
    const ahead = new Map<string, number>()
    let receivedInMonth = 0

    for (const payment of tenantPayments) {
      const shares = paymentByBillingMonth(payment, moveInDate)
      const received = dateKey(new Date(payment.paymentDate))
      if ((shares.get(month) ?? 0) > 0) paidOn.add(received)
      if (received.slice(0, 7) !== month) continue

      receivedInMonth += payment.amountPaid
      for (const [coveredMonth, amount] of shares) {
        if (coveredMonth < month) addTo(earlier, coveredMonth, amount)
        else if (coveredMonth > month) addTo(ahead, coveredMonth, amount)
      }
    }

    const earlierOwedMonths = (outstandingByTenant.get(row.tenant.id)?.outstandingMonths ?? [])
      .filter((entry) => entry.month < month && entry.balance > 0)
      .map((entry) => ({ month: entry.month, amount: entry.balance }))
    const overdue = row.balance > 0 && row.daysUntilDue < 0
    const status: RentTrackerStatus =
      row.balance <= 0 ? 'paid' : row.amountPaid > 0 ? 'part_paid' : overdue ? 'late' : 'not_yet'

    return {
      tenantId: row.tenant.id,
      name: row.tenant.fullName,
      phone: row.tenant.phone,
      unitId: row.unit.id,
      unitNumber: row.unit.unitNumber,
      propertyId: row.property.id,
      propertyName: row.property.name,
      paymentTiming: terms.paymentTiming,
      rent: row.unit.rentAmount,
      paid: row.amountPaid,
      left: row.balance,
      dueDate: dateKey(row.dueDate),
      daysUntilDue: row.daysUntilDue,
      status,
      overdue,
      paidOn: Array.from(paidOn).sort().reverse(),
      receivedInMonth,
      appliedToEarlier: sortedMoney(earlier),
      appliedAhead: sortedMoney(ahead),
      earlierOwed: earlierOwedMonths.reduce((total, entry) => total + entry.amount, 0),
      earlierOwedMonths
    }
  })

  const byUnitNumber = (a: { unitNumber: string }, b: { unitNumber: string }) =>
    a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true, sensitivity: 'base' })

  const properties: RentTrackerProperty[] = params.properties
    .map((property) => {
      const propertyTenants = tenantRows.filter((row) => row.propertyId === property.id)
      const propertyUnits = params.units
        .filter(({ unit }) => unit.propertyId === property.id)
        .map(({ unit }) => unit)
        .sort(byUnitNumber)

      const units: RentTrackerUnit[] = []
      const emptyUnits: RentTrackerProperty['emptyUnits'] = []
      for (const unit of propertyUnits) {
        const unitTenants = propertyTenants
          .filter((row) => row.unitId === unit.id)
          .sort((a, b) => a.name.localeCompare(b.name))
        if (unitTenants.length > 0) {
          units.push({ unitId: unit.id, unitNumber: unit.unitNumber, rent: unit.rentAmount, tenants: unitTenants })
        } else {
          emptyUnits.push({ unitId: unit.id, unitNumber: unit.unitNumber })
        }
      }

      return {
        propertyId: property.id,
        name: property.name,
        location: property.location,
        units,
        emptyUnits,
        totals: summarizeRentTracker(propertyTenants)
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  return {
    month,
    today,
    timing: month < currentMonth ? 'past' : month > currentMonth ? 'future' : 'current',
    properties,
    totals: summarizeRentTracker(tenantRows)
  }
}
