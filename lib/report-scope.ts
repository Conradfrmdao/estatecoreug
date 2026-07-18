export type ScopedReportType =
  | 'monthly-rent'
  | 'unpaid-tenants'
  | 'income-expense'
  | 'property-summary'
  | 'property-detail'

export function scopeReportRows<T>(
  rows: T[],
  propertyId: number | null,
  getPropertyId: (row: T) => number
) {
  return propertyId
    ? rows.filter((row) => getPropertyId(row) === propertyId)
    : rows
}

export function scopedReportUrl(
  type: ScopedReportType,
  month: string,
  propertyId?: number | null
) {
  const params = new URLSearchParams({ month })
  if (propertyId) params.set('propertyId', String(propertyId))
  return `/api/reports/${type}?${params.toString()}`
}
