import DashboardCalendar from '@/components/dashboard/DashboardCalendar'
import DashboardSearch from '@/components/dashboard/DashboardSearch'
import type { DashboardView, RecentPaymentRow, UnitRentRow } from '@/components/dashboard/types'
import PageHeader from '@/components/shell/PageHeader'
import Avatar from '@/components/ui/Avatar'
import { rentStatusLabel } from '@/components/ui/StatusPill'
import { amountDigits, currency } from '@/lib/format'
import {
  ArrowRight,
  Banknote,
  Building2,
  Check,
  ChevronRight,
  Clock3,
  FileDown,
  Grid2x2,
  Info,
  KeyRound,
  Plus,
  ReceiptText,
  TrendingUp,
  UserRoundCheck,
  Wallet,
  DoorOpen,
  type LucideIcon
} from 'lucide-react'
import Link from 'next/link'

/* The two leaf-shaped washes in the top corner of the money cards. */
function CornerWash({ tone }: { tone: 'hi' | 'mint' | 'canvas' }) {
  const [soft, strong] =
    tone === 'hi'
      ? ['rgb(var(--c-hi) / 0.4)', 'rgb(var(--c-hi))']
      : tone === 'mint'
        ? ['rgb(var(--c-mint-soft))', 'rgb(var(--c-mint-strong))']
        : ['rgb(var(--c-canvas))', 'rgb(var(--c-line))']

  return (
    <svg aria-hidden="true" width="132" height="118" viewBox="0 0 132 118" className="pointer-events-none absolute right-0 top-0 transition-transform duration-500 ease-out-soft group-hover:scale-105">
      <path d="M132 0H40C34 20 48 32 64 38C84 45 92 62 98 82C103 99 116 112 132 116Z" fill={soft} />
      <path d="M132 0H78C73 16 83 27 95 34C109 42 113 57 118 72C122 84 127 90 132 92Z" fill={strong} />
    </svg>
  )
}

function Amount({ value, size = 28, muted = 'text-muted' }: { value: number; size?: number; muted?: string }) {
  return (
    <p className="flex items-baseline gap-1.5">
      <span className={`text-[14px] font-bold ${muted}`}>UGX</span>
      <span
        className="font-extrabold tracking-[-0.02em] tabular-nums"
        style={{ fontSize: size, lineHeight: `${size + 6}px` }}
      >
        {value < 0 ? '−' : ''}
        {amountDigits(value)}
      </span>
    </p>
  )
}

function MoneyCard({
  href,
  title,
  value,
  sub,
  icon: Icon,
  iconClass,
  wash
}: {
  href: string
  title: string
  value: number
  sub: string
  icon: LucideIcon
  iconClass: string
  wash: 'hi' | 'mint' | 'canvas'
}) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[196px] flex-col justify-between gap-4 overflow-hidden rounded-card bg-white p-[22px] xl:min-h-0 transition duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-soft"
    >
      <CornerWash tone={wash} />
      <span className={`relative flex h-11 w-11 items-center justify-center ${iconClass}`}>
        <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
      </span>
      <div className="relative flex flex-col gap-1.5">
        <h2 className="text-[15px] font-bold leading-5 text-ink">{title}</h2>
        <Amount value={value} />
        <p className="text-[13px] font-medium leading-[18px] text-muted">{sub}</p>
      </div>
    </Link>
  )
}

function ExpenseCard({ view }: { view: DashboardView }) {
  if (view.expensesThisMonth <= 0) {
    return (
      <Link
        href="/expenses/new"
        className="group relative flex min-h-[196px] flex-col items-center justify-center gap-2 rounded-card border-2 xl:min-h-0 border-dashed border-line-strong p-[22px] text-center transition duration-300 hover:border-ink/25 hover:bg-white/60"
      >
        <span className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-ink px-3 py-[7px] text-[12px] font-semibold leading-4 text-white">
          <Info aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.2} />
          No expenses yet this month
        </span>
        <ReceiptText aria-hidden="true" className="h-[22px] w-[22px] text-ink" strokeWidth={1.8} />
        <h2 className="text-[15px] font-bold leading-5 text-ink">Add an expense</h2>
        <p className="max-w-[190px] text-[12px] font-medium leading-[17px] text-muted">
          Record repairs or bills to see your true net.
        </p>
        <span className="mt-1 flex h-11 w-11 items-center justify-center rounded-full bg-hi text-ink transition-transform duration-300 group-hover:rotate-90">
          <Plus aria-hidden="true" className="h-5 w-5" strokeWidth={2.2} />
        </span>
      </Link>
    )
  }

  const largest = view.largestExpenseCategory
  return (
    <MoneyCard
      href={view.links.expenses}
      title={`Expenses in ${view.monthName}`}
      value={view.expensesThisMonth}
      sub={
        largest
          ? `${largest.category.charAt(0).toUpperCase()}${largest.category.slice(1)} is the largest at ${currency(largest.amount)}`
          : `Recorded in ${view.monthName}`
      }
      icon={ReceiptText}
      iconClass="rounded-xl bg-ink text-white"
      wash="canvas"
    />
  )
}

