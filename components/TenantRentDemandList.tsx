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
    <section className="bg-carried-bg/50 px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[15px] font-extrabold text-ink">Amount demanded from tenants</h3>
        <p className="text-[12.5px] font-semibold text-carried-fg">
          {currency(totalDemanded)} total
          {totalCarriedForward > 0 && ` - ${currency(totalCarriedForward)} carried forward`}
        </p>
      </div>

      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {rows.map((row) => (
          <article key={row.tenantId} className="rounded-[20px] bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[14.5px] font-extrabold text-ink">{row.tenantName}</p>
                <p className="truncate text-[12.5px] font-medium text-muted">
                  Unit {row.unitNumber} - {currency(row.rentAmount)}/mo
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-carried-fg">Total demanded</p>
                <p className="text-[15px] font-extrabold tabular-nums text-ink">{currency(row.totalOutstandingBalance)}</p>
              </div>
            </div>

            {row.carriedForwardBalance > 0 ? (
              <div className="mt-2.5 rounded-2xl bg-carried-bg/60 px-3 py-2">
                <CarryForwardNote
                  carriedForwardBalance={row.carriedForwardBalance}
                  carriedForwardMonths={row.carriedForwardMonths}
                  className="mt-0 block"
                />
                <p className="mt-1 text-[11.5px] font-semibold text-ink-soft">
                  {currency(row.currentMonthBalance)} is this month ({thisMonth}).
                </p>
              </div>
            ) : (
              <p className="mt-2.5 text-[11.5px] font-semibold text-muted">
                All of this is for {thisMonth} onwards - nothing carried forward.
              </p>
            )}

            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-[11.5px] font-semibold text-muted">
                Next scheduled {formatDate(row.nextPaymentDate)}
              </span>
              <Link href={`/payments/new?tenantId=${row.tenantId}`} className="btn btn-xs btn-ink">
                Record payment
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
