'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type TenantOption = {
  id: number
  fullName: string
  unitId: number
  unitNumber: string
  propertyName: string
  rentAmount: number
}

type PaymentFormProps = {
  initialData?: {
    id: number
    tenantId: number
    amountPaid: number
    paymentMonth: string
    paymentDate: string
    paymentMethod: string
    notes: string | null
  }
}

function PaymentFormFields({ initialData }: PaymentFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryTenantId = searchParams.get('tenantId')

  const [tenants, setTenants] = useState<TenantOption[]>([])
  const [tenantId, setTenantId] = useState<number | ''>(initialData?.tenantId ?? '')
  const [amountPaid, setAmountPaid] = useState(initialData ? String(initialData.amountPaid) : '')
  const [paymentMonth, setPaymentMonth] = useState(
    initialData?.paymentMonth ?? new Date().toISOString().slice(0, 7)
  )
  const [paymentDate, setPaymentDate] = useState(
    initialData?.paymentDate ?? new Date().toISOString().slice(0, 10)
  )
  const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod ?? 'cash')
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetch('/api/tenants?active=true')
      .then((r) => r.json())
      .then((data) => {
        setTenants(data || [])
        if (!initialData && queryTenantId) {
          const matchingTenant = data?.find((t: any) => t.id === Number(queryTenantId))
          if (matchingTenant) {
            setTenantId(matchingTenant.id)
            setAmountPaid(String(matchingTenant.rentAmount))
          }
        }
      })
      .catch(() => setTenants([]))
  }, [queryTenantId, initialData])

  const selectedTenant = tenants.find((tenant) => tenant.id === Number(tenantId))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    const payload = {
      tenantId: Number(tenantId),
      amountPaid: Number(amountPaid),
      paymentMonth,
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
      alert(payload?.error ?? 'Failed to save payment')
      return
    }

    router.push('/payments')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div>
        <label className="field-label">Tenant</label>
        <select
          value={tenantId}
          onChange={(e) => {
            const nextId = Number(e.target.value)
            setTenantId(nextId)
            const matching = tenants.find((t) => t.id === nextId)
            if (matching) {
              setAmountPaid(String(matching.rentAmount))
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
        <div className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-700" style={{ borderColor: '#e2e8f0' }}>
          <strong>Unit {selectedTenant.unitNumber} Rent:</strong> UGX {selectedTenant.rentAmount.toLocaleString()} per month
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
          <label className="field-label">Payment month</label>
          <input
            type="month"
            value={paymentMonth}
            onChange={(e) => setPaymentMonth(e.target.value)}
            required
            className="field-input"
          />
        </div>
      </div>

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

      <div className="flex items-center gap-3 pt-2">
        <button
          disabled={isSaving}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: '#00A550', boxShadow: '0 4px 14px rgba(0,165,80,0.3)' }}
        >
          {isSaving ? 'Saving…' : initialData ? 'Save Payment' : 'Record Payment'}
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
