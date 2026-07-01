import assert from 'node:assert/strict'
import test from 'node:test'
import {
  allocatedPaymentForPeriod,
  calculateDueDate,
  calculateTenantPeriodBalance,
  parseMonth
} from '../lib/rent-cycle.ts'

const baseTenant = {
  id: 1,
  unitId: 1,
  fullName: 'Test Tenant',
  phone: '+256700000000',
  email: null,
  moveInDate: new Date('2026-01-10T00:00:00.000Z'),
  rentDueDate: new Date('2026-02-10T00:00:00.000Z'),
  active: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z')
}

const baseUnit = {
  id: 1,
  propertyId: 1,
  unitNumber: 'A1',
  rentAmount: 500000,
  status: 'occupied',
  createdAt: new Date('2026-01-01T00:00:00.000Z')
}

test('calculates due dates from move-in date and paid duration', () => {
  assert.equal(
    calculateDueDate(new Date('2026-01-31T00:00:00.000Z'), 1).toISOString().slice(0, 10),
    '2026-02-28'
  )
  assert.equal(
    calculateDueDate(new Date('2026-01-10T00:00:00.000Z'), 12).toISOString().slice(0, 10),
    '2027-01-10'
  )
})

test('allocates multi-month payments across covered months', () => {
  const payment = {
    amountPaid: 1500000,
    paymentMonth: '2026-01',
    coverageStart: new Date('2026-01-10T00:00:00.000Z'),
    coverageEnd: new Date('2026-04-10T00:00:00.000Z'),
    monthsCovered: 3
  }

  assert.equal(allocatedPaymentForPeriod(payment, parseMonth('2026-01')), 500000)
  assert.equal(allocatedPaymentForPeriod(payment, parseMonth('2026-03')), 500000)
  assert.equal(allocatedPaymentForPeriod(payment, parseMonth('2026-05')), 0)
})

test('marks covered tenant as paid and partial tenant as partial', () => {
  const paid = calculateTenantPeriodBalance(
    { tenant: baseTenant, unit: baseUnit },
    [{
      amountPaid: 500000,
      paymentMonth: '2026-01',
      coverageStart: new Date('2026-01-10T00:00:00.000Z'),
      coverageEnd: new Date('2026-02-10T00:00:00.000Z'),
      monthsCovered: 1
    }],
    parseMonth('2026-01'),
    new Date('2026-01-15T00:00:00.000Z')
  )
  const partial = calculateTenantPeriodBalance(
    { tenant: baseTenant, unit: baseUnit },
    [{
      amountPaid: 200000,
      paymentMonth: '2026-01',
      coverageStart: new Date('2026-01-10T00:00:00.000Z'),
      coverageEnd: new Date('2026-02-10T00:00:00.000Z'),
      monthsCovered: 1
    }],
    parseMonth('2026-01'),
    new Date('2026-01-15T00:00:00.000Z')
  )

  assert.equal(paid?.paymentStatus, 'paid')
  assert.equal(paid?.balance, 0)
  assert.equal(partial?.paymentStatus, 'partial')
  assert.equal(partial?.balance, 300000)
})

test('falls back to paymentMonth for legacy payments without coverage', () => {
  const legacyPayment = {
    amountPaid: 500000,
    paymentMonth: '2026-02',
    coverageStart: null,
    coverageEnd: null,
    monthsCovered: 1
  }

  assert.equal(allocatedPaymentForPeriod(legacyPayment, parseMonth('2026-02')), 500000)
  assert.equal(allocatedPaymentForPeriod(legacyPayment, parseMonth('2026-03')), 0)
})

test('marks unpaid tenants as due today, upcoming, or overdue for alerts', () => {
  const dueToday = calculateTenantPeriodBalance(
    { tenant: { ...baseTenant, rentDueDate: new Date('2026-02-10T00:00:00.000Z') }, unit: baseUnit },
    [],
    parseMonth('2026-02'),
    new Date('2026-02-10T00:00:00.000Z')
  )
  const upcoming = calculateTenantPeriodBalance(
    { tenant: { ...baseTenant, rentDueDate: new Date('2026-02-15T00:00:00.000Z') }, unit: baseUnit },
    [],
    parseMonth('2026-02'),
    new Date('2026-02-10T00:00:00.000Z')
  )
  const overdue = calculateTenantPeriodBalance(
    { tenant: { ...baseTenant, rentDueDate: new Date('2026-02-05T00:00:00.000Z') }, unit: baseUnit },
    [],
    parseMonth('2026-02'),
    new Date('2026-02-10T00:00:00.000Z')
  )

  assert.equal(dueToday?.paymentStatus, 'due_today')
  assert.equal(upcoming?.paymentStatus, 'upcoming')
  assert.equal(overdue?.paymentStatus, 'overdue')
})
