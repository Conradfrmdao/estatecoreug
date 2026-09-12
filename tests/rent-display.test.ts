import assert from 'node:assert/strict'
import test from 'node:test'
import { getRentDisplayStatus, summarizeCarryForward } from '../lib/rent-display.ts'

test('uses outstanding whenever a positive rent balance remains', () => {
  assert.equal(getRentDisplayStatus({ outstandingBalance: 100000, amountPaid: 50000 }), 'outstanding')
})

test('uses paid for a settled tenant with a recorded payment', () => {
  assert.equal(getRentDisplayStatus({ outstandingBalance: 0, hasRecordedPayment: true }), 'paid')
})

test('uses cleared when there is no debt and no payment', () => {
  assert.equal(getRentDisplayStatus({ outstandingBalance: 0 }), 'cleared')
})

test('splits an outstanding balance into carried forward and current month rent', () => {
  const summary = summarizeCarryForward(
    [
      { month: '2026-07', balance: 500000 },
      { month: '2026-08', balance: 500000 },
      { month: '2026-09', balance: 500000 }
    ],
    '2026-09'
  )

  assert.equal(summary.total, 1500000)
  assert.equal(summary.currentMonthBalance, 500000)
  assert.equal(summary.carriedForwardBalance, 1000000)
  assert.deepEqual(summary.carriedForwardMonths.map(({ month }) => month), ['2026-07', '2026-08'])
  assert.equal(summary.futureBalance, 0)
})

test('reports no carry forward when only the current month is unpaid', () => {
  const summary = summarizeCarryForward([{ month: '2026-09', balance: 500000 }], '2026-09')

  assert.equal(summary.carriedForwardBalance, 0)
  assert.deepEqual(summary.carriedForwardMonths, [])
  assert.equal(summary.currentMonthBalance, 500000)
})

test('ignores settled months when summarizing carry forward', () => {
  const summary = summarizeCarryForward(
    [
      { month: '2026-07', balance: 0 },
      { month: '2026-08', balance: 250000 },
      { month: '2026-10', balance: 500000 }
    ],
    '2026-09'
  )

  assert.equal(summary.total, 750000)
  assert.equal(summary.carriedForwardBalance, 250000)
  assert.equal(summary.currentMonthBalance, 0)
  assert.equal(summary.futureBalance, 500000)
})
