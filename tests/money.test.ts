import assert from 'node:assert/strict'
import test from 'node:test'
import { MoneyInputError, parseMoneyAmount } from '../lib/money.ts'

test('parses whole UGX money strings exactly', () => {
  assert.equal(parseMoneyAmount('350000'), 350000)
  assert.equal(parseMoneyAmount('350,000'), 350000)
  assert.equal(parseMoneyAmount(' 350 000 '), 350000)
})

test('rejects non-whole or malformed UGX amounts', () => {
  assert.throws(() => parseMoneyAmount('349995.5'), MoneyInputError)
  assert.throws(() => parseMoneyAmount('350k'), MoneyInputError)
  assert.throws(() => parseMoneyAmount(''), MoneyInputError)
})
