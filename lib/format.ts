export function currency(value: number) {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    maximumFractionDigits: 0
  }).format(value)
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-UG', {
    timeZone: 'Africa/Kampala',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value))
}

export function dateKey(value = new Date(), timeZone = 'Africa/Kampala') {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(value)

  const year = parts.find((part) => part.type === 'year')?.value ?? '1970'
  const month = parts.find((part) => part.type === 'month')?.value ?? '01'
  const day = parts.find((part) => part.type === 'day')?.value ?? '01'

  return `${year}-${month}-${day}`
}

export function currentPaymentMonth(date = new Date()) {
  return dateKey(date).slice(0, 7)
}

export function monthLabel(month: string) {
  if (!month) {
    return 'All months'
  }

  const [year, monthNumber] = month.split('-').map(Number)
  if (!year || !monthNumber) {
    return month
  }

  return new Intl.DateTimeFormat('en-UG', {
    month: 'long',
    year: 'numeric'
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)))
}

export function toDateInputValue(value: Date | string | null | undefined) {
  if (!value) {
    return ''
  }

  return new Date(value).toISOString().slice(0, 10)
}

export function monthShortLabel(month: string) {
  if (!month) {
    return 'All months'
  }

  const [year, monthNumber] = month.split('-').map(Number)
  if (!year || !monthNumber) {
    return month
  }

  return new Intl.DateTimeFormat('en-UG', {
    month: 'short',
    year: 'numeric'
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)))
}

export function monthListLabel(months: string[], maxListed = 2) {
  if (months.length === 0) {
    return ''
  }

  const listed = months.slice(0, maxListed).map(monthShortLabel)
  const remaining = months.length - listed.length

  return remaining > 0
    ? `${listed.join(', ')} +${remaining} more`
    : listed.join(', ')
}

/**
 * Digits only, no currency prefix — so the caller controls where "UGX" sits
 * and can render it muted while the figures stay dominant (design §6.13).
 */
export function amountDigits(value: number) {
  return new Intl.NumberFormat('en-UG', { maximumFractionDigits: 0 }).format(
    Math.abs(Math.round(value))
  )
}

/**
 * Abbreviated money, for KPI tiles narrower than ~190px only.
 * Never for a ledger, a form, or a receipt.
 */
export function abbreviatedAmount(value: number) {
  const magnitude = Math.abs(value)

  if (magnitude >= 1_000_000) {
    return { figure: (magnitude / 1_000_000).toFixed(magnitude >= 10_000_000 ? 1 : 2).replace(/\.?0+$/, ''), unit: 'M' }
  }

  if (magnitude >= 1_000) {
    return { figure: (magnitude / 1_000).toFixed(magnitude >= 10_000 ? 0 : 1).replace(/\.0$/, ''), unit: 'K' }
  }

  return { figure: amountDigits(magnitude), unit: '' }
}

/** "September" — the month scrubber label on the mobile dashboard. */
export function monthNameLabel(month: string) {
  const [year, monthNumber] = month.split('-').map(Number)
  if (!year || !monthNumber) {
    return month
  }

  return new Intl.DateTimeFormat('en-UG', { month: 'long' }).format(
    new Date(Date.UTC(year, monthNumber - 1, 1))
  )
}

/** Shifts a YYYY-MM key by a number of months, for the scrubber. */
export function shiftMonth(month: string, delta: number) {
  const [year, monthNumber] = month.split('-').map(Number)
  if (!year || !monthNumber) {
    return month
  }

  const shifted = new Date(Date.UTC(year, monthNumber - 1 + delta, 1))
  return shifted.toISOString().slice(0, 7)
}

/** "15 Sep" — compact enough for a status pill. */
export function shortDate(value: Date | string | null | undefined) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-UG', {
    timeZone: 'Africa/Kampala',
    month: 'short',
    day: 'numeric'
  }).format(new Date(value))
}
