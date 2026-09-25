import assert from 'node:assert/strict'
import test from 'node:test'
import { billingMonthForTenantPeriod, tenantPeriodForBillingMonth } from '../lib/rent-cycle.ts'
import {
  buildOutstandingTenantBalances,
  buildTenantBalances,
  outstandingMonthsByBillingMonth
} from '../lib/tenant-balances.ts'

const property = { id: 1, userId: 1, name: 'Nkrumah Plaza', location: 'Kampala', createdAt: new Date('2026-01-01T00:00:00.000Z') }
const unit = { id: 1, propertyId: 1, unitNumber: 'A1', rentAmount: 500000, status: 'occupied', createdAt: new Date('2026-01-01T00:00:00.000Z') }

function tenantDueOn(day: number, overrides: Record<string, unknown> = {}) {
  const moveIn = new Date(Date.UTC(2026, 5, day))
  return {
    tenant: {
      id: 1,
      unitId: 1,
      fullName: 'Test Tenant',
      phone: '+256700000000',
      email: null,
      moveInDate: moveIn,
      billingStartDate: moveIn,
      rentDueDate: moveIn,
      paymentTiming: 'advance',
      billingCycleMonths: 1,
      active: true,
      createdAt: moveIn,
      ...overrides
    },
    unit,
    property
  }
}

function paymentFor(months: string[], dueDay: number, paymentDate: string) {
  const [year, month] = months[0].split('-').map(Number)
  const start = new Date(Date.UTC(year, month - 1, dueDay))
  return {
    payment: {
      id: 1,
      tenantId: 1,
      unitId: 1,
      amountPaid: 500000 * months.length,
      balanceAfterPayment: 0,
      paymentMonth: months[0],
      coverageStart: start,
      coverageEnd: new Date(Date.UTC(year, month - 1 + months.length, dueDay)),
      monthsCovered: months.length,
      allocations: months.map((entry) => ({ month: entry, amount: 500000, rentAmount: 500000, balanceAfterAllocation: 0 })),
      paymentDate: new Date(paymentDate),
      paymentMethod: 'cash',
      notes: null,
      createdAt: new Date(paymentDate)
    }
  }
}

test('rent due early in the month is labelled by the month it is due in', () => {
  const moveIn = new Date('2026-06-04T00:00:00.000Z')

  for (const month of ['2026-01', '2026-02', '2026-06', '2026-09', '2026-12']) {
    assert.equal(billingMonthForTenantPeriod(moveIn, month), month)
    assert.equal(tenantPeriodForBillingMonth(moveIn, month).month, month)
  }
})

test('rent due on the 30th is labelled by the month it pays for', () => {
  const moveIn = new Date('2026-06-30T00:00:00.000Z')

  // The period stored as August covers 30 Aug - 30 Sep: that is September's rent.
  assert.equal(billingMonthForTenantPeriod(moveIn, '2026-08'), '2026-09')
  assert.equal(tenantPeriodForBillingMonth(moveIn, '2026-09').month, '2026-08')
})

test('month labels stay one-to-one across short months', () => {
  const moveIn = new Date('2026-01-30T00:00:00.000Z')
  const labels = ['2026-01', '2026-02', '2026-03', '2026-04'].map((month) => billingMonthForTenantPeriod(moveIn, month))

  assert.deepEqual(labels, ['2026-02', '2026-03', '2026-04', '2026-05'])
  for (const label of labels) {
    assert.equal(billingMonthForTenantPeriod(moveIn, tenantPeriodForBillingMonth(moveIn, label).month), label)
  }
})

test('"this month" is the same period on the dashboard as in collected rent', () => {
  const row = tenantDueOn(30)
  const payments = [paymentFor(['2026-08'], 30, '2026-08-30T09:00:00.000Z')]
  const [september] = buildTenantBalances([row], payments, '2026-09', new Date('2026-09-10T09:00:00.000Z'))

  // September's balance is the rent covering 30 Aug - 30 Sep, which was paid.
  assert.equal(september.dueDate.toISOString().slice(0, 10), '2026-08-30')
  assert.equal(september.amountPaid, 500000)
  assert.equal(september.paymentStatus, 'paid')
})

test('a tenant due early in the month keeps the same balances as before', () => {
  const row = tenantDueOn(4)
  const payments = [paymentFor(['2026-09'], 4, '2026-09-04T09:00:00.000Z')]
  const [september] = buildTenantBalances([row], payments, '2026-09', new Date('2026-09-10T09:00:00.000Z'))

  assert.equal(september.dueDate.toISOString().slice(0, 10), '2026-09-04')
  assert.equal(september.paymentStatus, 'paid')
})

test('rent owed now is not reported as carried from an earlier month', () => {
  const row = tenantDueOn(30)
  const payments = [paymentFor(['2026-06', '2026-07'], 30, '2026-07-30T09:00:00.000Z')]
  const [owing] = buildOutstandingTenantBalances([row], payments, new Date('2026-09-10T09:00:00.000Z'))

  // The unpaid period due 30 Aug is September's rent: current, not carried.
  assert.deepEqual(owing.outstandingMonths, [{ month: '2026-09', balance: 500000 }])
  assert.equal(owing.currentMonthBalance, 500000)
  assert.equal(owing.carriedForwardBalance, 0)
})

test('rent unpaid from earlier months is still reported as carried', () => {
  const row = tenantDueOn(30)
  const payments = [paymentFor(['2026-06'], 30, '2026-07-30T09:00:00.000Z')]
  const [owing] = buildOutstandingTenantBalances([row], payments, new Date('2026-09-10T09:00:00.000Z'))

  assert.deepEqual(owing.outstandingMonths, [
    { month: '2026-08', balance: 500000 },
    { month: '2026-09', balance: 500000 }
  ])
  assert.equal(owing.carriedForwardBalance, 500000)
  assert.deepEqual(owing.carriedForwardMonths.map(({ month }) => month), ['2026-08'])
})

test('relabelling outstanding months never changes the amount owed', () => {
  const moveIn = new Date('2026-06-30T00:00:00.000Z')
  const months = [
    { month: '2026-06', balance: 500000 },
    { month: '2026-07', balance: 200000 },
    { month: '2026-08', balance: 500000 }
  ]
  const relabelled = outstandingMonthsByBillingMonth(moveIn, months)

  assert.deepEqual(relabelled.map(({ month }) => month), ['2026-07', '2026-08', '2026-09'])
  assert.equal(
    relabelled.reduce((total, entry) => total + entry.balance, 0),
    months.reduce((total, entry) => total + entry.balance, 0)
  )
})
