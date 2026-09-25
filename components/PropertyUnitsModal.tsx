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
      <div className="sticky top-0 z-10 bg-white px-4 pb-3 pt-4 sm:px-6">
        <label className="search-field">
          <Search aria-hidden="true" className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
          <span className="sr-only">Search units in {propertyName}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search unit number, rent, or status..."
          />
        </label>
        <p className="mt-2 px-1 text-[12.5px] font-semibold text-muted">
          {filteredUnits.length} of {units.length} units
        </p>
      </div>

      <div className="overflow-x-auto px-4 pb-5 sm:px-6">
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
                <td data-label="Unit"><span className="font-extrabold text-ink">Unit {unit.unitNumber}</span></td>
                <td data-label="Monthly Rent" className="font-bold tabular-nums text-ink">{currency(unit.rentAmount)}</td>
                <td data-label="Status">
                  <span className={unit.status === 'occupied' ? 'badge badge-green' : 'badge badge-amber'}>
                    {unit.status === 'occupied' ? 'Occupied' : 'Vacant'}
                  </span>
                </td>
                <td data-label="Actions">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/units/${unit.id}/edit`} className="btn btn-xs btn-outline">
                      Edit
                    </Link>
                    <DeleteButton
                      endpoint={`/api/units/${unit.id}`}
                      confirmMessage="Delete this unit and all linked tenants, payments, and expenses?"
                      className="btn btn-xs btn-danger"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUnits.length === 0 && (
          <p className="py-12 text-center text-[14px] font-semibold text-muted">No units match that search.</p>
        )}
      </div>
    </PropertyRecordsModal>
  )
}
