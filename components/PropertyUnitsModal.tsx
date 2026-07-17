'use client'

import DeleteButton from '@/components/DeleteButton'
import PropertyRecordsModal from '@/components/PropertyRecordsModal'
import { currency } from '@/lib/format'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

type UnitRecord = {
  id: number
  unitNumber: string
  rentAmount: number
  status: string
}

export default function PropertyUnitsModal({
  propertyName,
  propertyLocation,
  units,
  downloadHref
}: {
  propertyName: string
  propertyLocation: string
  units: UnitRecord[]
  downloadHref: string
}) {
  const [query, setQuery] = useState('')
  const filteredUnits = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return units

    return units.filter((unit) =>
      [unit.unitNumber, unit.status, String(unit.rentAmount), currency(unit.rentAmount)]
        .some((value) => value.toLowerCase().includes(search))
    )
  }, [query, units])

  return (
    <PropertyRecordsModal
      buttonLabel="View units"
      title={`${propertyName} Units`}
      description={`${propertyLocation} - ${units.length} unit${units.length === 1 ? '' : 's'}`}
      downloadHref={downloadHref}
    >
      <div className="sticky top-0 z-10 border-b border-slate-100 bg-white p-3 sm:px-5 sm:py-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.9} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="field-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search unit number, rent, or status..."
            aria-label={`Search units in ${propertyName}`}
          />
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-500">
          {filteredUnits.length} of {units.length} units
        </p>
      </div>

      <div className="overflow-x-auto p-3 sm:p-5">
        <table className="data-table">
          <thead>
            <tr>
              <th>Unit</th>
              <th>Monthly Rent</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUnits.map((unit) => (
              <tr key={unit.id}>
                <td data-label="Unit"><span className="font-semibold text-slate-950">Unit {unit.unitNumber}</span></td>
                <td data-label="Monthly Rent" className="font-semibold text-slate-950">{currency(unit.rentAmount)}</td>
                <td data-label="Status">
                  <span className={unit.status === 'occupied' ? 'badge badge-green' : 'badge badge-amber'}>
                    {unit.status === 'occupied' ? 'Occupied' : 'Vacant'}
                  </span>
                </td>
                <td data-label="Actions">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/units/${unit.id}/edit`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                      Edit
                    </Link>
                    <DeleteButton endpoint={`/api/units/${unit.id}`} confirmMessage="Delete this unit and all linked tenants, payments, and expenses?" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUnits.length === 0 && (
          <p className="py-12 text-center text-sm font-semibold text-slate-500">No units match that search.</p>
        )}
      </div>
    </PropertyRecordsModal>
  )
}
