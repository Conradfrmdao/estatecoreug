'use client'

import CarryForwardNote, { CarryForwardBreakdown } from '@/components/CarryForwardNote'
import Avatar, { initialsOf, toneFor } from '@/components/ui/Avatar'
import Dialog from '@/components/ui/Dialog'
import { currency, currentPaymentMonth, formatDate, monthLabel, monthShortLabel } from '@/lib/format'
import { Building2, CalendarDays, House, Mail, Phone, UsersRound, Wallet, X } from 'lucide-react'
import Link from 'next/link'
import { useId, useRef, useState, type ReactNode } from 'react'

type RentDisplayStatus = 'paid' | 'cleared' | 'outstanding'

export type TenantSearchRecord = {
  id: number
  fullName: string
  phone: string
  email: string | null
  active: boolean
  moveInDate: string
  nextPaymentDate: string
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
  totalOutstandingBalance: number
  outstandingMonths: { month: string; balance: number }[]
  carriedForwardBalance: number
  carriedForwardMonths: { month: string; balance: number }[]
  currentMonthBalance: number
  displayPaymentStatus: RentDisplayStatus
}

function statusPresentation(status: RentDisplayStatus) {
  if (status === 'paid') return { label: 'Paid', className: 'bg-paid-bg text-paid-fg' }
  if (status === 'cleared') return { label: 'Cleared', className: 'bg-line text-ink-soft' }
  return { label: 'Outstanding', className: 'bg-overdue-bg text-overdue-fg' }
}

function Detail({ icon: Icon, label, children }: { icon?: typeof Phone; label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 rounded-tile bg-canvas px-4 py-3.5">
      <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase leading-[15px] tracking-[0.06em] text-muted">
        {Icon && <Icon aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />}
        {label}
      </dt>
      <dd className="mt-1 break-words text-[14.5px] font-bold leading-5 text-ink">{children}</dd>
    </div>
  )
}

