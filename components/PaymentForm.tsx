'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import FormNotice from '@/components/FormNotice'
import { currency, currentPaymentMonth, dateKey, formatDate, monthLabel } from '@/lib/format'
import { cleanMoneyInput } from '@/lib/money'
import { Building2, Check, ChevronLeft, Search, UserRound, X } from 'lucide-react'

type TenantOption = {
  id: number
  fullName: string
  phone?: string
  email?: string | null
  unitId: number
  unitNumber: string
  propertyId: number
  propertyName: string
  rentAmount: number
  rentDueDate: string
  targetMonth?: string
  targetDueDate?: string
  targetCoverageStart?: string
  nextPaymentDate?: string
  targetAmountPaid?: number
  targetBalance?: number
  targetScheduledBalance?: number
  totalOutstandingBalance?: number
  totalOutstandingPeriods?: number
}

type PropertyOption = {
  id: number
  name: string
  tenantCount: number
}

type PaymentFormProps = {
  initialData?: {
    id: number
    tenantId: number
    amountPaid: number
    paymentMonth: string
    coverageStart?: string
    coverageEnd?: string
    monthsCovered?: number
    paymentDate: string
    paymentMethod: string
    notes: string | null
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

function suggestedAmountForTenant(tenant: TenantOption, months: number) {
  const outstandingPeriods = Math.max(1, Number(tenant.totalOutstandingPeriods ?? 1))
  const totalOutstanding = Number(tenant.totalOutstandingBalance ?? 0)
  if (totalOutstanding > 0 && months === outstandingPeriods) return totalOutstanding

  const targetBalance = Number(tenant.targetBalance ?? tenant.rentAmount)
  const firstMonthBalance = targetBalance > 0 ? targetBalance : tenant.rentAmount
  return firstMonthBalance + Math.max(0, months - 1) * tenant.rentAmount
}

function scheduledMonthsForTenant(tenant: TenantOption) {
  return Math.max(1, Number(tenant.totalOutstandingPeriods ?? 1))
}

function targetCoverageStartForTenant(tenant: TenantOption) {
  return (tenant.targetCoverageStart ?? tenant.targetDueDate ?? tenant.rentDueDate).slice(0, 10)
}

function paymentTargetPresentation() {
  return { label: 'Outstanding', amountClass: 'text-amber-700', labelClass: 'text-amber-600' }
}

function PaymentFormFields({ initialData }: PaymentFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryTenantId = searchParams.get('tenantId')

  const [tenants, setTenants] = useState<TenantOption[]>([])
  const [propertyId, setPropertyId] = useState<number | ''>('')
  const [tenantPickerOpen, setTenantPickerOpen] = useState(false)
  const [pickerPropertyId, setPickerPropertyId] = useState<number | ''>('')
  const [propertySearch, setPropertySearch] = useState('')
  const [tenantSearch, setTenantSearch] = useState('')
  const [tenantId, setTenantId] = useState<number | ''>(initialData?.tenantId ?? '')
  const [amountPaid, setAmountPaid] = useState(initialData ? String(initialData.amountPaid) : '')
  const [paymentMonth, setPaymentMonth] = useState(
    initialData?.paymentMonth ?? currentPaymentMonth()
  )
  const [monthsCovered, setMonthsCovered] = useState(initialData?.monthsCovered ?? 1)
  const [customMonths, setCustomMonths] = useState(String(initialData?.monthsCovered ?? 2))
  const [coverageStart, setCoverageStart] = useState(initialData?.coverageStart ?? '')
  const [coverageEnd, setCoverageEnd] = useState(initialData?.coverageEnd ?? '')
  const [paymentDate, setPaymentDate] = useState(
    initialData?.paymentDate ?? dateKey()
  )
  const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod ?? 'cash')
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(
      initialData ? '/api/tenants' : '/api/tenants?active=true&paymentDue=true',
      { cache: 'no-store' }
    )
      .then((r) => r.json())
      .then((data) => {
        const rows = data || []
        setTenants(rows)

        const preselectedTenant = rows.find((tenant: TenantOption) =>
          tenant.id === Number(initialData?.tenantId ?? queryTenantId)
        )
        if (preselectedTenant) {
          setPropertyId(preselectedTenant.propertyId)
        } else {
          const uniquePropertyIds = Array.from(new Set(rows.map((tenant: TenantOption) => tenant.propertyId)))
          if (!initialData && uniquePropertyIds.length === 1) {
            setPropertyId(Number(uniquePropertyIds[0]))
          }
        }

        if (!initialData && queryTenantId) {
          const matchingTenant = rows.find((t: TenantOption) => t.id === Number(queryTenantId))
          if (matchingTenant) {
            const targetStart = targetCoverageStartForTenant(matchingTenant)
            const scheduledMonths = scheduledMonthsForTenant(matchingTenant)
            setTenantId(matchingTenant.id)
            setCoverageStart(targetStart)
            setPaymentMonth(matchingTenant.targetMonth ?? targetStart.slice(0, 7))
            setMonthsCovered(scheduledMonths)
            setCustomMonths(String(scheduledMonths))
            setAmountPaid(String(suggestedAmountForTenant(matchingTenant, scheduledMonths)))
          }
        }
      })
      .catch(() => setTenants([]))
  }, [queryTenantId, initialData])

  const selectedTenant = tenants.find((tenant) => tenant.id === Number(tenantId))
  const selectedTarget = selectedTenant ? paymentTargetPresentation() : null
  const properties = Array.from(
    tenants.reduce((map, tenant) => {
      const existing = map.get(tenant.propertyId)
      map.set(tenant.propertyId, {
        id: tenant.propertyId,
        name: tenant.propertyName,
        tenantCount: (existing?.tenantCount ?? 0) + 1
      })
      return map
    }, new Map<number, PropertyOption>()).values()
  ).sort((a, b) => a.name.localeCompare(b.name))
  const filteredProperties = properties.filter((property) =>
    !propertySearch.trim() || property.name.toLowerCase().includes(propertySearch.trim().toLowerCase())
  )
  const selectedProperty = properties.find((property) => property.id === Number(propertyId))
  const pickerProperty = properties.find((property) => property.id === Number(pickerPropertyId))
  const tenantsForPickerProperty = pickerPropertyId
    ? tenants.filter((tenant) => tenant.propertyId === Number(pickerPropertyId))
    : []
  const searchedTenants = tenantsForPickerProperty.filter((tenant) => {
    const search = tenantSearch.trim().toLowerCase()
    if (!search) return true

    return [
      tenant.fullName,
      tenant.phone ?? '',
      tenant.email ?? '',
      tenant.unitNumber,
      tenant.propertyName
    ].some((value) => value.toLowerCase().includes(search))
  })
  const tenantOptions = selectedTenant && selectedTenant.propertyId === Number(pickerPropertyId) && !searchedTenants.some((tenant) => tenant.id === selectedTenant.id)
    ? [selectedTenant, ...searchedTenants]
    : searchedTenants

  function openTenantPicker() {
    setTenantPickerOpen(true)
    setPickerPropertyId('')
    setPropertySearch('')
    setTenantSearch('')
  }

  function closeTenantPicker() {
    setTenantPickerOpen(false)
    setPickerPropertyId('')
    setPropertySearch('')
    setTenantSearch('')
  }

  function selectTenant(nextTenantId: number | '') {
    setTenantId(nextTenantId)
    const matching = tenants.find((tenant) => tenant.id === nextTenantId)
    if (matching) {
      const targetStart = targetCoverageStartForTenant(matching)
      const scheduledMonths = scheduledMonthsForTenant(matching)
      setPropertyId(matching.propertyId)
      setCoverageStart(targetStart)
      setPaymentMonth(matching.targetMonth ?? targetStart.slice(0, 7))
      setMonthsCovered(scheduledMonths)
      setCustomMonths(String(scheduledMonths))
      setAmountPaid(String(suggestedAmountForTenant(matching, scheduledMonths)))
    }
  }

  function chooseTenant(tenant: TenantOption) {
    selectTenant(tenant.id)
    closeTenantPicker()
  }

  useEffect(() => {
    if (!selectedTenant || initialData?.coverageStart) {
      return
    }

    const targetStart = targetCoverageStartForTenant(selectedTenant)
    setCoverageStart(targetStart)
    setPaymentMonth(selectedTenant.targetMonth ?? targetStart.slice(0, 7))
    setAmountPaid(String(suggestedAmountForTenant(selectedTenant, monthsCovered)))
  }, [initialData, monthsCovered, selectedTenant])

  useEffect(() => {
    const nextCoverageEnd = addMonths(coverageStart, monthsCovered)
    setCoverageEnd(nextCoverageEnd)

    if (selectedTenant && !initialData) {
      setAmountPaid(String(suggestedAmountForTenant(selectedTenant, monthsCovered)))
    }
  }, [coverageStart, initialData, monthsCovered, selectedTenant])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!tenantId) {
      setError('Please select a unit before saving the payment.')
      return
    }

    setIsSaving(true)

    const payload = {
      tenantId: Number(tenantId),
      amountPaid,
      paymentMonth,
      coverageStart,
      coverageEnd,
      monthsCovered,
      paymentDate,
      paymentMethod,
      notes
    }

    const response = await fetch(
      initialData ? `/api/rent-payments/${initialData.id}` : '/api/rent-payments',
      {
        method: initialData ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    )

    setIsSaving(false)

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      setError(payload?.error ?? 'Failed to save payment')
      return
    }

    router.push('/payments')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <FormNotice message={error} />

      <div>
        <label className="field-label">Unit / tenant</label>
        <button
          type="button"
          onClick={openTenantPicker}
          className="field-input flex min-h-[52px] items-center justify-between gap-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/30"
        >
          <span className="min-w-0">
            {selectedTenant ? (
              <>
                <span className="block truncate text-sm font-black text-slate-950">
                  Unit {selectedTenant.unitNumber}
                </span>
                <span className="mt-0.5 block truncate text-xs text-slate-500">
                  {selectedTenant.fullName} - {selectedProperty?.name ?? selectedTenant.propertyName}
                </span>
              </>
            ) : (
              <>
                <span className="block text-sm font-black text-slate-700">Select unit</span>
                <span className="mt-0.5 block text-xs text-slate-500">Choose property, then unit</span>
              </>
            )}
          </span>
          <UserRound className="h-5 w-5 shrink-0 text-emerald-700" strokeWidth={1.9} />
        </button>
      </div>

      {tenantPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-3 py-4 sm:items-center" role="dialog" aria-modal="true">
          <div className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-950">
                  {pickerProperty ? pickerProperty.name : 'Choose property'}
                </p>
                <p className="text-xs text-slate-500">
                  {pickerProperty ? 'Select the unit and tenant for this payment.' : 'Select the property for this payment.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeTenantPicker}
                aria-label="Close tenant picker"
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
                      className="field-input"
                      style={{ paddingLeft: '2.5rem' }}
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
                          setTenantSearch('')
                        }}
                        className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                            <Building2 className="h-4 w-4" strokeWidth={1.9} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-black text-slate-950">{property.name}</span>
                            <span className="block text-xs text-slate-500">{property.tenantCount} occupied unit{property.tenantCount === 1 ? '' : 's'}</span>
                          </span>
                        </span>
                        {property.id === propertyId && <Check className="h-4 w-4 shrink-0 text-emerald-700" strokeWidth={2} />}
                      </button>
                    ))}
                    {filteredProperties.length === 0 && (
                      <p className="rounded-xl bg-slate-50 px-3 py-6 text-center text-sm font-semibold text-slate-500">
                        {tenants.length === 0
                          ? 'No tenant payments are currently due.'
                          : 'No properties match that search.'}
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
                      setTenantSearch('')
                    }}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-800"
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={1.9} />
                    Back to properties
                  </button>

                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.9} />
                    <input
                      value={tenantSearch}
                      onChange={(e) => setTenantSearch(e.target.value)}
                      className="field-input"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="Search unit, tenant, phone, or email..."
                    />
                  </div>

                  <div className="grid gap-2">
                    {tenantOptions.map((tenant) => {
                      const target = paymentTargetPresentation()
                      return (
                        <button
                          key={tenant.id}
                          type="button"
                          onClick={() => chooseTenant(tenant)}
                          className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-black text-slate-950">Unit {tenant.unitNumber}</span>
                            <span className="block text-xs text-slate-500">
                              {tenant.fullName} - {currency(tenant.rentAmount)}/mo
                            </span>
                            <span className="block truncate text-xs text-slate-400">
                              {tenant.phone || tenant.email || 'No contact saved'}
                            </span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className={`block text-xs font-black uppercase tracking-[0.08em] ${target.labelClass}`}>
                              {target.label}
                            </span>
                            <span className={`block text-sm font-black ${target.amountClass}`}>
                              {currency(Number(tenant.totalOutstandingBalance ?? tenant.targetBalance ?? tenant.rentAmount))}
                            </span>
                            <span className="block text-[10px] font-semibold text-slate-400">
                              {formatDate(tenant.nextPaymentDate ?? tenant.targetDueDate ?? tenant.rentDueDate)}
                            </span>
                            {tenant.id === tenantId && <Check className="ml-auto mt-1 h-4 w-4 text-emerald-700" strokeWidth={2} />}
                          </span>
                        </button>
                      )
                    })}
                    {tenantOptions.length === 0 && (
                      <p className="rounded-xl bg-slate-50 px-3 py-6 text-center text-sm font-semibold text-slate-500">
                        No tenants match that search.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedTenant ? (
        <div className="grid gap-3 rounded-xl border bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-3" style={{ borderColor: '#e2e8f0' }}>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Monthly rent</p>
            <p className="mt-1 font-black text-slate-950">{currency(selectedTenant.rentAmount)}</p>
          </div>
          <div>
            <p className={`text-xs font-black uppercase tracking-[0.12em] ${selectedTarget?.labelClass ?? 'text-slate-400'}`}>
              {selectedTarget?.label ?? 'Scheduled amount'}
            </p>
            <p className={`mt-1 font-black ${selectedTarget?.amountClass ?? 'text-slate-950'}`}>
              {currency(Number(selectedTenant.targetScheduledBalance ?? selectedTenant.targetBalance ?? selectedTenant.rentAmount))}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Next scheduled {formatDate(selectedTenant.nextPaymentDate ?? selectedTenant.targetDueDate ?? selectedTenant.rentDueDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Already paid</p>
            <p className="mt-1 font-black text-emerald-700">{currency(Number(selectedTenant.targetAmountPaid ?? 0))}</p>
            <p className="mt-0.5 text-xs text-slate-500">Extra money carries forward.</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label">Amount paid (UGX)</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={amountPaid}
            onChange={(e) => setAmountPaid(cleanMoneyInput(e.target.value))}
            required
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label">Applies first to</label>
          <div className="field-input bg-slate-50 text-slate-700">
            {monthLabel(paymentMonth)}
          </div>
        </div>
      </div>

      <section className="rounded-xl border bg-white p-4" style={{ borderColor: '#e2e8f0' }}>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>Rent coverage</p>
          <p className="text-xs text-slate-500">Money is applied to the oldest unpaid balance first; any extra moves into the next month.</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div>
            <label className="field-label">Coverage starts</label>
            <input
              type="date"
              value={coverageStart}
              onChange={(e) => {
                setCoverageStart(e.target.value)
                setPaymentMonth(e.target.value.slice(0, 7))
              }}
              required
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">Coverage ends</label>
            <div className="field-input min-w-[11rem] bg-slate-50 text-slate-700">
              {coverageEnd || 'Select start'}
            </div>
          </div>
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
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label">Payment date</label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label">Payment method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="field-input"
          >
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="mobile_money">Mobile money</option>
            <option value="card">Card</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="field-label">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="field-input"
          placeholder="Receipt number, check number, or other details..."
        />
      </div>

      <div className="form-actions">
        <button
          disabled={isSaving}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: '#00A550', boxShadow: '0 4px 14px rgba(0,165,80,0.3)' }}
        >
          {isSaving ? 'Saving...' : initialData ? 'Save Payment' : 'Record Payment'}
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

export default function PaymentForm(props: PaymentFormProps) {
  return (
    <Suspense fallback={<div className="text-slate-500 text-sm">Loading form...</div>}>
      <PaymentFormFields {...props} />
    </Suspense>
  )
}
