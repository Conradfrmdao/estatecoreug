import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildFirstPaymentPlan,
  buildFirstPaymentValues,
  planTenantCreation
} from '../lib/tenant-creation.ts'

test('plans tenant creation without requiring a visible payment date', () => {
  const now = new Date('2026-07-01T10:00:00.000Z')
  const plan = planTenantCreation({
    unitId: 9,
    fullName: 'Wagaba Humphrey',
    phone: '+256751000000',
    email: 'tenant@example.com',
    moveInDate: '2026-07-01',
    monthsCovered: 3,
    recordFirstPayment: true,
    paymentAmount: '900,000',
    paymentMethod: 'cash',
    active: true
  }, now)

  assert.equal(plan.rentDueDate.toISOString().slice(0, 10), '2026-10-01')
  assert.equal(plan.paymentDate.toISOString(), now.toISOString())
  assert.equal(plan.monthsCovered, 3)
  assert.equal(plan.paymentTiming, 'advance')
  assert.equal(plan.recordFirstPayment, true)
})

test('builds first payment coverage from move-in to next due date', () => {
  const plan = planTenantCreation({
    unitId: 12,
    fullName: 'Grace Auma',
    phone: '+256700000000',
    moveInDate: '2026-01-31',
    monthsCovered: 1,
    recordFirstPayment: true,
    paymentAmount: '500000',
    paymentMethod: 'mobile_money'
  }, new Date('2026-01-30T12:00:00.000Z'))
  const payment = buildFirstPaymentValues(plan, 44, 500000)

  assert.equal(payment.tenantId, 44)
  assert.equal(payment.unitId, 12)
  assert.equal(payment.paymentMonth, '2026-02')
  assert.equal(payment.coverageStart.toISOString().slice(0, 10), '2026-01-31')
  assert.equal(payment.coverageEnd.toISOString().slice(0, 10), '2026-02-28')
  assert.equal(payment.balanceAfterPayment, 0)
  assert.equal(payment.paymentMethod, 'mobile_money')
  assert.deepEqual(payment.allocations, [{
    month: '2026-01',
    amount: 500000,
    rentAmount: 500000,
    balanceAfterAllocation: 0
  }])
})

test('rejects invalid tenant creation payloads', () => {
  assert.throws(
    () => planTenantCreation({ unitId: 1, fullName: '', phone: '+256700000000', moveInDate: '2026-07-01' }),
    /Unit, name, phone, and move-in date/
  )

  assert.throws(
    () => planTenantCreation({
      unitId: 1,
      fullName: 'No Pay',
      phone: '+256700000000',
      moveInDate: '2026-07-01',
      recordFirstPayment: true,
      paymentAmount: 0
    }),
    /positive whole UGX amount/
  )
})

test('handles malformed optional values safely', () => {
  const plan = planTenantCreation({
    unitId: 2,
    fullName: 'String Flags',
    phone: '+256700000001',
    moveInDate: '2026-07-01',
    monthsCovered: 'bad custom value',
    active: 'false',
    recordFirstPayment: 'false'
  })

  assert.equal(plan.monthsCovered, 1)
  assert.equal(plan.active, false)
  assert.equal(plan.recordFirstPayment, false)
  assert.equal(plan.paymentTiming, 'advance')
  assert.equal(plan.rentDueDate.toISOString().slice(0, 10), '2026-08-01')
})

test('marks move-in rent outstanding when first payment is not recorded', () => {
  const plan = planTenantCreation({
    unitId: 3,
    fullName: 'Outstanding Tenant',
    phone: '+256700000003',
    moveInDate: '2026-07-17',
    monthsCovered: 1,
    paymentTiming: 'advance',
    recordFirstPayment: false
  })

  assert.equal(plan.paymentTiming, 'advance')
  assert.equal(plan.recordFirstPayment, false)
  assert.equal(plan.paymentAmount, 0)
  assert.equal(plan.rentDueDate.toISOString().slice(0, 10), '2026-08-17')
})

test('preserves a multi-month rent period when the first payment is not recorded', () => {
  const plan = planTenantCreation({
    unitId: 4,
    fullName: 'Three Month Tenant',
    phone: '+256700000004',
    moveInDate: '2026-04-30',
    monthsCovered: 3,
    recordFirstPayment: false
  })

  assert.equal(plan.monthsCovered, 3)
  assert.equal(plan.recordFirstPayment, false)
  assert.equal(plan.paymentAmount, 0)
  assert.equal(plan.rentDueDate.toISOString().slice(0, 10), '2026-07-30')
})

test('keeps the selected period end after a partial first payment', () => {
  const plan = planTenantCreation({
    unitId: 5,
    fullName: 'Partial Three Month Tenant',
    phone: '+256700000005',
    moveInDate: '2026-04-30',
    monthsCovered: 3,
    recordFirstPayment: true,
    paymentAmount: 200000
  })
  const firstPayment = buildFirstPaymentPlan(plan, 55, 500000)

  assert.equal(firstPayment.paymentValues.balanceAfterPayment, 300000)
  assert.equal(firstPayment.nextRentDueDate.toISOString().slice(0, 10), '2026-07-30')
})

test('ignores legacy end-of-period input and uses the standard payment flow', () => {
  const plan = planTenantCreation({
    unitId: 7,
    fullName: 'Deferred Tenant',
    phone: '+256700000002',
    moveInDate: '2026-07-01',
    monthsCovered: 3,
    paymentTiming: 'arrears',
    recordFirstPayment: true,
    paymentAmount: '900000'
  })

  assert.equal(plan.paymentTiming, 'advance')
  assert.equal(plan.recordFirstPayment, true)
  assert.equal(plan.paymentAmount, 900000)
  assert.equal(plan.rentDueDate.toISOString().slice(0, 10), '2026-10-01')
})
