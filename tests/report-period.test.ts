import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildReportPeriodSnapshot,
  normalizeReportMonth,
  normalizeReportPeriod
} from '../lib/report-period.ts'

function reportDataFixture() {
  const property = { id: 11, name: 'July Estate', location: 'Kampala' }
  const otherProperty = { id: 12, name: 'Other Estate', location: 'Entebbe' }
  const unit = { id: 21, propertyId: 11, unitNumber: 'A1', rentAmount: 500, status: 'occupied' }
  const otherUnit = { id: 22, propertyId: 12, unitNumber: 'B1', rentAmount: 900, status: 'occupied' }
  const tenant = { id: 31, unitId: 21, fullName: 'July Tenant', phone: '0700000000', active: true }
  const otherTenant = { id: 32, unitId: 22, fullName: 'Other Tenant', phone: '0711111111', active: true }
  const julyPayment = {
    id: 41,
    tenantId: 31,
    unitId: 21,
    amountPaid: 200,
    paymentDate: new Date('2026-07-05T08:00:00.000Z'),
    paymentMethod: 'cash'
  }
  const junePayment = {
    id: 42,
    tenantId: 31,
    unitId: 21,
    amountPaid: 100,
    paymentDate: new Date('2026-06-05T08:00:00.000Z'),
    paymentMethod: 'cash'
  }
  const otherPayment = {
    id: 43,
    tenantId: 32,
    unitId: 22,
    amountPaid: 900,
    paymentDate: new Date('2026-07-05T08:00:00.000Z'),
    paymentMethod: 'cash'
  }

  return {
    properties: [property, otherProperty],
    units: [
      { unit, property },
      { unit: otherUnit, property: otherProperty }
    ],
    tenants: [
      { tenant, unit, property },
      { tenant: otherTenant, unit: otherUnit, property: otherProperty }
    ],
    payments: [
      { payment: julyPayment, tenant, unit, property },
      { payment: junePayment, tenant, unit, property },
      { payment: otherPayment, tenant: otherTenant, unit: otherUnit, property: otherProperty }
    ],
    monthlyPayments: [
      {
        payment: julyPayment,
        tenant,
        unit,
        property,
        allocatedAmount: 200,
        coverageMonth: '2026-07',
        coverageDate: new Date('2026-07-01T00:00:00.000Z')
      },
      {
        payment: otherPayment,
        tenant: otherTenant,
        unit: otherUnit,
        property: otherProperty,
        allocatedAmount: 900,
        coverageMonth: '2026-07',
        coverageDate: new Date('2026-07-01T00:00:00.000Z')
      }
    ],
    expenses: [
      {
        expense: { id: 51, propertyId: 11, amount: 50, category: 'repair', expenseDate: new Date('2026-07-10T08:00:00.000Z') },
        property,
        unit: null
      },
      {
        expense: { id: 52, propertyId: 11, amount: 75, category: 'repair', expenseDate: new Date('2026-06-10T08:00:00.000Z') },
        property,
        unit: null
      }
    ],
    tenantBalances: [
      { tenant, unit, property, amountPaid: 0, balance: 500 },
      { tenant: otherTenant, unit: otherUnit, property: otherProperty, amountPaid: 900, balance: 0 }
    ],
    outstandingTenants: [
      { tenant, unit, property, balance: 800 }
    ]
  } as any
}

test('selected-month reports use billing-month allocations instead of raw tenant balances', () => {
  const snapshot = buildReportPeriodSnapshot(reportDataFixture(), {
    period: 'month',
    month: '2026-07',
    propertyId: 11
  })

  assert.deepEqual(snapshot.summary, {
    expected: 500,
    collected: 200,
    outstanding: 300,
    expenses: 50,
    net: 150,
    paidTenants: 0,
    outstandingTenants: 1,
    tenantCount: 1
  })
  assert.equal(snapshot.tenantRows[0].tenant.fullName, 'July Tenant')
})

test('all-time reports include accumulated balances and all recorded transactions', () => {
  const snapshot = buildReportPeriodSnapshot(reportDataFixture(), {
    period: 'all',
    month: '2026-07',
    propertyId: 11
  })

  assert.equal(snapshot.summary.collected, 300)
  assert.equal(snapshot.summary.outstanding, 800)
  assert.equal(snapshot.summary.expenses, 125)
  assert.equal(snapshot.summary.expected, 1100)
  assert.equal(snapshot.payments.length, 2)
})

test('normalizes report period and month inputs', () => {
  assert.equal(normalizeReportPeriod('all'), 'all')
  assert.equal(normalizeReportPeriod('year'), 'month')
  assert.equal(normalizeReportMonth('2026-07', '2026-08'), '2026-07')
  assert.equal(normalizeReportMonth('not-a-month', '2026-08'), '2026-08')
})
