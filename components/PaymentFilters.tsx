'use client'

import { Filter, X } from 'lucide-react'
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
    <form method="get" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[minmax(12rem,1.2fr)_minmax(10rem,0.8fr)_auto_minmax(10rem,0.7fr)_auto_auto] lg:items-end">
        <label className="min-w-0">
          <span className="field-label">Search payments</span>
          <input
            name="q"
            defaultValue={initialQuery}
            placeholder="Tenant, unit, amount, or method..."
            className="field-input min-w-0"
          />
        </label>

        <label className="min-w-0">
          <span className="field-label">Property</span>
          <select name="propertyId" defaultValue={initialPropertyId} className="field-input min-w-0">
            <option value="">All properties</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>{property.name}</option>
            ))}
          </select>
        </label>

        <label className="min-w-0">
          <span className="field-label">Period</span>
          <select
            name="period"
            value={period}
            onChange={(event) => setPeriod(event.target.value as PaymentPeriod)}
            className="field-input min-w-[8rem]"
          >
            <option value="all">All time</option>
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </label>

        <label className="min-w-0">
          <span className="field-label">{period === 'all' ? 'Date' : `Select ${period}`}</span>
          {period === 'day' && <input name="date" type="date" defaultValue={initialDate} className="field-input min-w-0" />}
          {period === 'month' && <input name="month" type="month" defaultValue={initialMonth} className="field-input min-w-0" />}
          {period === 'year' && (
            <select name="year" defaultValue={initialYear} className="field-input min-w-0">
              {availableYears.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          )}
          {period === 'all' && (
            <div className="field-input flex items-center text-slate-500">All recorded dates</div>
          )}
        </label>

        <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700">
          <Filter className="h-4 w-4" strokeWidth={1.9} />
          Filter
        </button>

        <Link
          href="/payments"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
        >
          <X className="h-4 w-4" strokeWidth={1.9} />
          Clear
        </Link>
      </div>
    </form>
  )
}
