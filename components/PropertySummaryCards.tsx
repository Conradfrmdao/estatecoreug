'use client'

import { currency } from '@/lib/format'
import {
  ArrowUpRight,
  Building2,
  Download,
  Home,
  ReceiptText,
  UsersRound,
  WalletCards,
  X,
  type LucideIcon
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type CardKey = 'units' | 'tenants' | 'rent-roll' | 'paid' | 'outstanding' | 'expenses'
type CardTone = 'green' | 'amber' | 'rose' | 'slate'

type UnitDetail = {
  id: number
  unitNumber: string
  rentAmount: number
  status: string
  tenantName: string | null
}

type TenantDetail = {
  id: number
  fullName: string
  phone: string
  email: string | null
  unitNumber: string
  active: boolean
  moveInDate: string
}

type ReceiptDetail = {
  id: number
  tenantName: string
  unitNumber: string
  amountPaid: number
  paymentDate: string
  paymentMethod: string
}

type OutstandingDetail = {
  tenantId: number
  tenantName: string
  unitNumber: string
  balance: number
  periods: number
  oldestDueDate: string
}

type ExpenseDetail = {
  id: number
  title: string
  category: string
  amount: number
  expenseDate: string
  unitNumber: string | null
}

type PropertySummaryCardsProps = {
  propertyName: string
  monthLabel: string
  summary: {
    totalUnits: number
    occupiedUnits: number
    activeTenants: number
    totalTenants: number
    monthlyRentRoll: number
    collectedThisMonth: number
    outstandingRent: number
    expensesThisMonth: number
  }
  units: UnitDetail[]
  tenants: TenantDetail[]
  receipts: ReceiptDetail[]
  outstanding: OutstandingDetail[]
  expenses: ExpenseDetail[]
}

type CardDefinition = {
  key: CardKey
  label: string
  value: string | number
  sub: string
  icon: LucideIcon
  tone: CardTone
  title: string
  description: string
}

const toneClasses: Record<CardTone, string> = {
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
  slate: 'bg-slate-100 text-slate-700'
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="px-4 py-12 text-center text-sm font-semibold text-slate-500">
      {children}
    </p>
  )
}

