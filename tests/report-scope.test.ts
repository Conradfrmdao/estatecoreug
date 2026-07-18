import assert from 'node:assert/strict'
import test from 'node:test'
import { scopeReportRows, scopedReportUrl } from '../lib/report-scope.ts'

test('scopes unpaid tenants and expenses to the selected property', () => {
  const rows = [
    { id: 1, propertyId: 11 },
    { id: 2, propertyId: 12 },
    { id: 3, propertyId: 11 }
  ]

  assert.deepEqual(
    scopeReportRows(rows, 11, (row) => row.propertyId).map((row) => row.id),
    [1, 3]
  )
  assert.equal(scopeReportRows(rows, null, (row) => row.propertyId).length, 3)
})

test('adds the selected property to every scoped report download', () => {
  assert.equal(
    scopedReportUrl('unpaid-tenants', '2026-07', 11),
    '/api/reports/unpaid-tenants?month=2026-07&propertyId=11'
  )
  assert.equal(
    scopedReportUrl('income-expense', '2026-07', 11),
    '/api/reports/income-expense?month=2026-07&propertyId=11'
  )
  assert.equal(
    scopedReportUrl('monthly-rent', '2026-07'),
    '/api/reports/monthly-rent?month=2026-07'
  )
})
