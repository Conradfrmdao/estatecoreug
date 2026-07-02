'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import FormNotice from '@/components/FormNotice'
import { currency, currentPaymentMonth, dateKey, monthLabel } from '@/lib/format'

type TenantOption = {
  id: number
  fullName: string
  unitId: number
  unitNumber: string
  propertyName: string
  rentAmount: number
  rentDueDate: string
  targetMonth?: string
  targetDueDate?: string
  targetAmountPaid?: number
  targetBalance?: number
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
  const targetBalance = Number(tenant.targetBalance ?? tenant.rentAmount)
  const firstMonthBalance = targetBalance > 0 ? targetBalance : tenant.rentAmount
  return firstMonthBalance + Math.max(0, months - 1) * tenant.rentAmount
}

function targetDateForTenant(tenant: TenantOption) {
  return (tenant.targetDueDate ?? tenant.rentDueDate).slice(0, 10)
}

function PaymentFormFields({ initialData }: PaymentFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryTenantId = searchParams.get('tenantId')

  const [tenants, setTenants] = useState<TenantOption[]>([])
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
    fetch('/api/tenants?active=true')
      .then((r) => r.json())
      .then((data) => {
        setTenants(data || [])
        if (!initialData && queryTenantId) {
          const matchingTenant = data?.find((t: any) => t.id === Number(queryTenantId))
          if (matchingTenant) {
            setTenantId(matchingTenant.id)
            setAmountPaid(String(suggestedAmountForTenant(matchingTenant, 1)))
          }
        }
      })
      .catch(() => setTenants([]))
  }, [queryTenantId, initialData])

  const selectedTenant = tenants.find((tenant) => tenant.id === Number(tenantId))

  useEffect(() => {
    if (!selectedTenant || initialData?.coverageStart) {
      return
    }

    const targetStart = targetDateForTenant(selectedTenant)
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
    setIsSaving(true)

    const payload = {
      tenantId: Number(tenantId),
      amountPaid: Number(amountPaid),
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
        <label className="field-label">Tenant</label>
        <select
          value={tenantId}
          onChange={(e) => {
            const nextId = Number(e.target.value)
            setTenantId(nextId)
            const matching = tenants.find((t) => t.id === nextId)
            if (matching) {
              const targetStart = targetDateForTenant(matching)
              setCoverageStart(targetStart)
              setPaymentMonth(matching.targetMonth ?? targetStart.slice(0, 7))
              setMonthsCovered(1)
              setAmountPaid(String(suggestedAmountForTenant(matching, 1)))
            }
          }}
          required
          className="field-input"
        >
          <option value="">Select tenant</option>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.fullName} - {tenant.propertyName} / Unit {tenant.unitNumber} (UGX {tenant.rentAmount.toLocaleString()}/mo)
            </option>
          ))}
        </select>
      </div>

      {selectedTenant ? (
        <div className="grid gap-3 rounded-xl border bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-3" style={{ borderColor: '#e2e8f0' }}>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Monthly rent</p>
            <p className="mt-1 font-black text-slate-950">{currency(selectedTenant.rentAmount)}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Outstanding to pay</p>
            <p className="mt-1 font-black text-amber-700">
              {currency(Number(selectedTenant.targetBalance ?? selectedTenant.rentAmount))}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{monthLabel(selectedTenant.targetMonth ?? paymentMonth)}</p>
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
            type="number"
            min="0"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
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