export default function PropertySummaryCards({
  propertyName,
  monthLabel,
  summary,
  units,
  tenants,
  receipts,
  outstanding,
  expenses
}: PropertySummaryCardsProps) {
  const [activeCard, setActiveCard] = useState<CardKey | null>(null)
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null)

  const cards: CardDefinition[] = [
    {
      key: 'units',
      label: 'Units',
      value: summary.totalUnits,
      sub: `${summary.occupiedUnits} occupied`,
      icon: Building2,
      tone: 'slate',
      title: `${propertyName} Units`,
      description: 'Occupancy, assigned tenants, and monthly pricing.'
    },
    {
      key: 'tenants',
      label: 'Tenants',
      value: summary.activeTenants,
      sub: `${summary.totalTenants} total records`,
      icon: UsersRound,
      tone: 'green',
      title: `${propertyName} Tenants`,
      description: 'Active and historical tenant records for this property.'
    },
    {
      key: 'rent-roll',
      label: 'Rent Roll',
      value: currency(summary.monthlyRentRoll),
      sub: 'all unit prices',
      icon: Home,
      tone: 'slate',
      title: `${propertyName} Rent Roll`,
      description: 'The monthly rent price assigned to every unit.'
    },
    {
      key: 'paid',
      label: 'Paid',
      value: currency(summary.collectedThisMonth),
      sub: monthLabel,
      icon: WalletCards,
      tone: 'green',
      title: `${monthLabel} Payments`,
      description: `Receipts recorded for ${propertyName} during ${monthLabel}.`
    },
    {
      key: 'outstanding',
      label: 'Outstanding',
      value: currency(summary.outstandingRent),
      sub: 'all rent due to date',
      icon: WalletCards,
      tone: 'amber',
      title: `${propertyName} Outstanding Rent`,
      description: 'Active tenants with rent balances due through today.'
    },
    {
      key: 'expenses',
      label: 'Expenses',
      value: currency(summary.expensesThisMonth),
      sub: 'selected month',
      icon: ReceiptText,
      tone: 'rose',
      title: `${monthLabel} Expenses`,
      description: `Expenses recorded for ${propertyName} during ${monthLabel}.`
    }
  ]

  const activeDefinition = cards.find((card) => card.key === activeCard) ?? null

  useEffect(() => {
    if (!activeCard) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setActiveCard(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      lastTriggerRef.current?.focus()
    }
  }, [activeCard])

  function openCard(card: CardKey, trigger: HTMLButtonElement) {
    lastTriggerRef.current = trigger
    setActiveCard(card)
  }

  function renderDetails() {
    if (activeCard === 'units' || activeCard === 'rent-roll') {
      return units.length === 0 ? (
        <EmptyState>No units have been added to this property.</EmptyState>
      ) : (
        <div className="overflow-x-auto p-3 sm:p-5">
          <table className="data-table">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Monthly Rent</th>
                <th>Tenant</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit.id}>
                  <td data-label="Unit" className="font-bold text-slate-950">Unit {unit.unitNumber}</td>
                  <td data-label="Monthly Rent" className="font-bold text-slate-800">{currency(unit.rentAmount)}</td>
                  <td data-label="Tenant" className="text-sm text-slate-600">{unit.tenantName ?? 'No active tenant'}</td>
                  <td data-label="Status">
                    <span className={unit.status === 'occupied' ? 'badge badge-green' : 'badge badge-amber'}>
                      {unit.status === 'occupied' ? 'Occupied' : 'Vacant'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (activeCard === 'tenants') {
      return tenants.length === 0 ? (
        <EmptyState>No tenant records exist for this property.</EmptyState>
      ) : (
        <div className="overflow-x-auto p-3 sm:p-5">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Unit</th>
                <th>Contact</th>
                <th>Move In</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td data-label="Tenant">
                    <span className="block font-bold text-slate-950">{tenant.fullName}</span>
                    {tenant.email && <span className="block text-xs text-slate-500">{tenant.email}</span>}
                  </td>
                  <td data-label="Unit" className="font-semibold text-slate-800">Unit {tenant.unitNumber}</td>
                  <td data-label="Contact" className="text-sm text-slate-600">{tenant.phone}</td>
                  <td data-label="Move In" className="text-sm text-slate-600">{tenant.moveInDate}</td>
                  <td data-label="Status">
                    <span className={tenant.active ? 'badge badge-green' : 'badge bg-slate-100 text-slate-600'}>
                      {tenant.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (activeCard === 'paid') {
      return receipts.length === 0 ? (
        <EmptyState>No receipts were recorded for this property in {monthLabel}.</EmptyState>
      ) : (
        <div className="overflow-x-auto p-3 sm:p-5">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Unit</th>
                <th>Date</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt) => (
                <tr key={receipt.id}>
                  <td data-label="Tenant" className="font-bold text-slate-950">{receipt.tenantName}</td>
                  <td data-label="Unit" className="font-semibold text-slate-800">Unit {receipt.unitNumber}</td>
                  <td data-label="Date" className="text-sm text-slate-600">{receipt.paymentDate}</td>
                  <td data-label="Method"><span className="badge bg-slate-100 text-slate-700">{receipt.paymentMethod.toUpperCase()}</span></td>
                  <td data-label="Amount" className="font-black text-emerald-700">{currency(receipt.amountPaid)}</td>
                  <td data-label="Receipt">
                    <a
                      href={`/api/receipts/${receipt.id}`}
                      download
                      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      <Download className="h-3.5 w-3.5" strokeWidth={2} />
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (activeCard === 'outstanding') {
      return outstanding.length === 0 ? (
        <EmptyState>No outstanding rent remains for this property.</EmptyState>
      ) : (
        <div className="overflow-x-auto p-3 sm:p-5">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Unit</th>
                <th>Oldest Due</th>
                <th>Periods</th>
                <th>Balance</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {outstanding.map((row) => (
                <tr key={row.tenantId}>
                  <td data-label="Tenant" className="font-bold text-slate-950">{row.tenantName}</td>
                  <td data-label="Unit" className="font-semibold text-slate-800">Unit {row.unitNumber}</td>
                  <td data-label="Oldest Due" className="text-sm text-slate-600">{row.oldestDueDate}</td>
                  <td data-label="Periods" className="text-sm font-semibold text-slate-700">{row.periods}</td>
                  <td data-label="Balance" className="font-black text-amber-700">{currency(row.balance)}</td>
                  <td data-label="Action">
                    <Link
                      href={`/payments/new?tenantId=${row.tenantId}`}
                      className="inline-flex min-h-9 items-center justify-center rounded-lg border border-emerald-200 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      Record payment
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (activeCard === 'expenses') {
      return expenses.length === 0 ? (
        <EmptyState>No expenses were recorded for this property in {monthLabel}.</EmptyState>
      ) : (
        <div className="overflow-x-auto p-3 sm:p-5">
          <table className="data-table">
            <thead>
              <tr>
                <th>Expense</th>
                <th>Unit</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td data-label="Expense" className="font-bold text-slate-950">{expense.title}</td>
                  <td data-label="Unit" className="text-sm text-slate-600">{expense.unitNumber ? `Unit ${expense.unitNumber}` : 'Entire property'}</td>
                  <td data-label="Category"><span className="badge bg-slate-100 text-slate-700">{expense.category.toUpperCase()}</span></td>
                  <td data-label="Date" className="text-sm text-slate-600">{expense.expenseDate}</td>
                  <td data-label="Amount" className="font-black text-rose-600">{currency(expense.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    return null
  }

  const modal = activeDefinition ? (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-[1px] sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setActiveCard(null)
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[88vh] sm:max-w-6xl sm:rounded-2xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <header className="flex items-start gap-3 border-b border-slate-200 px-4 py-3 sm:items-center sm:px-5 sm:py-4">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="truncate text-base font-black text-slate-950 sm:text-lg">
              {activeDefinition.title}
            </h2>
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 sm:text-sm">
              {activeDefinition.description}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setActiveCard(null)}
            aria-label="Close"
            title="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {renderDetails()}
        </div>
      </section>
    </div>
  ) : null

  return (
    <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.key}
              type="button"
              onClick={(event) => openCard(card.key, event.currentTarget)}
              aria-haspopup="dialog"
              className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              <div className="flex items-center gap-2">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${toneClasses[card.tone]}`}>
                  <Icon className="h-4 w-4" strokeWidth={1.9} />
                </span>
                <p className="min-w-0 flex-1 truncate text-[11px] font-black uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-emerald-600" strokeWidth={2} />
              </div>
              <p className="mt-4 break-words text-[clamp(1.25rem,1.7vw,1.9rem)] font-black leading-none text-slate-950">
                {card.value}
              </p>
              <p className="mt-2 truncate text-xs font-semibold text-slate-500">{card.sub}</p>
            </button>
          )
        })}
      </section>
      {typeof document !== 'undefined' && modal ? createPortal(modal, document.body) : null}
    </>
  )
}
