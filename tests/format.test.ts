import assert from 'node:assert/strict'
import test from 'node:test'
import { currency, formatDate } from '../lib/format.ts'

test('formats property dates using the Kampala calendar day', () => {
  assert.equal(formatDate('2026-06-29T21:00:00.000Z'), '30 Jun 2026')
  assert.equal(formatDate('2026-07-29T21:00:00.000Z'), '30 Jul 2026')
})

test('writes money as UGX everywhere, matching receipts and reports', () => {
  assert.equal(currency(1250000), 'UGX 1,250,000')
  assert.equal(currency(0), 'UGX 0')
  assert.equal(currency(-450000), '-UGX 450,000')
  assert.equal(currency(999.6), 'UGX 1,000')
  assert.ok(!currency(550000).includes('USh'))
})
