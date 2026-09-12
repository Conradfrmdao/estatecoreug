import CarryForwardNote from '@/components/CarryForwardNote'
import { currency, currentPaymentMonth, formatDate, monthShortLabel } from '@/lib/format'
import type { OutstandingMonthSummary } from '@/lib/rent-display'
import Link from 'next/link'

export type TenantRentDemand = {
  tenantId: number
  tenantName: string
  unitNumber: string
  rentAmount: number
  nextPaymentDate: string
  totalOutstandingBalance: number
  carriedForwardBalance: number
  carriedForwardMonths: OutstandingMonthSummary[]
  currentMonthBalance: number
}

export default function TenantRentDemandList({ rows }: { rows: TenantRentDemand[] }) {
  if (rows.length === 0) {
    return null
  }

  const thisMonth = monthShortLabel(currentPaymentMonth())
  const totalDemanded = rows.reduce((running, row) => running + row.totalOutstandingBalance, 0)
  const totalCarriedForward = rows.reduce((running, row) => running + row.carriedForwardBalance, 0)

  return (
    <section className="border-b border-slate-100 bg-slate-50/70 p-3 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-black text-slate-950">Amount demanded from tenants</h3>
        <p className="text-xs font-semibold text-slate-500">
          {currency(totalDemanded)} total
          {totalCarriedForward > 0 && ` - ${currency(totalCarriedForward)} carried forward`}
        </p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <article
            key={row.tenantId}
            className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950">{row.tenantName}</p>
                <p className="truncate text-xs text-slate-500">
                  Unit {row.unitNumber} - {currency(row.rentAmount)}/mo
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.08em] text-amber-600">
                  Total demanded
                </p>
                <p className="text-sm font-black text-amber-700">
                  {currency(row.totalOutstandingBalance)}
                </p>
              </div>
            </div>

            {row.carriedForwardBalance > 0 ? (
              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/70 px-2.5 py-2">
                <CarryForwardNote
                  carriedForwardBalance={row.carriedForwardBalance}
                  carriedForwardMonths={row.carriedForwardMonths}
                  className="mt-0 block"
                />
                <p className="mt-1 text-[11px] font-semibold text-slate-600">
                  {currency(row.currentMonthBalance)} is this month ({thisMonth}).
                </p>
              </div>
            ) : (
              <p className="mt-2 text-[11px] font-semibold text-slate-500">
                All of this is for {thisMonth} onwards - nothing carried forward.
              </p>
            )}

            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-500">
                Next scheduled {formatDate(row.nextPaymentDate)}
              </span>
              <Link
                href={`/payments/new?tenantId=${row.tenantId}`}
                className="rounded-lg border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-50"
              >
                Record payment
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
