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

test('opens on the requested fallback period when the request names none', () => {
  // The payments screen asks for the current month so a landlord with several
  // properties is not met with an all-time total.
  assert.deepEqual(
    normalizePaymentFilters({ fallbackPeriod: 'month' }, '2026-09-21'),
    { period: 'month', day: '2026-09-21', month: '2026-09', year: '2026' }
  )

  // An explicit choice still wins, so "All time" stays available.
  assert.equal(
    normalizePaymentFilters({ period: 'all', fallbackPeriod: 'month' }, '2026-09-21').period,
    'all'
  )

  // Report downloads pass no fallback and keep the historic all-time default.
  assert.equal(normalizePaymentFilters({}, '2026-09-21').period, 'all')
})
