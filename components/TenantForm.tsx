'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Unit = { id: number; unitNumber: string; propertyName?: string; rentAmount?: number }

type TenantFormProps = {
  initialData?: {
    id: number
    unitId: number
    fullName: string
    phone: string
    email: string | null
    moveInDate: string
    rentDueDate: string
    active: boolean
  }
}

export default function TenantForm({ initialData }: TenantFormProps) {
  const router = useRouter()
  const [units, setUnits] = useState<Unit[]>([])
  const [unitId, setUnitId] = useState<number | ''>(initialData?.unitId ?? '')
  const [fullName, setFullName] = useState(initialData?.fullName ?? '')
  const [phone, setPhone] = useState(initialData?.phone ?? '')
  const [email, setEmail] = useState(initialData?.email ?? '')
  const [moveInDate, setMoveInDate] = useState(initialData?.moveInDate ?? '')
  const [rentDueDate, setRentDueDate] = useState(initialData?.rentDueDate ?? '')
  const [active, setActive] = useState(initialData?.active ?? true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetch('/api/units')
      .then((r) => r.json())
      .then((data) => setUnits(data || []))
      .catch(() => setUnits([]))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    const payload = {
      unitId: Number(unitId),
      fullName,
      phone,
      email,
      moveInDate,
      rentDueDate,
      active
    }
    const res = await fetch(initialData ? `/api/tenants/${initialData.id}` : '/api/tenants', {
      method: initialData ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    setIsSaving(false)

    if (res.ok) {
      router.push('/tenants')
      router.refresh()
    } else {
      const payload = await res.json().catch(() => null)
      alert(payload?.error ?? 'Failed to save tenant')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div>
        <label className="field-label">Unit</label>
        <select
          value={unitId}
          onChange={(e) => setUnitId(Number(e.target.value))}
          required
          className="field-input"
        >
          <option value="">Select unit</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.propertyName ? `${u.propertyName} - ` : ''}Unit {u.unitNumber}
              {u.rentAmount ? ` (UGX ${u.rentAmount.toLocaleString()}/mo)` : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Full name</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="field-input"
          placeholder="Grace Auma"
        />
      </div>

      <div>
        <label className="field-label">Phone</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="field-input"
          placeholder="+256 700 000 000"
        />
      </div>

      <div>
        <label className="field-label">Email</label>
        <input
          type="email"
          value={email ?? ''}
          onChange={(e) => setEmail(e.target.value)}
          className="field-input"
          placeholder="tenant@example.com"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label">Move-in date</label>
          <input
            type="date"
            value={moveInDate}
            onChange={(e) => setMoveInDate(e.target.value)}
            required
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label">Rent due date</label>
          <input
            type="date"
            value={rentDueDate}
            onChange={(e) => setRentDueDate(e.target.value)}
            required
            className="field-input"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-50 transition">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4.5 w-4.5 rounded border-slate-300 text-green-600 focus:ring-green-500"
        />
        Active tenant
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          disabled={isSaving}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: '#00A550', boxShadow: '0 4px 14px rgba(0,165,80,0.3)' }}
        >
          {isSaving ? 'Saving…' : initialData ? 'Save Tenant' : 'Create Tenant'}
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
