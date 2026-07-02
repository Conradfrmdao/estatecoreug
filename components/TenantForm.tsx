'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FormNotice from '@/components/FormNotice'
import { cleanMoneyInput } from '@/lib/money'

type Unit = {
  id: number
  unitNumber: string
  propertyName?: string
  rentAmount?: number
  status?: string
}

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

const durationOptions = [1, 3, 6, 12]

function addMonths(dateString: string, months: number) {
  if (!dateString) {
    return ''
  }

  const date = new Date(`${dateString}T00:00:00.000Z`)
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate()))

  if (next.getUTCDate() !== date.getUTCDate()) {
    next.setUTCDate(0)
  }

  return next.toISOString().slice(0, 10)
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
  const [monthsCovered, setMonthsCovered] = useState(1)
  const [customMonths, setCustomMonths] = useState('2')
  const [recordFirstPayment, setRecordFirstPayment] = useState(!initialData)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [active, setActive] = useState(initialData?.active ?? true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(initialData ? '/api/units' : '/api/units?status=vacant')
      .then((r) => r.json())
      .then((data) => setUnits(data || []))
      .catch(() => setUnits([]))
  }, [initialData])

  const selectedUnit = units.find((unit) => unit.id === Number(unitId))

  useEffect(() => {
    if (initialData) {
      return
    }

    const nextDueDate = addMonths(moveInDate, monthsCovered)
    setRentDueDate(nextDueDate)

    if (selectedUnit && recordFirstPayment) {
      setPaymentAmount(String(selectedUnit.rentAmount ? selectedUnit.rentAmount * monthsCovered : ''))
    }
  }, [initialData, monthsCovered, moveInDate, recordFirstPayment, selectedUnit])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    const payload = {
      unitId: Number(unitId),
      fullName,
      phone,
      email,
      moveInDate,
      rentDueDate,
      active,
      monthsCovered,
      recordFirstPayment,
      paymentAmount,
      paymentMethod
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
      setError(payload?.error ?? 'Failed to save tenant')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <FormNotice message={error} />

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
            <option
              key={u.id}
              value={u.id}
              disabled={u.status === 'occupied' && u.id !== initialData?.unitId}
            >
              {u.propertyName ? `${u.propertyName} - ` : ''}Unit {u.unitNumber}
              {u.rentAmount ? ` (UGX ${u.rentAmount.toLocaleString()}/mo)` : ''}
              {u.status === 'occupied' && u.id !== initialData?.unitId ? ' - Occupied' : ''}
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
          <label className="field-label">Next rent due date</label>
          <div className="field-input bg-slate-50 text-slate-700">
            {rentDueDate || 'Choose move-in date and duration'}
          </div>
        </div>
      </div>

      {!initialData && (
        <section className="rounded-xl border bg-white p-4" style={{ borderColor: '#e2e8f0' }}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>Payment duration</p>
              <p className="text-xs text-slate-500">The next due date is calculated from the move-in date.</p>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={recordFirstPayment}
                onChange={(e) => setRecordFirstPayment(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
              />
              Record first payment
            </label>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {durationOptions.map((months) => (
              <button
                key={months}
                type="button"
                onClick={() => setMonthsCovered(months)}
                className="rounded-lg border px-3 py-2 text-sm font-semibold transition"
                style={{
                  borderColor: monthsCovered === months ? '#00A550' : '#e2e8f0',
                  backgroundColor: monthsCovered === months ? '#e6f7ef' : '#fff',
                  color: monthsCovered === months ? '#007038' : '#374151'
                }}
              >
                {months} mo
              </button>
            ))}
            <label className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#e2e8f0' }}>
              <span className="sr-only">Custom months</span>
              <input
                type="number"
                min="1"
                value={customMonths}
                onFocus={() => setMonthsCovered(Math.max(1, Number(customMonths) || 1))}
                onChange={(e) => {
                  setCustomMonths(e.target.value)
                  setMonthsCovered(Math.max(1, Number(e.target.value) || 1))
                }}
                className="w-full bg-transparent text-center font-semibold outline-none"
                placeholder="Custom"
              />
            </label>
          </div>

          {recordFirstPayment && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label">First payment amount</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(cleanMoneyInput(e.target.value))}
                  required
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Payment method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="field-input">
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="mobile_money">Mobile money</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}
        </section>
      )}

      <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-50 transition">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-[18px] w-[18px] rounded border-slate-300 text-green-600 focus:ring-green-500"
        />
        Active tenant
      </label>

      <div className="form-actions">
        <button
          disabled={isSaving}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: '#00A550', boxShadow: '0 4px 14px rgba(0,165,80,0.3)' }}
        >
          {isSaving ? 'Saving...' : initialData ? 'Save Tenant' : 'Create Tenant'}
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
