'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FormNotice from '@/components/FormNotice'

type Property = { id: number; name: string }

type UnitFormProps = {
  initialData?: {
    id: number
    propertyId: number
    unitNumber: string
    rentAmount: number
    status: string
  }
}

export default function UnitForm({ initialData }: UnitFormProps) {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [propertyId, setPropertyId] = useState<number | ''>(initialData?.propertyId ?? '')
  const [unitNumber, setUnitNumber] = useState(initialData?.unitNumber ?? '')
  const [rentAmount, setRentAmount] = useState(initialData ? String(initialData.rentAmount) : '')
  const [status, setStatus] = useState(initialData?.status ?? 'vacant')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/properties')
      .then((r) => r.json())
      .then((data) => setProperties(data || []))
      .catch(() => setProperties([]))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    const payload = {
      propertyId: Number(propertyId),
      unitNumber,
      rentAmount: Number(rentAmount),
      status,
    }

    const res = await fetch(initialData ? `/api/units/${initialData.id}` : '/api/units', {
      method: initialData ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setIsSaving(false)

    if (res.ok) {
      router.push('/units')
      router.refresh()
    } else {
      const payload = await res.json().catch(() => null)
      setError(payload?.error ?? 'Failed to save unit')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <FormNotice message={error} />

      <div>
        <label className="field-label">Property</label>
        <select
          value={propertyId}
          onChange={(e) => setPropertyId(Number(e.target.value))}
          required
          className="field-input"
        >
          <option value="">Select a property</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label">Unit number</label>
          <input
            value={unitNumber}
            onChange={(e) => setUnitNumber(e.target.value)}
            required
            className="field-input"
            placeholder="A1"
          />
        </div>

        <div>
          <label className="field-label">Monthly rent (UGX)</label>
          <input
            type="number"
            min="0"
            value={rentAmount}
            onChange={(e) => setRentAmount(e.target.value)}
            required
            className="field-input"
            placeholder="500000"
          />
        </div>
      </div>

      {initialData ? (
        <div>
          <label className="field-label">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="field-input"
          >
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
          </select>
        </div>
      ) : null}

      <div className="flex items-center gap-3 pt-2">
        <button
          disabled={isSaving}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: '#00A550', boxShadow: '0 4px 14px rgba(0,165,80,0.3)' }}
        >
          {isSaving ? 'Saving…' : initialData ? 'Save Unit' : 'Create Unit'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl px-4 py-2.5 text-sm font-medium transition"
          style={{ border: '1.5px solid #e2e8f0', color: '#64748b' }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
