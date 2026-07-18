import assert from 'node:assert/strict'
import test from 'node:test'
import { formatDate } from '../lib/format.ts'

test('formats property dates using the Kampala calendar day', () => {
  assert.equal(formatDate('2026-06-29T21:00:00.000Z'), '30 Jun 2026')
  assert.equal(formatDate('2026-07-29T21:00:00.000Z'), '30 Jul 2026')
})
