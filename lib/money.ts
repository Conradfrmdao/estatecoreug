export class MoneyInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MoneyInputError'
  }
}

export function parseMoneyAmount(value: unknown, label = 'Amount') {
  const raw = typeof value === 'number'
    ? String(value)
    : String(value ?? '').trim()
  const normalized = raw.replace(/[,\s]/g, '')

  if (!/^\d+$/.test(normalized)) {
    throw new MoneyInputError(`${label} must be a whole UGX amount.`)
  }

  const amount = Number(normalized)
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new MoneyInputError(`${label} must be a positive whole UGX amount.`)
  }

  return amount
}

export function cleanMoneyInput(value: string) {
  return value.replace(/[^\d]/g, '')
}