function NetCard({ view }: { view: DashboardView }) {
  const actions: { href: string; label: string; icon: LucideIcon; lit?: boolean }[] = [
    { href: '/payments/new', label: 'Record payment', icon: Banknote },
    { href: '/expenses/new', label: 'Add expense', icon: ReceiptText },
    { href: view.links.report, label: 'Get report', icon: FileDown, lit: true }
  ]

  return (
    <article className="relative flex min-h-[196px] flex-col justify-between gap-4 overflow-hidden rounded-card bg-night xl:min-h-0 px-6 py-[22px] text-white">
      <svg aria-hidden="true" width="130" height="115" viewBox="0 0 170 150" fill="none" stroke="rgb(var(--c-night-line))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute -right-2.5 top-2.5">
        <path d="M14 74 85 16l71 58" />
        <path d="M32 60v96" />
        <path d="M138 60v96" />
        <circle cx="85" cy="86" r="18" />
        <path d="M85 68v36" />
        <path d="M67 86h36" />
      </svg>
      <div className="relative flex flex-col gap-1.5">
        <h2 className="text-[15px] font-bold leading-5">Net in {view.monthName}</h2>
        <Amount value={view.netThisMonth} size={32} muted="text-night-muted" />
        <span className="text-[13px] font-medium leading-[18px] text-night-muted">Collected minus expenses</span>
      </div>
      <div className="relative flex items-end justify-between">
        {actions.map(({ href, label, icon: Icon, lit }) => (
          <Link
            key={label}
            href={href}
            className="group flex min-w-0 flex-1 flex-col items-center gap-1.5 text-[12px] font-semibold leading-4 text-[#C9D1CB] transition hover:text-white"
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-full transition duration-300 group-hover:-translate-y-0.5 ${
                lit ? 'bg-hi text-ink' : 'bg-night-raised text-white group-hover:bg-[#343c37]'
              }`}
            >
              <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </div>
    </article>
  )
}

function UnitRow({ row, index }: { row: UnitRentRow; index: number }) {
  const ratio = row.rentAmount > 0 ? Math.min(row.amountPaid / row.rentAmount, 1) : 0
  const owes = row.owing > 0

  return (
    <li className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3 text-[13px] leading-[18px]">
        <span className="min-w-0 truncate font-medium">
          <span className="mr-1.5 font-extrabold">{row.unitNumber}</span>
          {row.name}
        </span>
        <span className="shrink-0 font-bold tabular-nums">
          {owes ? (
            <>
              <span className="font-semibold text-forest-ink">owes </span>
              {amountDigits(row.owing)}
            </>
          ) : (
            amountDigits(row.amountPaid)
          )}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-ink/[0.12]">
        {ratio > 0 && (
          <div
            className="bar-grow h-full rounded-full bg-white"
            style={{ width: `${ratio * 100}%`, animationDelay: `${120 + index * 60}ms` }}
          />
        )}
      </div>
      {owes && (
        <div className="flex items-center justify-between gap-2 text-[11.5px] font-semibold leading-4 text-forest-ink">
          <span className="min-w-0 truncate">
            {rentStatusLabel(row.statusKind)}
            {row.statusDetail ? ` · ${row.statusDetail}` : ''}
            {row.carriedForward > 0 ? ` · ${amountDigits(row.carriedForward)} carried` : ''}
          </span>
          <Link
            href={`/payments/new?tenantId=${row.tenantId}`}
            className="shrink-0 rounded-full bg-white/60 px-2.5 py-1 font-bold text-ink transition hover:bg-white"
          >
            Record
          </Link>
        </div>
      )}
    </li>
  )
}

function RentByUnitCard({ view }: { view: DashboardView }) {
  const { statusCounts } = view
  const behind = [
    statusCounts.partPaid ? `${statusCounts.partPaid} part paid` : '',
    statusCounts.overdue ? `${statusCounts.overdue} overdue` : '',
    statusCounts.due ? `${statusCounts.due} due` : ''
  ].filter(Boolean)

  return (
    <article className="flex min-h-[330px] flex-col overflow-hidden rounded-card bg-hi p-6 xl:min-h-0">
      <div className="flex shrink-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-white">
          <TrendingUp aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <h2 className="text-[18px] font-bold leading-[22px] text-ink">
          <span className="block">Rent paid</span>
          <span className="block">by unit</span>
        </h2>
        {statusCounts.total > 0 && (
          <span className="ml-auto whitespace-nowrap rounded-full bg-white/60 px-3 py-1.5 text-[12px] font-bold leading-4">
            {statusCounts.paid} of {statusCounts.total} paid
          </span>
        )}
      </div>
      {behind.length > 0 && (
        <p className="mt-2 shrink-0 text-[12px] font-semibold text-forest-ink">{behind.join(' · ')}</p>
      )}

      {view.unitRows.length > 0 ? (
        <ul className="fade-scroll no-scrollbar my-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto py-2">
          {view.unitRows.map((row, index) => (
            <UnitRow key={row.tenantId} row={row} index={index} />
          ))}
        </ul>
      ) : (
        <div className="my-4 flex flex-1 flex-col items-start justify-center gap-3">
          <p className="text-[14px] font-semibold text-forest-ink">No tenant is billed for {view.monthName}.</p>
          <Link href="/tenants/new" className="btn btn-sm btn-ink">
            <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
            Add tenant
          </Link>
        </div>
      )}

      <Link
        href={view.links.payments}
        className="group flex min-h-11 shrink-0 items-center justify-between text-[14px] font-bold leading-5 text-ink"
      >
        See all payments
        <span className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-ink transition duration-300 group-hover:bg-ink group-hover:text-hi">
          <ArrowRight aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2} />
        </span>
      </Link>
    </article>
  )
}

const paymentStatus: Record<RecentPaymentRow['status'], { label: string; className: string }> = {
  paid: { label: 'Paid in full', className: 'bg-paid-bg text-paid-fg' },
  part_paid: { label: 'Part paid', className: 'bg-carried-bg text-carried-fg' },
  in_advance: { label: 'In advance', className: 'bg-advance-bg text-advance-fg' }
}

function RecentPayments({ view }: { view: DashboardView }) {
  const payers = Array.from(new Map(view.recentPayments.map((row) => [row.tenantId, row])).values()).slice(0, 4)

  return (
    <article className="flex min-h-[300px] min-w-0 flex-col gap-2 overflow-hidden rounded-card bg-white px-6 py-5 xl:col-span-2 xl:min-h-0">
      <div className="flex h-10 shrink-0 items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Wallet aria-hidden="true" className="h-5 w-5 text-ink" strokeWidth={1.9} />
          <h2 className="text-[18px] font-bold leading-6 text-ink">Recent payments</h2>
        </div>
        <div className="flex items-center gap-3.5">
          {payers.length > 0 && (
            <div className="flex items-center">
              <span className="sr-only">{payers.length} tenants</span>
              {payers.map((row, index) => (
                <Avatar
                  key={row.tenantId}
                  initials={row.initials}
                  tone={row.tone}
                  size={32}
                  shape="circle"
                  className={`shadow-[0_0_0_2px_#fff] ${index > 0 ? '-ml-2' : ''}`}
                />
              ))}
            </div>
          )}
          <Link
            href={view.links.payments}
            className="flex min-h-11 items-center gap-1 text-[14px] font-bold text-brand-text transition hover:text-ink"
          >
            All payments
            <ChevronRight aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
          </Link>
        </div>
      </div>

      {view.recentPayments.length > 0 ? (
        <div className="fade-scroll no-scrollbar min-h-0 flex-1 overflow-y-auto">
        <table className="w-full border-collapse text-[14px] leading-5">
          <thead>
            <tr className="text-[12px] font-semibold leading-4 text-muted">
              <th scope="col" className="w-[34%] border-b border-line py-2 text-left font-semibold">Tenant</th>
              <th scope="col" className="w-[18%] border-b border-line py-2 text-left font-semibold">Unit</th>
              <th scope="col" className="w-[18%] border-b border-line py-2 text-left font-semibold">Paid on</th>
              <th scope="col" className="w-[16%] border-b border-line py-2 text-right font-semibold">Amount</th>
              <th scope="col" className="w-[14%] border-b border-line py-2 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {view.recentPayments.map((row) => {
              const status = paymentStatus[row.status]
              return (
                <tr key={row.id} className="border-b border-canvas last:border-b-0">
                  <td className="py-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar initials={row.initials} tone={row.tone} size={36} />
                      <span className="truncate font-bold">{row.name}</span>
                    </div>
                  </td>
                  <td className="py-2">
                    <div className="flex flex-col">
                      <span className="font-bold">{row.unitNumber}</span>
                      <span className="truncate text-[12px] leading-4 text-muted">{row.propertyName}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-2 font-medium">{row.paidOn}</td>
                  <td className="whitespace-nowrap py-2 text-right">
                    <span className="mr-1 text-[12px] font-semibold text-muted">UGX</span>
                    <span className="font-bold tabular-nums">{amountDigits(row.amount)}</span>
                  </td>
                  <td className="py-2 text-right">
                    <span
                      className={`pill ${status.className}`}
                      title={row.status === 'part_paid' ? `${currency(row.balanceAfter)} still owed after this payment` : undefined}
                    >
                      {row.status === 'paid' && <Check aria-hidden="true" className="h-3 w-3" strokeWidth={3} />}
                      {status.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-canvas text-brand-text">
            <Wallet aria-hidden="true" className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <p className="text-[14px] font-semibold text-muted">No payments received in {view.monthName} yet.</p>
          <Link href="/payments/new" className="btn btn-sm btn-ink">
            <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
            Record payment
          </Link>
        </div>
      )}
    </article>
  )
}

/* One segment per unit - filled when someone lives there - so the share is
   read at a glance. A big portfolio gets one proportional bar instead. */
function UnitStrip({ occupied, total }: { occupied: number; total: number }) {
  const label = `${occupied} of ${total} units occupied`
  if (total > 24) {
    return (
      <div role="img" aria-label={label} className="h-2.5 overflow-hidden rounded-full bg-white/80">
        <div className="bar-grow h-full rounded-full bg-forest" style={{ width: `${Math.round((occupied / total) * 100)}%` }} />
      </div>
    )
  }
  return (
    <div role="img" aria-label={label} className="flex gap-1">
      {Array.from({ length: total }, (_, index) => (
        <span key={index} className={`h-2.5 min-w-0 flex-1 rounded-full ${index < occupied ? 'bg-forest' : 'bg-white/80'}`} />
      ))}
    </div>
  )
}

function OccupancyCard({ view }: { view: DashboardView }) {
  const { occupancy } = view
  const tiles: { label: string; value: number; href: string; icon: LucideIcon }[] = [
    { label: 'Properties', value: occupancy.properties, href: '/properties', icon: Building2 },
    { label: 'Units', value: occupancy.totalUnits, href: '/units', icon: Grid2x2 },
    { label: 'Occupied', value: occupancy.occupied, href: '/units?status=occupied', icon: UserRoundCheck },
    { label: 'Vacant', value: occupancy.vacant, href: '/units?status=vacant', icon: DoorOpen }
  ]

  return (
    <article className="flex min-h-[300px] flex-col justify-between gap-4 overflow-hidden rounded-card bg-mint px-6 py-5 xl:min-h-0">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-white">
          <KeyRound aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <h2 className="min-w-0 text-[18px] font-bold leading-[22px] text-ink">
          <span className="block">Occupancy</span>
          <span className="block truncate text-[13px] font-semibold leading-[18px] text-forest-ink">{occupancy.scopeLabel}</span>
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[44px] font-extrabold leading-[48px] tracking-[-0.03em] text-ink tabular-nums">
            {occupancy.percent}%
          </span>
          <span className="text-[13px] font-semibold leading-[18px] text-forest-ink">
            {occupancy.occupied} of {occupancy.totalUnits} units occupied
            {occupancy.activeTenants > 0 ? ` · ${occupancy.activeTenants} tenant${occupancy.activeTenants === 1 ? '' : 's'}` : ''}
          </span>
        </div>
        {occupancy.totalUnits > 0 && <UnitStrip occupied={occupancy.occupied} total={occupancy.totalUnits} />}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {tiles.map(({ label, value, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex items-start justify-between gap-2 rounded-2xl bg-white/65 px-3.5 py-2.5 transition hover:bg-white"
          >
            <span className="flex flex-col gap-0.5">
              <span className="text-[12px] font-semibold leading-4 text-forest-ink">{label}</span>
              <span
                className={`text-[22px] font-extrabold leading-[26px] tabular-nums ${
                  label === 'Vacant' && value > 0 ? 'text-carried-fg' : 'text-ink'
                }`}
              >
                {value}
              </span>
            </span>
            <Icon aria-hidden="true" className="h-[18px] w-[18px] text-forest" strokeWidth={1.9} />
          </Link>
        ))}
      </div>
    </article>
  )
}

function PropertyBar({ view }: { view: DashboardView }) {
  const pill = (active: boolean) =>
    `flex h-11 shrink-0 items-center whitespace-nowrap rounded-full px-5 text-[14px] font-bold transition-colors duration-300 ${
      active ? 'bg-white text-ink' : 'text-[#C9D1CB] hover:text-white'
    }`

  return (
    <nav
      aria-label="Choose property"
      className="sticky bottom-[22px] z-20 col-start-1 row-[1/-1] flex max-w-full items-center gap-1 justify-self-center self-end rounded-full bg-night py-[5px] pl-5 pr-[5px] shadow-float"
    >
      <span className="mr-2 shrink-0 text-[13px] font-semibold leading-[18px] text-night-muted">Property</span>
      <div className="no-scrollbar flex min-w-0 max-w-[720px] items-center gap-1 overflow-x-auto">
        <Link
          href={`/dashboard?month=${view.month}`}
          scroll={false}
          aria-current={view.selectedPropertyId === null ? 'page' : undefined}
          className={pill(view.selectedPropertyId === null)}
        >
          All
        </Link>
        {view.properties.map((property) => (
          <Link
            key={property.id}
            href={`/dashboard?month=${view.month}&property=${property.id}`}
            scroll={false}
            aria-current={view.selectedPropertyId === property.id ? 'page' : undefined}
            className={pill(view.selectedPropertyId === property.id)}
          >
            {property.name}
          </Link>
        ))}
      </div>
      <Link
        href="/properties/new"
        aria-label="Add property"
        title="Add property"
        className="ml-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-night-raised text-white transition hover:bg-[#343c37]"
      >
        <Plus aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
      </Link>
    </nav>
  )
}

export default function DesktopDashboard({ view }: { view: DashboardView }) {
  const collectedSub =
    view.totalExpected > 0
      ? `${view.collectedPercent}% of ${currency(view.totalExpected)} expected`
      : `Nothing billed for ${view.monthName}`
  const outstandingSub =
    view.totalOutstanding <= 0
      ? 'No tenant owes rent'
      : view.carriedForwardTotal > 0
        ? `${currency(view.carriedForwardTotal)} carried from earlier months`
        : `${view.owingRows.length} tenant${view.owingRows.length === 1 ? ' owes' : 's owe'}, all of it ${view.monthName} rent`

  return (
    <div className="stagger relative hidden grid-cols-1 gap-[22px] pb-[22px] lg:grid lg:min-h-full lg:grid-rows-[auto_auto_auto_auto_76px] xl:h-full xl:grid-rows-[auto_minmax(196px,212fr)_minmax(330px,356fr)_minmax(300px,336fr)_76px]">
      <PageHeader
        className="col-start-1 row-start-1"
        title={`Hi ${view.greetingName}`}
        subtitle={view.headline}
        actions={
          <>
            <div className="flex items-center gap-0.5 rounded-full bg-white p-1">
              <Link href="/payments/new" className="btn btn-ink pl-4 pr-[18px]">
                <Plus aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
                Add payment
              </Link>
              <Link href="/tenants/new" className="btn px-4 font-semibold text-muted hover:bg-canvas hover:text-ink">
                <Plus aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2} />
                Add tenant
              </Link>
            </div>
            <DashboardSearch />
          </>
        }
        tools={{ date: true, weekday: true, user: false }}
      />

      <section aria-label={`${view.monthName} at a glance`} className="col-start-1 row-start-2 grid min-h-0 grid-cols-2 gap-5 xl:grid-cols-3">
        <div className="contents xl:col-span-2 xl:grid xl:grid-cols-3 xl:gap-5">
          <MoneyCard
            href={view.links.payments}
            title={`Collected in ${view.monthName}`}
            value={view.collectedThisMonth}
            sub={collectedSub}
            icon={Banknote}
            iconClass="rounded-full bg-hi text-ink"
            wash="hi"
          />
          <MoneyCard
            href={view.links.outstanding}
            title="Outstanding rent"
            value={view.totalOutstanding}
            sub={outstandingSub}
            icon={Clock3}
            iconClass="rounded-xl bg-ink text-white"
            wash="mint"
          />
          <ExpenseCard view={view} />
        </div>
        <NetCard view={view} />
      </section>

      <section aria-label="Rent this month" className="col-start-1 row-start-3 grid min-h-0 gap-5 xl:grid-cols-3">
        <DashboardCalendar key={view.month} calendar={view.calendar} />
        <RentByUnitCard view={view} />
      </section>

      <section aria-label="Payments and units" className="col-start-1 row-start-4 grid min-h-0 gap-5 xl:grid-cols-3">
        <RecentPayments view={view} />
        <OccupancyCard view={view} />
      </section>

      <PropertyBar view={view} />
    </div>
  )
}
