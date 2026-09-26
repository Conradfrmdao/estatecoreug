'use client'

import { Download } from 'lucide-react'
import {
  scopedReportUrl,
  type ScopedReportPeriod,
  type ScopedReportType
} from '@/lib/report-scope'
import PdfDownload from '@/components/ui/PdfDownload'
import { useState } from 'react'

type ReportProperty = {
  id: number
  name: string
}

export default function ReportScopeDownload({
  month,
  period,
  properties
}: {
  month: string
  period: ScopedReportPeriod
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
    { label: period === 'all' ? 'All-time rent' : 'Monthly rent', type: 'monthly-rent' },
    { label: 'Unpaid tenants', type: 'unpaid-tenants' },
    { label: 'Cash flow', type: 'income-expense' }
  ]

  return (
    <section
      aria-label="Download reports"
      className="flex flex-col gap-4 rounded-[24px] bg-white p-5 sm:px-6 sm:py-[22px] lg:rounded-card"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <div className="min-w-0">
          <h2 className="text-[17px] font-extrabold leading-[22px] text-ink">Download reports</h2>
          <p className="mt-0.5 text-[13px] font-medium leading-[18px] text-muted">
            Every download below follows the selected property scope.
          </p>
        </div>
        <label className="flex items-center gap-2.5">
          <span className="shrink-0 text-[12.5px] font-bold text-muted">Report scope</span>
          <select
            value={scope}
            onChange={(event) => setScope(event.target.value)}
            className="field-input !min-h-12 min-w-0 sm:w-[240px]"
          >
            <option value="overall">Overall portfolio</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>{property.name}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {downloads.map((download) => (
          <PdfDownload
            key={download.type}
            href={scopedReportUrl(download.type, month, propertyId, period)}
            className="btn btn-mint h-auto min-h-14 min-w-0 whitespace-normal px-4 py-2 text-[13.5px] leading-[17px] sm:h-14 sm:whitespace-nowrap sm:py-0 sm:text-[14px]"
          >
            <Download aria-hidden="true" className="h-[18px] w-[18px] shrink-0" strokeWidth={1.9} />
            <span className="min-w-0 sm:truncate">{download.label}</span>
          </PdfDownload>
        ))}
      </div>
    </section>
  )
}
