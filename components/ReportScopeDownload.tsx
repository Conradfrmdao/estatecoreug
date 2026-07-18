'use client'

import { Download } from 'lucide-react'
import { scopedReportUrl, type ScopedReportType } from '@/lib/report-scope'
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
  const propertyId = selectedProperty?.id ?? null
  const downloads: Array<{ label: string; type: ScopedReportType }> = [
    {
      label: selectedProperty ? 'Property report' : 'Portfolio report',
      type: selectedProperty ? 'property-detail' : 'property-summary'
    },
    { label: 'Monthly rent', type: 'monthly-rent' },
    { label: 'Unpaid tenants', type: 'unpaid-tenants' },
    { label: 'Cash flow', type: 'income-expense' }
  ]

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(15rem,22rem)] sm:items-end">
        <div className="min-w-0">
          <h2 className="text-sm font-black text-slate-950">Download reports</h2>
          <p className="mt-1 text-xs text-slate-500">Every download below follows the selected property scope.</p>
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
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {downloads.map((download) => (
          <a
            key={download.type}
            href={scopedReportUrl(download.type, month, propertyId)}
            download
            className="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-center text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 sm:text-sm"
          >
            <Download aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span className="min-w-0">{download.label}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
