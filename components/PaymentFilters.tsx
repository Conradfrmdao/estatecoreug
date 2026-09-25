'use client'

import { Filter, Search, X } from 'lucide-react'
import Form from 'next/form'
import Link from 'next/link'
import { useState } from 'react'

type PaymentPeriod = 'all' | 'day' | 'month' | 'year'

export default function PaymentFilters({
  properties,
  availableYears,
  initialQuery,
  initialPropertyId,
  initialPeriod,
  initialDate,
  initialMonth,
  initialYear
}: {
  properties: Array<{ id: number; name: string }>
  availableYears: string[]
  initialQuery: string
  initialPropertyId: string
  initialPeriod: PaymentPeriod
  initialDate: string
  initialMonth: string
  initialYear: string
}) {
  const [period, setPeriod] = useState<PaymentPeriod>(initialPeriod)

  return (
    <Form
      action="/payments"
      aria-label="Filter payments"
      className="grid gap-3.5 rounded-[24px] bg-white p-4 sm:px-6 sm:py-5 lg:rounded-card xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_150px_190px_auto_auto] xl:items-end"
    >
      <label className="flex min-w-0 flex-col gap-2">
        <span className="text-[12.5px] font-bold leading-4 text-muted">Search payments</span>
        <span className="search-field">
          <Search aria-hidden="true" className="h-[17px] w-[17px] shrink-0" strokeWidth={2} />
          <input name="q" type="search" defaultValue={initialQuery} placeholder="Tenant, unit, amount, or method" autoComplete="off" />
        </span>
      </label>

      <label className="flex min-w-0 flex-col gap-2">
        <span className="text-[12.5px] font-bold leading-4 text-muted">Property</span>
        <select name="propertyId" defaultValue={initialPropertyId} className="field-input">
          <option value="">All properties</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>{property.name}</option>
          ))}
        </select>
      </label>

      <label className="flex min-w-0 flex-col gap-2">
        <span className="text-[12.5px] font-bold leading-4 text-muted">Period</span>
        <select
          name="period"
          value={period}
          onChange={(event) => setPeriod(event.target.value as PaymentPeriod)}
          className="field-input"
        >
          <option value="all">All time</option>
          <option value="day">Day</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </label>

      <label className="flex min-w-0 flex-col gap-2">
        <span className="text-[12.5px] font-bold leading-4 text-muted">{period === 'all' ? 'Date' : `Select ${period}`}</span>
        {period === 'day' && <input name="date" type="date" defaultValue={initialDate} className="field-input" />}
        {period === 'month' && <input name="month" type="month" defaultValue={initialMonth} className="field-input" />}
        {period === 'year' && (
          <select name="year" defaultValue={initialYear} className="field-input">
            {availableYears.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        )}
        {period === 'all' && <div className="field-input font-semibold text-muted">All recorded dates</div>}
      </label>

      <div className="grid grid-cols-2 gap-3 xl:contents">
        <button type="submit" className="btn btn-lg btn-hi px-[22px]">
          <Filter aria-hidden="true" className="h-[17px] w-[17px]" strokeWidth={2} />
          Filter
        </button>

        <Link href="/payments" className="btn btn-lg btn-outline">
          <X aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
          Clear
        </Link>
      </div>
    </Form>
  )
}
