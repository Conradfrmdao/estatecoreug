'use client'

import CarryForwardNote from '@/components/CarryForwardNote'
import Dialog from '@/components/ui/Dialog'
import PdfDownload from '@/components/ui/PdfDownload'
import { currency } from '@/lib/format'
import {
  ArrowUpRight,
  Building2,
  Clock3,
  Download,
  House,
  ReceiptText,
  UsersRound,
  Wallet,
  X,
  type LucideIcon
} from 'lucide-react'
import Link from 'next/link'
import { useId, useRef, useState, type ReactNode } from 'react'

type CardKey = 'units' | 'tenants' | 'rent-roll' | 'paid' | 'outstanding' | 'expenses'
type CardTone = 'hi' | 'mint' | 'night' | 'plain' | 'warn' | 'danger'

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
  carriedForwardBalance: number
  carriedForwardMonths: { month: string; balance: number }[]
  currentMonthBalance: number
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

const iconTone: Record<CardTone, string> = {
  hi: 'bg-hi text-ink',
  mint: 'bg-mint text-forest',
  night: 'bg-ink text-white',
  plain: 'bg-canvas text-ink',
  warn: 'bg-carried-bg text-carried-fg',
  danger: 'bg-danger-soft text-danger'
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="px-4 py-12 text-center text-[14px] font-semibold text-muted">{children}</p>
}

