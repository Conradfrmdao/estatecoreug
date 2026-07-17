'use client'

import { currency, formatDate, monthLabel } from '@/lib/format'
import { Building2, CalendarDays, Home, Mail, Phone, UserRound, WalletCards, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type RentStatus = 'paid' | 'partial' | 'not_due' | 'unpaid' | 'upcoming' | 'due_today' | 'overdue'

export type TenantSearchRecord = {
  id: number
  fullName: string
  phone: string
  email: string | null
  active: boolean
  moveInDate: string
  rentDueDate: string
  paymentTiming: string
  billingCycleMonths: number
  unitId: number
  unitNumber: string
  unitStatus: string
  rentAmount: number
  propertyId: number
  propertyName: string
  propertyLocation: string
  targetMonth: string
  targetDueDate: string
  targetAmountPaid: number
  targetBalance: number
  targetScheduledBalance: number
  targetPaymentStatus: RentStatus
}

function statusPresentation(status: RentStatus) {
  if (status === 'paid') return { label: 'Paid', className: 'bg-emerald-100 text-emerald-700' }
  if (status === 'partial') return { label: 'Partial', className: 'bg-amber-100 text-amber-700' }
  if (status === 'not_due') return { label: 'Not due', className: 'bg-slate-100 text-slate-600' }
  if (status === 'upcoming') return { label: 'Due soon', className: 'bg-blue-50 text-blue-700' }
  if (status === 'due_today') return { label: 'Due today', className: 'bg-orange-100 text-orange-700' }
  if (status === 'overdue') return { label: 'Overdue', className: 'bg-rose-100 text-rose-700' }
  return { label: 'Outstanding', className: 'bg-red-100 text-red-700' }
}

function isDue(status: RentStatus) {
  return ['partial', 'unpaid', 'due_today', 'overdue'].includes(status)
}

export default function TenantSearchResults({ tenants }: { tenants: TenantSearchRecord[] }) {
  const [selected, setSelected] = useState<TenantSearchRecord | null>(null)

  useEffect(() => {
    if (!selected) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelected(null)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [selected])

  const modal = selected ? (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setSelected(null)
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`${selected.fullName} tenant details`}
        className="flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[88vh] sm:rounded-2xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <UserRound className="h-5 w-5" strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-black text-slate-950">{selected.fullName}</h2>
              <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${selected.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {selected.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="mt-0.5 truncate text-sm text-slate-500">
              {selected.propertyName} - Unit {selected.unitNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label="Close tenant details"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="flex items-center gap-2 text-xs font-black uppercase text-slate-400"><Phone className="h-4 w-4" /> Phone</dt>
                <dd className="mt-1 break-words text-sm font-bold text-slate-800">{selected.phone}</dd>
              </div>
              <div className="min-w-0">
                <dt className="flex items-center gap-2 text-xs font-black uppercase text-slate-400"><Mail className="h-4 w-4" /> Email</dt>
                <dd className="mt-1 break-words text-sm font-bold text-slate-800">{selected.email || 'Not provided'}</dd>
              </div>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="flex items-center gap-2 text-xs font-black uppercase text-slate-400"><Building2 className="h-4 w-4" /> Property</dt>
                <dd className="mt-1 text-sm font-bold text-slate-800">{selected.propertyName}</dd>
                <dd className="text-xs text-slate-500">{selected.propertyLocation}</dd>
              </div>
              <div className="min-w-0">
                <dt className="flex items-center gap-2 text-xs font-black uppercase text-slate-400"><Home className="h-4 w-4" /> Unit</dt>
                <dd className="mt-1 text-sm font-bold text-slate-800">Unit {selected.unitNumber}</dd>
                <dd className="text-xs capitalize text-slate-500">{selected.unitStatus}</dd>
              </div>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-black uppercase text-slate-400">Monthly rent</dt>
                <dd className="mt-1 text-base font-black text-slate-950">{currency(selected.rentAmount)}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase text-slate-400">Payment arrangement</dt>
                <dd className="mt-1 text-sm font-bold capitalize text-slate-800">
                  {selected.paymentTiming} - every {selected.billingCycleMonths} month{selected.billingCycleMonths === 1 ? '' : 's'}
                </dd>
              </div>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-2 text-xs font-black uppercase text-slate-400"><CalendarDays className="h-4 w-4" /> Move in</dt>
                <dd className="mt-1 text-sm font-bold text-slate-800">{formatDate(selected.moveInDate)}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase text-slate-400">Next payment date</dt>
                <dd className="mt-1 text-sm font-bold text-slate-800">{formatDate(selected.rentDueDate)}</dd>
              </div>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-2 text-xs font-black uppercase text-slate-400"><WalletCards className="h-4 w-4" /> Rent status</dt>
                <dd className="mt-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-black ${statusPresentation(selected.targetPaymentStatus).className}`}>
                    {statusPresentation(selected.targetPaymentStatus).label}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase text-slate-400">
                  {isDue(selected.targetPaymentStatus) ? 'Outstanding balance' : 'Next scheduled rent'}
                </dt>
                <dd className={`mt-1 text-base font-black ${isDue(selected.targetPaymentStatus) ? 'text-amber-700' : 'text-slate-800'}`}>
                  {currency(selected.targetScheduledBalance || selected.targetBalance)}
                </dd>
                <dd className="text-xs text-slate-500">{monthLabel(selected.targetMonth)} - {currency(selected.targetAmountPaid)} already paid</dd>
              </div>
            </div>
          </dl>
        </div>

        <footer className="grid shrink-0 gap-2 border-t border-slate-200 bg-white p-4 min-[390px]:grid-cols-2 sm:flex sm:justify-end">
          <Link href={`/properties/${selected.propertyId}`} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
            View property
          </Link>
          <Link href={`/tenants/${selected.id}/edit`} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
            Edit tenant
          </Link>
          {selected.active && isDue(selected.targetPaymentStatus) && (
            <Link href={`/payments/new?tenantId=${selected.id}`} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700">
              Record payment
            </Link>
          )}
        </footer>
      </section>
    </div>
  ) : null

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-black text-slate-950">Tenant results</h2>
        <p className="mt-0.5 text-xs text-slate-500">{tenants.length} matching tenant{tenants.length === 1 ? '' : 's'}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Property / Unit</th>
                <th>Contact</th>
                <th>Monthly Rent</th>
                <th>Next Payment</th>
                <th>Status</th>
                <th className="text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => {
                const status = statusPresentation(tenant.targetPaymentStatus)
                return (
                  <tr key={tenant.id}>
                    <td data-label="Tenant">
                      <button type="button" onClick={() => setSelected(tenant)} className="text-left font-black text-slate-950 transition hover:text-emerald-700">
                        {tenant.fullName}
                      </button>
                      <span className="mt-0.5 block text-xs text-slate-500">{tenant.active ? 'Active tenant' : 'Inactive tenant'}</span>
                    </td>
                    <td data-label="Property / Unit">
                      <span className="block font-bold text-slate-800">{tenant.propertyName}</span>
                      <span className="block text-xs text-slate-500">Unit {tenant.unitNumber} - {tenant.propertyLocation}</span>
                    </td>
                    <td data-label="Contact">
                      <span className="block text-sm font-semibold text-slate-700">{tenant.phone}</span>
                      <span className="block max-w-48 truncate text-xs text-slate-500">{tenant.email || 'No email'}</span>
                    </td>
                    <td data-label="Monthly Rent" className="font-bold text-slate-900">{currency(tenant.rentAmount)}</td>
                    <td data-label="Next Payment">
                      <span className="block text-sm font-semibold text-slate-800">{formatDate(tenant.rentDueDate)}</span>
                      <span className="block text-xs text-slate-500">{currency(tenant.targetScheduledBalance || tenant.targetBalance)}</span>
                    </td>
                    <td data-label="Status"><span className={`rounded-full px-2 py-1 text-xs font-black ${status.className}`}>{status.label}</span></td>
                    <td data-label="Details">
                      <button type="button" onClick={() => setSelected(tenant)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50">
                        View details
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {tenants.length === 0 && (
          <p className="px-4 py-12 text-center text-sm font-semibold text-slate-500">No tenants match that search.</p>
        )}
      </div>

      {typeof document !== 'undefined' && modal ? createPortal(modal, document.body) : null}
    </section>
  )
}
