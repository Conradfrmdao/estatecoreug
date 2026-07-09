'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FormNotice from '@/components/FormNotice'
import { cleanMoneyInput } from '@/lib/money'
import { Building2, Check, ChevronLeft, Home, Search, X } from 'lucide-react'

type Unit = {
  id: number
  propertyId: number
  unitNumber: string
  propertyName?: string
  rentAmount?: number
  status?: string
}

type PropertyOption = {
  id: number
  name: string
  unitCount: number
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
  const [propertyId, setPropertyId] = useState<number | ''>('')
  const [unitPickerOpen, setUnitPickerOpen] = useState(false)
  const [pickerPropertyId, setPickerPropertyId] = useState<number | ''>('')
  const [propertySearch, setPropertySearch] = useState('')
  const [unitSearch, setUnitSearch] = useState('')
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
      .then((data) => {
        const rows = data || []
        setUnits(rows)

        const initialUnit = rows.find((unit: Unit) => unit.id === initialData?.unitId)
        if (initialUnit) {
          setPropertyId(initialUnit.propertyId)
          return
        }

        const uniquePropertyIds = Array.from(new Set(rows.map((unit: Unit) => unit.propertyId)))
        if (!initialData && uniquePropertyIds.length === 1) {
          setPropertyId(Number(uniquePropertyIds[0]))
        }
      })
      .catch(() => setUnits([]))
  }, [initialData])

  const selectedUnit = units.find((unit) => unit.id === Number(unitId))
  const properties = Array.from(
    units.reduce((map, unit) => {
      const existing = map.get(unit.propertyId)
      map.set(unit.propertyId, {
        id: unit.propertyId,
        name: unit.propertyName ?? `Property ${unit.propertyId}`,
        unitCount: (existing?.unitCount ?? 0) + 1
      })
      return map
    }, new Map<number, PropertyOption>()).values()
  ).sort((a, b) => a.name.localeCompare(b.name))
  const filteredProperties = properties.filter((property) =>
    !propertySearch.trim() || property.name.toLowerCase().includes(propertySearch.trim().toLowerCase())
  )
  const selectedProperty = properties.find((property) => property.id === Number(propertyId))
  const pickerProperty = properties.find((property) => property.id === Number(pickerPropertyId))
  const unitsForPickerProperty = pickerPropertyId
    ? units.filter((unit) => unit.propertyId === Number(pickerPropertyId))
    : []
  const searchedUnits = unitsForPickerProperty.filter((unit) => {
    const search = unitSearch.trim().toLowerCase()
    if (!search) return true

    return [
      unit.unitNumber,
      unit.propertyName ?? '',
      unit.status ?? '',
      unit.rentAmount ? String(unit.rentAmount) : ''
    ].some((value) => value.toLowerCase().includes(search))
  })
  const unitOptions = selectedUnit && selectedUnit.propertyId === Number(pickerPropertyId) && !searchedUnits.some((unit) => unit.id === selectedUnit.id)
    ? [selectedUnit, ...searchedUnits]
    : searchedUnits

  function openUnitPicker() {
    setUnitPickerOpen(true)
    setPickerPropertyId('')
    setPropertySearch('')
    setUnitSearch('')
  }

  function closeUnitPicker() {
    setUnitPickerOpen(false)
    setPickerPropertyId('')
    setPropertySearch('')
    setUnitSearch('')
  }

  function chooseUnit(unit: Unit) {
    setUnitId(unit.id)
    setPropertyId(unit.propertyId)
    if (!initialData && recordFirstPayment) {
      setPaymentAmount(String(unit.rentAmount ? unit.rentAmount * monthsCovered : ''))
    }
    closeUnitPicker()
  }

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

    if (!unitId) {
      setError('Please select a unit before saving the tenant.')
      return
    }

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
        <button
          type="button"
          onClick={openUnitPicker}
          className="field-input flex min-h-[52px] items-center justify-between gap-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/30"
        >
          <span className="min-w-0">
            {selectedUnit ? (
              <>
                <span className="block truncate text-sm font-black text-slate-950">
                  Unit {selectedUnit.unitNumber}
                </span>
                <span className="mt-0.5 block truncate text-xs text-slate-500">
                  {selectedProperty?.name ?? selectedUnit.propertyName} {selectedUnit.rentAmount ? `- UGX ${selectedUnit.rentAmount.toLocaleString()}/mo` : ''}
                </span>
              </>
            ) : (
              <>
                <span className="block text-sm font-black text-slate-700">Select unit</span>
                <span className="mt-0.5 block text-xs text-slate-500">Choose property, then unit</span>
              </>
            )}
          </span>
          <Home className="h-5 w-5 shrink-0 text-emerald-700" strokeWidth={1.9} />
        </button>
      </div>

      {unitPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-3 py-4 sm:items-center" role="dialog" aria-modal="true">
          <div className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-950">
                  {pickerProperty ? pickerProperty.name : 'Choose property'}
                </p>
                <p className="text-xs text-slate-500">
                  {pickerProperty ? 'Select a unit inside this property.' : 'Select the property for this tenant.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeUnitPicker}
                aria-label="Close unit picker"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto p-4">
              {!pickerProperty ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.9} />
                    <input
                      value={propertySearch}
                      onChange={(e) => setPropertySearch(e.target.value)}
                      className="field-input pl-9"
                      placeholder="Search property..."
                    />
                  </div>

                  <div className="grid gap-2">
                    {filteredProperties.map((property) => (
                      <button
                        key={property.id}
                        type="button"
                        onClick={() => {
                          setPickerPropertyId(property.id)
                          setUnitSearch('')
                        }}
                        className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                            <Building2 className="h-4 w-4" strokeWidth={1.9} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-black text-slate-950">{property.name}</span>
                            <span className="block text-xs text-slate-500">{property.unitCount} unit{property.unitCount === 1 ? '' : 's'}</span>
                          </span>
                        </span>
                        {property.id === propertyId && <Check className="h-4 w-4 shrink-0 text-emerald-700" strokeWidth={2} />}
                      </button>
                    ))}
                    {filteredProperties.length === 0 && (
                      <p className="rounded-xl bg-slate-50 px-3 py-6 text-center text-sm font-semibold text-slate-500">
                        No properties match that search.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPickerPropertyId('')
                      setUnitSearch('')
                    }}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-800"
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={1.9} />
                    Back to properties
                  </button>

                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.9} />
                    <input
                      value={unitSearch}
                      onChange={(e) => setUnitSearch(e.target.value)}
                      className="field-input pl-9"
                      placeholder="Search unit number, rent, or status..."
                    />
                  </div>

                  <div className="grid gap-2">
                    {unitOptions.map((unit) => {
                      const disabled = unit.status === 'occupied' && unit.id !== initialData?.unitId
                      return (
                        <button
                          key={unit.id}
                          type="button"
                          onClick={() => {
                            if (!disabled) chooseUnit(unit)
                          }}
                          disabled={disabled}
                          className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 text-left transition hover:border-emerald-200 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-black text-slate-950">Unit {unit.unitNumber}</span>
                            <span className="block text-xs text-slate-500">
                              {unit.rentAmount ? `UGX ${unit.rentAmount.toLocaleString()}/mo` : 'Rent not set'} {unit.status === 'occupied' ? '- Occupied' : '- Vacant'}
                            </span>
                          </span>
                          {unit.id === unitId && <Check className="h-4 w-4 shrink-0 text-emerald-700" strokeWidth={2} />}
                        </button>
                      )
                    })}
                    {unitOptions.length === 0 && (
                      <p className="rounded-xl bg-slate-50 px-3 py-6 text-center text-sm font-semibold text-slate-500">
                        No units match that search.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
