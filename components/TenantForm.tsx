'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import FormNotice from '@/components/FormNotice'
import { cleanMoneyInput } from '@/lib/money'
import { Check, Home, Search, WalletCards, X } from 'lucide-react'

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
    paymentTiming?: PaymentTiming
    active: boolean
  }
}

type PaymentTiming = 'advance' | 'arrears'

function dayWithSuffix(day: number) {
  const suffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th'
  return `${day}${suffix}`
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
  const [paymentTiming, setPaymentTiming] = useState<PaymentTiming>(initialData?.paymentTiming ?? 'advance')
  const paysAtEnd = paymentTiming === 'arrears'
  /* Months only mean something when a first payment is being recorded: a
     start-of-month tenant who has not paid owes from move-in, month by month. */
  const coveredMonths = !paysAtEnd && recordFirstPayment ? monthsCovered : 1
  const dueDay = moveInDate ? Number(moveInDate.slice(8, 10)) : null
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
    setPickerPropertyId(propertyId)
    setUnitSearch('')
  }

  function closeUnitPicker() {
    setUnitPickerOpen(false)
    setUnitSearch('')
  }

  function chooseUnit(unit: Unit) {
    setUnitId(unit.id)
    setPropertyId(unit.propertyId)
    if (!initialData && recordFirstPayment && !paysAtEnd) {
      setPaymentAmount(String(unit.rentAmount ? unit.rentAmount * coveredMonths : ''))
    }
    closeUnitPicker()
  }

  useEffect(() => {
    if (initialData) {
      return
    }

    setRentDueDate(addMonths(moveInDate, coveredMonths))

    if (selectedUnit && recordFirstPayment && !paysAtEnd) {
      setPaymentAmount(String(selectedUnit.rentAmount ? selectedUnit.rentAmount * coveredMonths : ''))
    }
  }, [coveredMonths, initialData, moveInDate, paysAtEnd, recordFirstPayment, selectedUnit])

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
      paymentTiming,
      monthsCovered: coveredMonths,
      recordFirstPayment: paysAtEnd ? false : recordFirstPayment,
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
          className="field-input flex !min-h-[60px] items-center justify-between gap-3 !rounded-[22px] text-left"
        >
          <span className="min-w-0">
            {selectedUnit ? (
              <>
                <span className="block truncate text-[14.5px] font-extrabold text-ink">
                  Unit {selectedUnit.unitNumber}
                </span>
                <span className="mt-0.5 block truncate text-[12.5px] font-medium text-muted">
                  {selectedProperty?.name ?? selectedUnit.propertyName} {selectedUnit.rentAmount ? `- UGX ${selectedUnit.rentAmount.toLocaleString()}/mo` : ''}
                </span>
              </>
            ) : (
              <>
                <span className="block text-[14.5px] font-bold text-ink-soft">Select unit</span>
                <span className="mt-0.5 block text-[12.5px] font-medium text-muted">Choose property, then unit</span>
              </>
            )}
          </span>
          <Home className="h-5 w-5 shrink-0 text-brand-text" strokeWidth={1.9} />
        </button>
      </div>

      {unitPickerOpen && typeof document !== 'undefined' && createPortal(
        <div className="overlay-enter fixed inset-0 z-50 flex items-end justify-center bg-ink/45 px-3 py-4 backdrop-blur-[2px] sm:items-center" role="dialog" aria-modal="true" aria-label="Choose unit">
          <div className="dialog-enter max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-overlay">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div className="min-w-0">
                <p className="text-[16px] font-extrabold text-ink">Choose unit</p>
                <p className="text-[12.5px] font-medium text-muted">Select a property first, then choose an available unit.</p>
              </div>
              <button
                type="button"
                onClick={closeUnitPicker}
                aria-label="Close unit picker"
                className="btn btn-soft btn-icon btn-sm shrink-0"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto p-5">
              <div className="space-y-4">
                <div>
                  <label className="field-label">Property</label>
                  <select
                    value={pickerPropertyId}
                    onChange={(e) => {
                      setPickerPropertyId(e.target.value ? Number(e.target.value) : '')
                      setUnitSearch('')
                    }}
                    className="field-input"
                  >
                    <option value="">Select property</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name} ({property.unitCount} available unit{property.unitCount === 1 ? '' : 's'})
                      </option>
                    ))}
                  </select>
                </div>

                {pickerProperty ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[15px] font-extrabold text-ink">Available units</p>
                        <p className="truncate text-[12.5px] font-medium text-muted">{pickerProperty.name}</p>
                      </div>
                      <span className="pill bg-mint text-forest">
                        {unitOptions.length} unit{unitOptions.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="relative">
                      <Search className="pointer-events-none absolute left-[18px] top-1/2 h-4 w-4 -translate-y-1/2 text-muted" strokeWidth={2} />
                      <input
                        value={unitSearch}
                        onChange={(e) => setUnitSearch(e.target.value)}
                        className="field-input !pl-11"
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
                            className="flex min-h-14 items-center justify-between gap-3 rounded-[18px] bg-canvas px-4 py-2.5 text-left transition hover:bg-mint disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-[14.5px] font-extrabold text-ink">Unit {unit.unitNumber}</span>
                              <span className="block text-[12.5px] font-medium text-muted">
                                {unit.rentAmount ? `UGX ${unit.rentAmount.toLocaleString()}/mo` : 'Rent not set'} {unit.status === 'occupied' ? '- Occupied' : '- Vacant'}
                              </span>
                            </span>
                            {unit.id === unitId && <Check className="h-4 w-4 shrink-0 text-brand-text" strokeWidth={2.4} />}
                          </button>
                        )
                      })}
                      {unitOptions.length === 0 && (
                        <p className="rounded-[18px] bg-canvas px-3 py-6 text-center text-[13.5px] font-semibold text-muted">
                          No available units found for this property.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[22px] border-2 border-dashed border-line-strong px-4 py-8 text-center">
                    <Home className="mx-auto h-8 w-8 text-faint" strokeWidth={1.8} />
                    <p className="mt-3 text-[14.5px] font-extrabold text-ink">Select a property</p>
                    <p className="mt-1 text-[12.5px] font-medium text-muted">Available units will appear here after you choose a property.</p>
                  </div>
                )}

                {properties.length === 0 && (
                  <p className="rounded-[18px] bg-carried-bg px-3 py-4 text-center text-[13.5px] font-semibold text-carried-fg">
                    No available units found. Add a vacant unit before creating a tenant.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
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
          <label className="field-label">{!initialData && paysAtEnd ? 'First rent due' : 'Next rent due'}</label>
          <div className="field-input text-ink-soft">
            {rentDueDate || 'Choose a move-in date'}
          </div>
        </div>
      </div>

      <fieldset>
        <legend className="field-label">When does this tenant pay rent?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {([
            {
              value: 'advance',
              title: 'At the start of each month',
              detail: dueDay
                ? `Pays on the ${dayWithSuffix(dueDay)} for the month ahead`
                : 'Pays before the month they are paying for'
            },
            {
              value: 'arrears',
              title: 'At the end of each month',
              detail: dueDay
                ? `Pays on the ${dayWithSuffix(dueDay)} for the month just ended`
                : 'Pays after the month they are paying for'
            }
          ] as const).map((option) => {
            const selected = paymentTiming === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setPaymentTiming(option.value)}
                aria-pressed={selected}
                className={`flex min-h-[68px] flex-col items-start justify-center rounded-[20px] border-[1.5px] px-4 py-3 text-left transition duration-200 ${
                  selected ? 'border-ink bg-hi' : 'border-transparent bg-canvas hover:bg-mint-soft'
                }`}
              >
                <span className="text-[14px] font-bold text-ink">
                  {option.title}
                </span>
                <span className={`mt-0.5 text-[12.5px] font-medium ${selected ? 'text-forest-ink' : 'text-muted'}`}>{option.detail}</span>
              </button>
            )
          })}
        </div>
        {initialData && (initialData.paymentTiming ?? 'advance') !== paymentTiming && (
          <p className="mt-2 text-[12.5px] font-medium text-muted">
            Saving recalculates when the next rent is due. Recorded payments are not changed.
          </p>
        )}
      </fieldset>

      {!initialData && paysAtEnd && (
        <div className="flex gap-3 rounded-[20px] bg-mint px-4 py-3.5 text-[13.5px] font-medium leading-5 text-forest">
          <WalletCards className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <p>
            Nothing is paid at move-in.{' '}
            {selectedUnit?.rentAmount
              ? `The first rent of UGX ${selectedUnit.rentAmount.toLocaleString()} is due on ${rentDueDate || 'the end of the first month'}, at the end of the first month.`
              : `The first rent is due on ${rentDueDate || 'the end of the first month'}, at the end of the first month.`}{' '}
            Record it from Payments when they pay. Unpaid months simply add up until they do.
          </p>
        </div>
      )}

      {!initialData && !paysAtEnd && (
        <section className="rounded-[22px] border border-line p-4 sm:p-5">
          <label className="flex cursor-pointer items-center gap-3 rounded-[18px] bg-canvas px-4 py-3.5 text-[14px] font-bold text-ink">
            <input
              type="checkbox"
              checked={recordFirstPayment}
              onChange={(event) => setRecordFirstPayment(event.target.checked)}
              className="h-[18px] w-[18px]"
            />
            Record first payment now
          </label>

          {recordFirstPayment ? (
            <>
              <div className="mt-4">
                <p className="text-[14px] font-bold text-ink">How many months is this payment for?</p>
                <p className="mt-0.5 text-[12.5px] font-medium text-muted">
                  Rent is still due every month afterwards. This only covers the first payment.
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {durationOptions.map((months) => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => setMonthsCovered(months)}
                    aria-pressed={monthsCovered === months}
                    className={`h-11 rounded-full text-[14px] font-bold transition duration-200 ${
                      monthsCovered === months ? 'bg-ink text-white' : 'bg-canvas text-ink hover:bg-mint-soft'
                    }`}
                  >
                    {months} mo
                  </button>
                ))}
                <label className="flex h-11 items-center rounded-full bg-canvas px-3 text-[14px] focus-within:ring-2 focus-within:ring-brand">
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
            </>
          ) : (
            <div className="mt-4 flex gap-3 rounded-[20px] bg-carried-bg px-4 py-3.5 text-[13.5px] font-medium leading-5 text-carried-fg">
              <WalletCards className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              <p>
                No payment recorded yet.{' '}
                {selectedUnit?.rentAmount
                  ? `UGX ${selectedUnit.rentAmount.toLocaleString()} is owed from ${moveInDate || 'the move-in date'}, then again every month until it is paid.`
                  : `Rent is owed from ${moveInDate || 'the move-in date'}, then again every month until it is paid.`}
              </p>
            </div>
          )}
        </section>
      )}

      <label className="flex cursor-pointer items-center gap-3 rounded-[18px] bg-canvas px-4 py-3.5 text-[14px] font-bold text-ink transition hover:bg-mint-soft">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-[18px] w-[18px]"
        />
        Active tenant
      </label>

      <div className="form-actions">
        <button
          disabled={isSaving}
          className="btn btn-lg btn-ink px-7"
        >
          {isSaving ? 'Saving...' : initialData ? 'Save Tenant' : 'Create Tenant'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-lg btn-outline"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
