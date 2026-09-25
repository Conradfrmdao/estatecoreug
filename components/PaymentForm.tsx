'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import FormNotice from '@/components/FormNotice'
import CarryForwardNote, { CarryForwardBreakdown } from '@/components/CarryForwardNote'
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
  outstandingMonths?: { month: string; balance: number }[]
  carriedForwardBalance?: number
  carriedForwardMonths?: { month: string; balance: number }[]
  currentMonthBalance?: number
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

function paymentDueAmountForTenant(tenant: TenantOption) {
  const outstanding = Number(tenant.totalOutstandingBalance ?? 0)
  if (outstanding > 0) return outstanding

  const targetBalance = Number(tenant.targetBalance ?? 0)
  return targetBalance > 0 ? targetBalance : tenant.rentAmount
}

function paymentTargetPresentation(tenant?: TenantOption) {
  if (tenant && Number(tenant.totalOutstandingBalance ?? 0) <= 0) {
    return { label: 'Paid up', amountClass: 'text-paid-fg', labelClass: 'text-paid-fg' }
  }

  return { label: 'Outstanding', amountClass: 'text-carried-fg', labelClass: 'text-carried-fg' }
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
      initialData ? '/api/tenants' : '/api/tenants?active=true',
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
  const selectedTarget = selectedTenant ? paymentTargetPresentation(selectedTenant) : null
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
          className="field-input flex !min-h-[60px] items-center justify-between gap-3 !rounded-[22px] text-left"
        >
          <span className="min-w-0">
            {selectedTenant ? (
              <>
                <span className="block truncate text-[14.5px] font-extrabold text-ink">
                  Unit {selectedTenant.unitNumber}
                </span>
                <span className="mt-0.5 block truncate text-[12.5px] font-medium text-muted">
                  {selectedTenant.fullName} - {selectedProperty?.name ?? selectedTenant.propertyName}
                </span>
              </>
            ) : (
              <>
                <span className="block text-[14.5px] font-bold text-ink-soft">Select unit</span>
                <span className="mt-0.5 block text-[12.5px] font-medium text-muted">Choose property, then unit</span>
              </>
            )}
          </span>
          <UserRound className="h-5 w-5 shrink-0 text-brand-text" strokeWidth={1.9} />
        </button>
      </div>

      {tenantPickerOpen && (
        <div className="overlay-enter fixed inset-0 z-50 flex items-end justify-center bg-ink/45 px-3 py-4 backdrop-blur-[2px] sm:items-center" role="dialog" aria-modal="true" aria-label="Choose tenant">
          <div className="dialog-enter max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-overlay">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div className="min-w-0">
                <p className="text-[16px] font-extrabold text-ink">
                  {pickerProperty ? pickerProperty.name : 'Choose property'}
                </p>
                <p className="text-[12.5px] font-medium text-muted">
                  {pickerProperty ? 'Select the unit and tenant for this payment.' : 'Select the property for this payment.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeTenantPicker}
                aria-label="Close tenant picker"
                className="btn btn-soft btn-icon btn-sm shrink-0"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto p-5">
              {!pickerProperty ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-[18px] top-1/2 h-4 w-4 -translate-y-1/2 text-muted" strokeWidth={2} />
                    <input
                      value={propertySearch}
                      onChange={(e) => setPropertySearch(e.target.value)}
                      className="field-input"
                      style={{ paddingLeft: '2.75rem' }}
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
                        className="flex min-h-14 items-center justify-between gap-3 rounded-[18px] bg-canvas px-4 py-2.5 text-left transition hover:bg-mint"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-forest">
                            <Building2 className="h-4 w-4" strokeWidth={1.9} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[14.5px] font-extrabold text-ink">{property.name}</span>
                            <span className="block text-[12.5px] font-medium text-muted">{property.tenantCount} occupied unit{property.tenantCount === 1 ? '' : 's'}</span>
                          </span>
                        </span>
                        {property.id === propertyId && <Check className="h-4 w-4 shrink-0 text-brand-text" strokeWidth={2.4} />}
                      </button>
                    ))}
                    {filteredProperties.length === 0 && (
                      <p className="rounded-[18px] bg-canvas px-3 py-6 text-center text-[13.5px] font-semibold text-muted">
                        {tenants.length === 0
                          ? 'No active tenants were found.'
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
                    className="inline-flex items-center gap-2 rounded-full py-1 pr-2 text-[13.5px] font-bold text-muted transition hover:text-ink"
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={1.9} />
                    Back to properties
                  </button>

                  <div className="relative">
                    <Search className="pointer-events-none absolute left-[18px] top-1/2 h-4 w-4 -translate-y-1/2 text-muted" strokeWidth={2} />
                    <input
                      value={tenantSearch}
                      onChange={(e) => setTenantSearch(e.target.value)}
                      className="field-input"
                      style={{ paddingLeft: '2.75rem' }}
                      placeholder="Search unit, tenant, phone, or email..."
                    />
                  </div>

                  <div className="grid gap-2">
                    {tenantOptions.map((tenant) => {
                      const target = paymentTargetPresentation(tenant)
                      return (
                        <button
                          key={tenant.id}
                          type="button"
                          onClick={() => chooseTenant(tenant)}
                          className="flex min-h-14 items-center justify-between gap-3 rounded-[18px] bg-canvas px-4 py-3 text-left transition hover:bg-mint"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-[14.5px] font-extrabold text-ink">Unit {tenant.unitNumber}</span>
                            <span className="block text-[12.5px] font-medium text-ink-soft">
                              {tenant.fullName} - {currency(tenant.rentAmount)}/mo
                            </span>
                            <span className="block truncate text-[12px] font-medium text-muted">
                              {tenant.phone || tenant.email || 'No contact saved'}
                            </span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className={`block text-[10.5px] font-extrabold uppercase tracking-[0.08em] ${target.labelClass}`}>
                              {target.label}
                            </span>
                            <span className={`block text-[14.5px] font-extrabold tabular-nums ${target.amountClass}`}>
                              {currency(paymentDueAmountForTenant(tenant))}
                            </span>
                            <span className="block text-[11px] font-semibold text-muted">
                              {formatDate(tenant.nextPaymentDate ?? tenant.targetDueDate ?? tenant.rentDueDate)}
                            </span>
                            <CarryForwardNote
                              compact
                              carriedForwardBalance={Number(tenant.carriedForwardBalance ?? 0)}
                              carriedForwardMonths={tenant.carriedForwardMonths ?? []}
                              className="justify-end whitespace-nowrap text-right"
                            />
                            {tenant.id === tenantId && <Check className="ml-auto mt-1 h-4 w-4 text-brand-text" strokeWidth={2.4} />}
                          </span>
                        </button>
                      )
                    })}
                    {tenantOptions.length === 0 && (
                      <p className="rounded-[18px] bg-canvas px-3 py-6 text-center text-[13.5px] font-semibold text-muted">
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
        <div className="fade-in grid gap-4 rounded-[22px] bg-canvas p-5 text-[14px] text-ink-soft">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Monthly rent</p>
              <p className="mt-1 text-[16px] font-extrabold tabular-nums text-ink">{currency(selectedTenant.rentAmount)}</p>
            </div>
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-[0.08em] ${selectedTarget?.labelClass ?? 'text-muted'}`}>
                {selectedTarget?.label ?? 'Scheduled amount'}
              </p>
              <p className={`mt-1 text-[16px] font-extrabold tabular-nums ${selectedTarget?.amountClass ?? 'text-ink'}`}>
                {currency(paymentDueAmountForTenant(selectedTenant))}
              </p>
              <p className="mt-0.5 text-[12px] font-medium text-muted">
                Next scheduled {formatDate(selectedTenant.nextPaymentDate ?? selectedTenant.targetDueDate ?? selectedTenant.rentDueDate)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Already paid</p>
              <p className="mt-1 text-[16px] font-extrabold tabular-nums text-brand-text">{currency(Number(selectedTenant.targetAmountPaid ?? 0))}</p>
              <p className="mt-0.5 text-[12px] font-medium text-muted">Extra money carries forward.</p>
            </div>
          </div>

          {Number(selectedTenant.carriedForwardBalance ?? 0) > 0 && (
            <div className="rounded-[18px] bg-carried-bg px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-carried-fg">
                Balance carried forward
              </p>
              <p className="mt-1 text-[14px] font-extrabold text-carried-fg">
                {currency(Number(selectedTenant.carriedForwardBalance ?? 0))} from earlier months
              </p>
              <CarryForwardBreakdown
                months={selectedTenant.outstandingMonths ?? []}
                currentMonth={currentPaymentMonth()}
                className="mt-2 border-t border-carried-bar/30 pt-2"
              />
            </div>
          )}

          {Number(selectedTenant.totalOutstandingBalance ?? 0) <= 0 && (
            <p className="rounded-[18px] bg-mint px-4 py-2.5 text-[12.5px] font-semibold text-forest">
              This tenant has no rent due yet. This payment will be recorded in advance for {monthLabel(paymentMonth)}.
            </p>
          )}
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
          <div className="field-input text-ink-soft">
            {monthLabel(paymentMonth)}
          </div>
        </div>
      </div>

      <section className="rounded-[22px] border border-line p-4 sm:p-5">
        <div className="flex flex-col gap-1">
          <p className="text-[15px] font-extrabold text-ink">Rent coverage</p>
          <p className="text-[12.5px] font-medium text-muted">Money is applied to the oldest unpaid balance first; any extra moves into the next month.</p>
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
            <div className="field-input min-w-[11rem] text-ink-soft">
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
          className="btn btn-lg btn-ink px-7"
        >
          {isSaving ? 'Saving...' : initialData ? 'Save Payment' : 'Record Payment'}
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

export default function PaymentForm(props: PaymentFormProps) {
  return (
    <Suspense fallback={<div className="space-y-4" aria-busy="true"><span className="skeleton block h-[60px] rounded-[22px]" /><span className="skeleton block h-[52px] rounded-full" /><span className="skeleton block h-40 rounded-[22px]" /></div>}>
      <PaymentFormFields {...props} />
    </Suspense>
  )
}
