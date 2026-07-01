'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import FormNotice from '@/components/FormNotice'

type PropertyOption = { id: number; name: string }
type UnitOption = { id: number; unitNumber: string; propertyId: number }

type ExpenseFormProps = {
  initialData?: {
    id: number
    propertyId: number
    unitId: number | null
    title: string
    category: string
    amount: number
    expenseDate: string
    description: string | null
  }
}

export default function ExpenseForm({ initialData }: ExpenseFormProps) {
  const router = useRouter()
  const [properties, setProperties] = useState<PropertyOption[]>([])
  const [units, setUnits] = useState<UnitOption[]>([])
  const [propertyId, setPropertyId] = useState<number | ''>(initialData?.propertyId ?? '')
  const [unitId, setUnitId] = useState<number | ''>(initialData?.unitId ?? '')
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [category, setCategory] = useState(initialData?.category ?? 'repairs')
  const [amount, setAmount] = useState(initialData ? String(initialData.amount) : '')
  const [expenseDate, setExpenseDate] = useState(
    initialData?.expenseDate ?? new Date().toISOString().slice(0, 10)
  )
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/properties')
      .then((r) => r.json())
      .then((data) => setProperties(data || []))
      .catch(() => setProperties([]))

    fetch('/api/units')
      .then((r) => r.json())
      .then((data) => setUnits(data || []))
      .catch(() => setUnits([]))
  }, [])

  const filteredUnits = useMemo(() => {
    if (!propertyId) {
      return units
    }

    return units.filter((unit) => unit.propertyId === Number(propertyId))
  }, [propertyId, units])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    const payload = {
      propertyId: Number(propertyId),
      unitId: unitId ? Number(unitId) : null,
      title,
      category,
      amount: Number(amount),
      expenseDate,
      description
    }

    const response = await fetch(initialData ? `/api/expenses/${initialData.id}` : '/api/expenses', {
      method: initialData ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    setIsSaving(false)

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      setError(payload?.error ?? 'Failed to save expense')
      return
    }

    router.push('/expenses')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <FormNotice message={error} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label">Property</label>
          <select
            value={propertyId}
            onChange={(e) => {
              setPropertyId(Number(e.target.value))
              setUnitId('')
            }}
            required
            className="field-input"
          >
            <option value="">Select property</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">Unit</label>
          <select
            value={unitId}
            onChange={(e) => setUnitId(e.target.value ? Number(e.target.value) : '')}
            className="field-input"
          >
            <option value="">No unit (Entire Property)</option>
            {filteredUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                Unit {unit.unitNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="field-input"
          placeholder="Bathroom repairs, cleaning supplies, plumbing, etc."
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="field-label">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="field-input"
          >
            <option value="repairs">Repairs</option>
            <option value="renovation">Renovation</option>
            <option value="cleaning">Cleaning</option>
            <option value="plumbing">Plumbing</option>
            <option value="electricity">Electricity</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="field-label">Amount (UGX)</label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label">Expense date</label>
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            required
            className="field-input"
          />
        </div>
      </div>

      <div>
        <label className="field-label">Description</label>
        <textarea
          value={description ?? ''}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="field-input"
          placeholder="Write brief description of the expense..."
        />
      </div>

      <div className="form-actions">
        <button
          disabled={isSaving}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: '#00A550', boxShadow: '0 4px 14px rgba(0,165,80,0.3)' }}
        >
          {isSaving ? 'Saving…' : initialData ? 'Save Expense' : 'Record Expense'}
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
