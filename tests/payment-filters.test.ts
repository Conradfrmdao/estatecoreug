import assert from 'node:assert/strict'
import test from 'node:test'
import {
  normalizePaymentFilters,
  paymentMatchesSearch,
  paymentReceivedInPeriod
} from '../lib/payment-filters.ts'

const filters = { day: '2026-07-18', month: '2026-07', year: '2026' }
const afterKampalaMidnight = new Date('2026-07-17T21:30:00.000Z')

test('filters payment receipts by Kampala day, month, and year', () => {
  assert.equal(paymentReceivedInPeriod(afterKampalaMidnight, 'day', filters), true)
  assert.equal(paymentReceivedInPeriod(afterKampalaMidnight, 'month', filters), true)
  assert.equal(paymentReceivedInPeriod(afterKampalaMidnight, 'year', filters), true)
  assert.equal(paymentReceivedInPeriod(afterKampalaMidnight, 'all', filters), true)
  assert.equal(
    paymentReceivedInPeriod(afterKampalaMidnight, 'day', { ...filters, day: '2026-07-17' }),
    false
  )
})

test('normalizes the same payment filter values used by pages and downloads', () => {
  assert.deepEqual(
    normalizePaymentFilters({
      period: 'month',
      date: '2026-07-18',
      month: '2026-06',
      year: '2025'
    }, '2026-07-18'),
    { period: 'month', day: '2026-07-18', month: '2026-06', year: '2025' }
  )
  assert.deepEqual(
    normalizePaymentFilters({ period: 'invalid', date: 'bad', month: 'bad', year: 'bad' }, '2026-07-18'),
    { period: 'day', day: '2026-07-18', month: '2026-07', year: '2026' }
  )
})

test('matches payment report searches against tenant, property, unit, and amount', () => {
  const row = {
    payment: {
      amountPaid: 650000,
      paymentMonth: '2026-07',
      monthsCovered: 1,
      paymentDate: new Date('2026-07-17T10:00:00.000Z'),
      paymentMethod: 'cash',
      notes: 'front desk'
    },
    tenant: { fullName: 'Sample Tenant', email: 'tenant@example.com' },
    unit: { unitNumber: 'A12' },
    property: { name: 'Central Estate', location: 'Kampala' }
  }

  assert.equal(paymentMatchesSearch(row, 'central'), true)
  assert.equal(paymentMatchesSearch(row, 'A12'), true)
  assert.equal(paymentMatchesSearch(row, '650,000'), true)
  assert.equal(paymentMatchesSearch(row, 'not present'), false)
})
