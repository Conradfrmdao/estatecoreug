import assert from 'node:assert/strict'
import test from 'node:test'
import { getRentDisplayStatus } from '../lib/rent-display.ts'

test('uses outstanding whenever a positive rent balance remains', () => {
  assert.equal(getRentDisplayStatus({ outstandingBalance: 100000, amountPaid: 50000 }), 'outstanding')
})

test('uses paid for a settled tenant with a recorded payment', () => {
  assert.equal(getRentDisplayStatus({ outstandingBalance: 0, hasRecordedPayment: true }), 'paid')
})

test('uses cleared when there is no debt and no payment', () => {
  assert.equal(getRentDisplayStatus({ outstandingBalance: 0 }), 'cleared')
})
