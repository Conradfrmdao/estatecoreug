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
