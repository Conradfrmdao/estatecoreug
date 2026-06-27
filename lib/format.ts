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

export function currentPaymentMonth(date = new Date()) {
  return date.toISOString().slice(0, 7)
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
