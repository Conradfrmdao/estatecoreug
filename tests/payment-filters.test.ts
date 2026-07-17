import assert from 'node:assert/strict'
import test from 'node:test'
import { paymentReceivedInPeriod } from '../lib/payment-filters.ts'

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