function TableFrame({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto px-4 py-4 sm:px-6 sm:py-5">{children}</div>
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
  const [shownCard, setShownCard] = useState<CardKey | null>(null)
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  const cards: CardDefinition[] = [
    {
      key: 'units',
      label: 'Units',
      value: summary.totalUnits,
      sub: `${summary.occupiedUnits} occupied`,
      icon: Building2,
      tone: 'plain',
      title: `${propertyName} Units`,
      description: 'Occupancy, assigned tenants, and monthly pricing.'
    },
    {
      key: 'tenants',
      label: 'Tenants',
      value: summary.activeTenants,
      sub: `${summary.totalTenants} total records`,
      icon: UsersRound,
      tone: 'mint',
      title: `${propertyName} Tenants`,
      description: 'Active and historical tenant records for this property.'
    },
    {
      key: 'rent-roll',
      label: 'Rent Roll',
      value: currency(summary.monthlyRentRoll),
      sub: 'all unit prices',
      icon: House,
      tone: 'plain',
      title: `${propertyName} Rent Roll`,
      description: 'The monthly rent price assigned to every unit.'
    },
    {
      key: 'paid',
      label: 'Paid',
      value: currency(summary.collectedThisMonth),
      sub: monthLabel,
      icon: Wallet,
      tone: 'hi',
      title: `${monthLabel} Payments`,
      description: `Receipts recorded for ${propertyName} during ${monthLabel}.`
    },
    {
      key: 'outstanding',
      label: 'Outstanding',
      value: currency(summary.outstandingRent),
      sub: 'all rent due to date',
      icon: Clock3,
      tone: summary.outstandingRent > 0 ? 'warn' : 'night',
      title: `${propertyName} Outstanding Rent`,
      description: 'Active tenants with rent balances due through today.'
    },
    {
      key: 'expenses',
      label: 'Expenses',
      value: currency(summary.expensesThisMonth),
      sub: 'selected month',
      icon: ReceiptText,
      tone: 'danger',
      title: `${monthLabel} Expenses`,
      description: `Expenses recorded for ${propertyName} during ${monthLabel}.`
    }
  ]

  /* The dialog keeps showing the card it opened with while it animates shut. */
  const shownDefinition = cards.find((card) => card.key === shownCard) ?? null

  function openCard(card: CardKey) {
    setShownCard(card)
    setActiveCard(card)
  }

  function renderDetails() {
    if (shownCard === 'units' || shownCard === 'rent-roll') {
      return units.length === 0 ? (
        <EmptyState>No units have been added to this property.</EmptyState>
      ) : (
        <TableFrame>
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
                  <td data-label="Unit" className="font-extrabold text-ink">Unit {unit.unitNumber}</td>
                  <td data-label="Monthly Rent" className="font-bold tabular-nums text-ink">{currency(unit.rentAmount)}</td>
                  <td data-label="Tenant" className="font-medium text-ink-soft">{unit.tenantName ?? 'No active tenant'}</td>
                  <td data-label="Status">
                    <span className={unit.status === 'occupied' ? 'badge badge-green' : 'badge badge-amber'}>
                      {unit.status === 'occupied' ? 'Occupied' : 'Vacant'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableFrame>
      )
    }

    if (shownCard === 'tenants') {
      return tenants.length === 0 ? (
        <EmptyState>No tenant records exist for this property.</EmptyState>
      ) : (
        <TableFrame>
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
                    <span className="block font-bold text-ink">{tenant.fullName}</span>
                    {tenant.email && <span className="block text-[12.5px] font-medium text-muted">{tenant.email}</span>}
                  </td>
                  <td data-label="Unit" className="font-bold text-ink">Unit {tenant.unitNumber}</td>
                  <td data-label="Contact" className="font-medium text-ink-soft">{tenant.phone}</td>
                  <td data-label="Move In" className="font-medium text-ink-soft">{tenant.moveInDate}</td>
                  <td data-label="Status">
                    <span className={tenant.active ? 'badge badge-green' : 'badge badge-slate'}>
                      {tenant.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableFrame>
      )
    }

    if (shownCard === 'paid') {
      return receipts.length === 0 ? (
        <EmptyState>No receipts were recorded for this property in {monthLabel}.</EmptyState>
      ) : (
        <TableFrame>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Unit</th>
                <th>Date</th>
                <th>Method</th>
                <th>Amount</th>
                <th className="text-right">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt) => (
                <tr key={receipt.id}>
                  <td data-label="Tenant" className="font-bold text-ink">{receipt.tenantName}</td>
                  <td data-label="Unit" className="font-bold text-ink">Unit {receipt.unitNumber}</td>
                  <td data-label="Date" className="font-medium text-ink-soft">{receipt.paymentDate}</td>
                  <td data-label="Method"><span className="badge badge-slate">{receipt.paymentMethod.replace(/_/g, ' ')}</span></td>
                  <td data-label="Amount" className="font-extrabold tabular-nums text-brand-text">{currency(receipt.amountPaid)}</td>
                  <td data-label="Receipt">
                    <div className="flex justify-end">
                      <PdfDownload href={`/api/receipts/${receipt.id}`} className="btn btn-xs btn-mint">
                        <Download aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
                        Download
                      </PdfDownload>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableFrame>
      )
    }

    if (shownCard === 'outstanding') {
      return outstanding.length === 0 ? (
        <EmptyState>No outstanding rent remains for this property.</EmptyState>
      ) : (
        <TableFrame>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Unit</th>
                <th>Oldest Due</th>
                <th>Periods</th>
                <th>Balance</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {outstanding.map((row) => (
                <tr key={row.tenantId}>
                  <td data-label="Tenant" className="font-bold text-ink">{row.tenantName}</td>
                  <td data-label="Unit" className="font-bold text-ink">Unit {row.unitNumber}</td>
                  <td data-label="Oldest Due" className="font-medium text-ink-soft">{row.oldestDueDate}</td>
                  <td data-label="Periods" className="font-bold text-ink">{row.periods}</td>
                  <td data-label="Balance">
                    <span className="block font-extrabold tabular-nums text-carried-fg">{currency(row.balance)}</span>
                    <CarryForwardNote
                      carriedForwardBalance={row.carriedForwardBalance}
                      carriedForwardMonths={row.carriedForwardMonths}
                      className="block"
                    />
                  </td>
                  <td data-label="Action">
                    <div className="flex justify-end">
                      <Link href={`/payments/new?tenantId=${row.tenantId}`} className="btn btn-xs btn-ink">
                        Record payment
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableFrame>
      )
    }

    if (shownCard === 'expenses') {
      return expenses.length === 0 ? (
        <EmptyState>No expenses were recorded for this property in {monthLabel}.</EmptyState>
      ) : (
        <TableFrame>
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
                  <td data-label="Expense" className="font-bold text-ink">{expense.title}</td>
                  <td data-label="Unit" className="font-medium text-ink-soft">{expense.unitNumber ? `Unit ${expense.unitNumber}` : 'Entire property'}</td>
                  <td data-label="Category"><span className="badge badge-slate">{expense.category}</span></td>
                  <td data-label="Date" className="font-medium text-ink-soft">{expense.expenseDate}</td>
                  <td data-label="Amount" className="font-extrabold tabular-nums text-danger">{currency(expense.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableFrame>
      )
    }

    return null
  }

  return (
    <>
      <section className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => openCard(card.key)}
              aria-haspopup="dialog"
              className="group flex min-w-0 flex-col rounded-[24px] bg-white p-5 text-left transition duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-soft"
            >
              <div className="flex items-center gap-2.5">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconTone[card.tone]}`}>
                  <Icon aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </span>
                <p className="min-w-0 flex-1 truncate text-[11.5px] font-bold uppercase tracking-[0.08em] text-muted">
                  {card.label}
                </p>
                <ArrowUpRight
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-faint transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                  strokeWidth={2}
                />
              </div>
              <p className="mt-4 break-words text-[clamp(1.25rem,1.6vw,1.75rem)] font-extrabold leading-none tracking-[-0.02em] tabular-nums text-ink">
                {card.value}
              </p>
              <p className="mt-2 truncate text-[12.5px] font-semibold text-muted">{card.sub}</p>
            </button>
          )
        })}
      </section>

      <Dialog
        open={activeCard !== null}
        onClose={() => setActiveCard(null)}
        labelledBy={titleId}
        variant="sheet-dialog"
        zIndex={90}
        initialFocusRef={closeRef}
        className="flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-overlay sm:max-h-[88vh] sm:max-w-6xl sm:rounded-[28px]"
      >
        {shownDefinition && (
          <>
            <header className="flex items-start gap-3 border-b border-line px-5 pb-4 pt-5 sm:items-center sm:px-6">
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="truncate text-[18px] font-extrabold text-ink sm:text-[20px]">
                  {shownDefinition.title}
                </h2>
                <p className="mt-0.5 line-clamp-2 text-[13px] font-medium text-muted">{shownDefinition.description}</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setActiveCard(null)}
                aria-label="Close"
                title="Close"
                className="btn btn-soft btn-icon btn-sm shrink-0"
              >
                <X aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
              </button>
            </header>
            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {renderDetails()}
            </div>
          </>
        )}
      </Dialog>
    </>
  )
}
