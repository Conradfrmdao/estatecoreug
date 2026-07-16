'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'

type ReportProperty = {
  id: number
  name: string
}

export default function ReportScopeDownload({
  month,
  properties
}: {
  month: string
  properties: ReportProperty[]
}) {
  const [scope, setScope] = useState('overall')
  const selectedProperty = properties.find((property) => String(property.id) === scope)
  const href = selectedProperty
    ? `/api/reports/property-detail?month=${month}&propertyId=${selectedProperty.id}`
    : `/api/reports/property-summary?month=${month}`

  return (
    <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_minmax(15rem,22rem)_auto] sm:items-end">
      <div className="min-w-0">
        <h2 className="text-sm font-black text-slate-950">Download property report</h2>
        <p className="mt-1 text-xs text-slate-500">Choose the full portfolio or one specific property.</p>
      </div>
      <div>
        <label htmlFor="report-scope" className="field-label">Report scope</label>
        <select
          id="report-scope"
          value={scope}
          onChange={(event) => setScope(event.target.value)}
          className="field-input"
        >
          <option value="overall">Overall portfolio</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>{property.name}</option>
          ))}
        </select>
      </div>
      <a
        href={href}
        download
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700"
      >
        <Download aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
        Download
      </a>
    </section>
  )
}