export default function TenantSearchResults({ tenants }: { tenants: TenantSearchRecord[] }) {
  const [selected, setSelected] = useState<TenantSearchRecord | null>(null)
  const [shown, setShown] = useState<TenantSearchRecord | null>(null)
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  function open(tenant: TenantSearchRecord) {
    setShown(tenant)
    setSelected(tenant)
  }

  return (
    <section aria-label="Tenant results" className="space-y-4">
      <div>
        <h2 className="text-[18px] font-extrabold leading-6 text-ink">Tenant results</h2>
        <p className="mt-0.5 text-[13px] font-medium text-muted">
          {tenants.length} matching tenant{tenants.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="rounded-[24px] bg-white p-4 sm:px-7 sm:py-6 lg:rounded-card">
        {tenants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Property / Unit</th>
                  <th>Contact</th>
                  <th>Monthly Rent</th>
                  <th>Next Scheduled</th>
                  <th>Status</th>
                  <th className="text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => {
                  const status = statusPresentation(tenant.displayPaymentStatus)
                  return (
                    <tr key={tenant.id}>
                      <td data-label="Tenant">
                        <div className="flex items-center gap-3">
                          <Avatar initials={initialsOf(tenant.fullName)} tone={tenant.active ? toneFor(tenant.id) : 'muted'} />
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => open(tenant)}
                              className="text-left font-extrabold text-ink transition hover:text-brand-text"
                            >
                              {tenant.fullName}
                            </button>
                            <span className="mt-0.5 block text-[12px] font-medium text-muted">
                              {tenant.active ? 'Active tenant' : 'Inactive tenant'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Property / Unit">
                        <span className="block font-bold text-ink">{tenant.propertyName}</span>
                        <span className="block text-[12px] font-medium text-muted">
                          Unit {tenant.unitNumber} - {tenant.propertyLocation}
                        </span>
                      </td>
                      <td data-label="Contact">
                        <span className="block font-semibold text-ink-soft">{tenant.phone}</span>
                        <span className="block max-w-48 truncate text-[12px] font-medium text-muted">{tenant.email || 'No email'}</span>
                      </td>
                      <td data-label="Monthly Rent" className="font-bold tabular-nums text-ink">{currency(tenant.rentAmount)}</td>
                      <td data-label="Next Scheduled">
                        <span className="block font-bold text-ink">{formatDate(tenant.nextPaymentDate)}</span>
                        <span className="block text-[12px] font-medium text-muted">
                          {tenant.totalOutstandingBalance > 0 ? currency(tenant.totalOutstandingBalance) : 'Cleared'}
                        </span>
                        <CarryForwardNote
                          carriedForwardBalance={tenant.carriedForwardBalance}
                          carriedForwardMonths={tenant.carriedForwardMonths}
                          className="block"
                        />
                      </td>
                      <td data-label="Status"><span className={`pill ${status.className}`}>{status.label}</span></td>
                      <td data-label="Details">
                        <div className="flex justify-end">
                          <button type="button" onClick={() => open(tenant)} className="btn btn-xs btn-outline">
                            View details
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="fade-in flex flex-col items-center gap-3 px-4 py-12 text-center">
            <span className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-canvas text-brand-text">
              <UsersRound aria-hidden="true" className="h-[38px] w-[38px]" strokeWidth={1.8} />
            </span>
            <h3 className="text-[22px] font-extrabold text-ink">No tenants found</h3>
            <p className="text-[14px] font-medium text-muted">No tenants match that search.</p>
          </div>
        )}
      </div>

      <Dialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        labelledBy={titleId}
        variant="sheet-dialog"
        zIndex={100}
        initialFocusRef={closeRef}
        className="flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-overlay sm:max-h-[88vh] sm:rounded-[28px]"
      >
        {shown && (
          <>
            <header className="flex shrink-0 items-start gap-3 px-5 pb-4 pt-5 sm:px-6">
              <Avatar initials={initialsOf(shown.fullName)} tone={shown.active ? toneFor(shown.id) : 'muted'} size={44} shape="circle" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id={titleId} className="truncate text-[20px] font-extrabold text-ink">{shown.fullName}</h2>
                  <span className={shown.active ? 'badge badge-green' : 'badge badge-slate'}>
                    {shown.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[13.5px] font-medium text-muted">
                  {shown.propertyName} - Unit {shown.unitNumber}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close tenant details"
                className="btn btn-soft btn-icon btn-sm shrink-0"
              >
                <X aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6">
              <dl className="grid gap-2.5 sm:grid-cols-2">
                <Detail icon={Phone} label="Phone">{shown.phone}</Detail>
                <Detail icon={Mail} label="Email">{shown.email || 'Not provided'}</Detail>
                <Detail icon={Building2} label="Property">
                  {shown.propertyName}
                  <span className="block text-[12.5px] font-medium text-muted">{shown.propertyLocation}</span>
                </Detail>
                <Detail icon={House} label="Unit">
                  Unit {shown.unitNumber}
                  <span className="block text-[12.5px] font-medium capitalize text-muted">{shown.unitStatus}</span>
                </Detail>
                <Detail label="Monthly rent">{currency(shown.rentAmount)}</Detail>
                <Detail label="Billing frequency">Monthly</Detail>
                <Detail icon={CalendarDays} label="Move in">{formatDate(shown.moveInDate)}</Detail>
                <Detail label="Next scheduled payment">{formatDate(shown.nextPaymentDate)}</Detail>
                <Detail icon={Wallet} label="Rent status">
                  <span className={`pill mt-0.5 ${statusPresentation(shown.displayPaymentStatus).className}`}>
                    {statusPresentation(shown.displayPaymentStatus).label}
                  </span>
                </Detail>
                <Detail label="Total amount demanded">
                  <span className={shown.totalOutstandingBalance > 0 ? 'text-carried-fg' : ''}>
                    {shown.totalOutstandingBalance > 0 ? currency(shown.totalOutstandingBalance) : 'Cleared'}
                  </span>
                  <CarryForwardNote
                    carriedForwardBalance={shown.carriedForwardBalance}
                    carriedForwardMonths={shown.carriedForwardMonths}
                    className="block"
                  />
                  <span className="mt-0.5 block text-[12px] font-medium text-muted">
                    {monthLabel(shown.targetMonth)} - {currency(shown.targetAmountPaid)} already paid
                  </span>
                </Detail>
              </dl>

              {shown.outstandingMonths.length > 0 && (
                <div className="mt-2.5 rounded-tile bg-canvas px-4 py-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted">How this balance builds up</p>
                  <CarryForwardBreakdown months={shown.outstandingMonths} currentMonth={currentPaymentMonth()} className="mt-2" />
                  <div className="mt-2 flex items-center justify-between gap-3 border-t border-line-strong/60 pt-2 text-[12.5px]">
                    <span className="font-extrabold uppercase tracking-wide text-muted">Total demanded</span>
                    <span className="font-extrabold text-carried-fg">{currency(shown.totalOutstandingBalance)}</span>
                  </div>
                  {shown.carriedForwardBalance > 0 && (
                    <p className="mt-2 text-[12px] font-semibold text-muted">
                      {currency(shown.currentMonthBalance)} is for {monthShortLabel(currentPaymentMonth())};{' '}
                      {currency(shown.carriedForwardBalance)} was carried forward from earlier months.
                    </p>
                  )}
                </div>
              )}
            </div>

            <footer
              className="grid shrink-0 gap-2 border-t border-line bg-white px-5 pt-4 min-[390px]:grid-cols-2 sm:flex sm:justify-end sm:px-6"
              style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
            >
              <Link href={`/properties/${shown.propertyId}`} className="btn btn-outline">
                View property
              </Link>
              <Link href={`/tenants/${shown.id}/edit`} className="btn btn-outline">
                Edit tenant
              </Link>
              {shown.active && (
                <Link href={`/payments/new?tenantId=${shown.id}`} className="btn btn-ink min-[390px]:col-span-2 sm:col-span-1">
                  Record payment
                </Link>
              )}
            </footer>
          </>
        )}
      </Dialog>
    </section>
  )
}
