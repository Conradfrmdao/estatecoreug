import Link from 'next/link'
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  DoorOpen,
  Filter,
  KeyRound,
  Plus,
  ReceiptText,
  UsersRound,
  WalletCards
} from 'lucide-react'

import { requireCurrentAppUser } from '@/lib/auth'
import { getDashboardData } from '@/lib/data'
import { currency, currentPaymentMonth, dateKey, formatDate, monthLabel } from '@/lib/format'

export const dynamic = 'force-dynamic'

const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const toneStyles = {
  green: {
    icon: 'bg-emerald-100 text-emerald-700',
    value: 'text-emerald-700',
    trend: 'text-emerald-700',
    spark: '#008a45'
  },
  amber: {
    icon: 'bg-orange-100 text-orange-600',
    value: 'text-orange-600',
    trend: 'text-orange-600',
    spark: '#f97316'
  },
  blue: {
    icon: 'bg-blue-100 text-blue-700',
    value: 'text-slate-950',
    trend: 'text-emerald-700',
    spark: '#2563eb'
  },
  dark: {
    icon: 'bg-emerald-950 text-white',
    value: 'text-slate-950',
    trend: 'text-emerald-700',
    spark: '#047857'
  }
}

function sameMonth(value: Date, month: string) {
  return dateKey(value).slice(0, 7) === month
}

function dayOfMonth(value: Date) {
  return Number(dateKey(value).slice(8, 10))
}

function monthDays(month: string) {
  const [year, monthNumber] = month.split('-').map(Number)
  const firstDay = new Date(Date.UTC(year, monthNumber - 1, 1))
  const totalDays = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
  const offset = (firstDay.getUTCDay() + 6) % 7

  return [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: totalDays }, (_, index) => index + 1)
  ]
}

function Sparkline({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 84 28" className="h-6 w-16" aria-hidden="true">
      <polyline
        points="2,22 14,18 25,20 36,13 48,15 59,8 72,11 82,3"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

function KpiCard({
  title,
  value,
  sub,
  tone,
  icon: Icon,
  direction = 'up'
}: {
  title: string
  value: string
  sub: string
  tone: keyof typeof toneStyles
  icon: typeof WalletCards
  direction?: 'up' | 'down'
}) {
  const style = toneStyles[tone]
  const DirectionIcon = direction === 'up' ? ArrowUpRight : ArrowDownRight

  return (
    <div className="flex h-[88px] items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.icon}`}>
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold text-slate-600">{title}</p>
          <p className={`mt-0.5 truncate text-lg font-black leading-none ${style.value}`}>{value}</p>
          <p className={`mt-1 inline-flex max-w-full items-center gap-1 truncate text-[11px] font-semibold ${style.trend}`}>
            <DirectionIcon className="h-3 w-3 shrink-0" strokeWidth={2} />
            <span className="truncate">{sub}</span>
          </p>
        </div>
      </div>
      <div className="hidden shrink-0 sm:block">
        <Sparkline color={style.spark} />
      </div>
    </div>
  )
}

function PortfolioMetric({
  label,
  value,
  sub,
  icon: Icon
}: {
  label: string
  value: number
  sub: string
  icon: typeof Building2
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 px-2 py-1.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-600">{label}</p>
        <p className="text-lg font-black leading-tight text-slate-950">{value}</p>
        <p className="truncate text-[11px] text-slate-500">{sub}</p>
      </div>
    </div>
  )
}

function statusBadge(status: string, daysUntilDue: number) {
  if (status === 'due_today') return 'Due today'
  if (status === 'overdue') return `${Math.abs(daysUntilDue)} days late`
  if (status === 'upcoming') return `${daysUntilDue} days left`
  if (status === 'partial') return 'Partial'
  return 'Unpaid'
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Promise<{ month?: string }>
}) {
  const user = await requireCurrentAppUser()
  const params = await searchParams
  const month = params?.month || currentPaymentMonth()
  const data = await getDashboardData(user.id, month)

  const activeCount = Math.max(data.summary.activeTenants, data.tenantBalances.length)
  const paidCount = data.tenantBalances.filter((row) => row.paymentStatus === 'paid').length
  const partialCount = data.tenantBalances.filter((row) => row.paymentStatus === 'partial').length
  const unpaidCount = Math.max(activeCount - paidCount - partialCount, 0)
  const paidDeg = activeCount ? (paidCount / activeCount) * 360 : 0
  const partialDeg = activeCount ? (partialCount / activeCount) * 360 : 0
  const selectedMonthDays = monthDays(month)
  const today = new Date()
  const todayKey = dateKey(today)
  const todayDay = todayKey.slice(0, 7) === month ? Number(todayKey.slice(8, 10)) : null
  const eventDays = new Map<number, 'green' | 'amber' | 'red'>()

  for (const row of data.tenantBalances) {
    if (sameMonth(row.dueDate, month)) {
      eventDays.set(
        dayOfMonth(row.dueDate),
        row.paymentStatus === 'overdue' ? 'red' : row.paymentStatus === 'paid' ? 'green' : 'amber'
      )
    }
  }
  for (const { payment } of data.payments) {
    if (sameMonth(payment.paymentDate, month)) eventDays.set(dayOfMonth(payment.paymentDate), 'green')
  }
  for (const { expense } of data.expenses) {
    if (sameMonth(expense.expenseDate, month)) eventDays.set(dayOfMonth(expense.expenseDate), 'amber')
  }

  const upcomingPayments = data.tenantBalances
    .filter((row) => row.paymentStatus !== 'paid')
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 3)

  const recentActivity = [
    ...data.recentPayments.map(({ payment, tenant, property }) => ({
      id: `payment-${payment.id}`,
      type: 'payment' as const,
      title: `Payment received from ${tenant.fullName}`,
      detail: property.name,
      amount: payment.amountPaid,
      date: payment.paymentDate
    })),
    ...data.recentExpenses.map(({ expense, property }) => ({
      id: `expense-${expense.id}`,
      type: 'expense' as const,
      title: `Expense - ${expense.title}`,
      detail: property.name,
      amount: expense.amount,
      date: expense.expenseDate
    }))
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 4)

  const todayEvents = recentActivity
    .filter((item) => item.date.toISOString().slice(0, 10) === today.toISOString().slice(0, 10))
    .slice(0, 2)

  return (
    <div className="space-y-3 pb-4 animate-in">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-950">Dashboard</h1>
          <p className="mt-0.5 text-xs text-slate-600">
            Welcome back, {user.name.split(' ')[0] || 'Landlord'}. Here is what is happening with your properties.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/payments/new"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: '#00A550' }}
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Record Payment
          </Link>
          <form className="flex items-center gap-2" method="get">
            <input
              name="month"
              type="month"
              defaultValue={month}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            />
            <button className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
              <Filter className="h-4 w-4" strokeWidth={1.9} />
              Filter
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Collected This Month"
          value={currency(data.summary.collectedThisMonth)}
          sub={`${data.summary.totalExpected ? Math.round((data.summary.collectedThisMonth / data.summary.totalExpected) * 100) : 0}% of expected`}
          tone="green"
          icon={WalletCards}
        />
        <KpiCard
          title="Outstanding Rent"
          value={currency(data.summary.totalOutstanding)}
          sub={`${data.summary.unpaidTenants} tenants unpaid`}
          tone="amber"
          icon={CircleAlert}
          direction="down"
        />
        <KpiCard
          title="Monthly Expenses"
          value={currency(data.summary.expensesThisMonth)}
          sub={`${data.recentExpenses.length} recent expenses`}
          tone="blue"
          icon={ReceiptText}
          direction="down"
        />
        <KpiCard
          title="Monthly Net Profit"
          value={currency(data.summary.netThisMonth)}
          sub={`${monthLabel(month)} result`}
          tone="dark"
          icon={BarChart3}
        />
      </section>

      <section className="grid rounded-xl border border-slate-200 bg-white p-2 shadow-sm md:grid-cols-5 md:divide-x md:divide-slate-200">
        <PortfolioMetric label="Properties" value={data.summary.totalProperties} sub="Total properties" icon={Building2} />
        <PortfolioMetric label="Units" value={data.summary.totalUnits} sub="Total units" icon={DoorOpen} />
        <PortfolioMetric label="Occupied" value={data.summary.occupiedUnits} sub="Units occupied" icon={UsersRound} />
        <PortfolioMetric label="Vacant" value={data.summary.vacantUnits} sub="Units vacant" icon={KeyRound} />
        <PortfolioMetric label="Tenants" value={data.summary.activeTenants} sub="Active tenants" icon={UsersRound} />
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.05fr_1.15fr_1.25fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-950">Payment Status</h2>
            <Link href="/tenants" className="text-xs font-bold text-emerald-700">View all</Link>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div
              className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
              style={{
                background: activeCount
                  ? `conic-gradient(#007a3d 0deg ${paidDeg}deg, #f59e0b ${paidDeg}deg ${paidDeg + partialDeg}deg, #ef4444 ${paidDeg + partialDeg}deg 360deg)`
                  : '#e5e7eb'
              }}
            >
              <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-base font-black leading-none text-slate-950">{activeCount}</span>
                <span className="text-[10px] text-slate-500">tenants</span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-slate-600"><span className="h-2 w-2 rounded-full bg-emerald-700" />Paid</span>
                <span className="font-bold text-slate-950">{paidCount}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-slate-600"><span className="h-2 w-2 rounded-full bg-amber-500" />Partial</span>
                <span className="font-bold text-slate-950">{partialCount}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-slate-600"><span className="h-2 w-2 rounded-full bg-red-500" />Unpaid</span>
                <span className="font-bold text-slate-950">{unpaidCount}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-2">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-950">Upcoming Payments</h3>
              <Link href={`/tenants?month=${month}&status=unpaid`} className="text-xs font-bold text-emerald-700">View all</Link>
            </div>
            <div className="space-y-2">
              {upcomingPayments.map((row) => (
                <div key={row.tenant.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-800">{row.tenant.fullName}</p>
                    <p className="truncate text-xs text-slate-500">{row.property.name} - Unit {row.unit.unitNumber}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-bold text-slate-950">{currency(row.balance)}</p>
                    <span className="rounded-md bg-orange-50 px-2 py-1 text-[11px] font-bold text-orange-600">
                      {statusBadge(row.paymentStatus, row.daysUntilDue)}
                    </span>
                  </div>
                </div>
              ))}
              {upcomingPayments.length === 0 && (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">No unpaid tenants for this period.</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-950">Live Calendar</h2>
            <Link href="/calendar" className="text-xs font-bold text-emerald-700">View calendar</Link>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-black text-slate-950">
            <CalendarDays className="h-4 w-4 text-slate-500" strokeWidth={1.9} />
            {monthLabel(month)}
          </div>
          <p className="mt-1 text-center text-[11px] font-semibold text-slate-500">Today: {formatDate(today)}</p>
          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
            {weekDays.map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="mt-1.5 grid grid-cols-7 gap-1 text-center text-xs">
            {selectedMonthDays.map((day, index) => {
              const eventTone = day ? eventDays.get(day) : null
              return (
                <div
                  key={`${day ?? 'blank'}-${index}`}
                  className={`relative flex h-6 items-center justify-center rounded-full font-semibold ${
                    day === todayDay ? 'bg-emerald-700 text-white' : day ? 'text-slate-700' : 'text-transparent'
                  }`}
                >
                  {day ?? '-'}
                  {eventTone && day !== todayDay && (
                    <span
                      className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                        eventTone === 'green' ? 'bg-emerald-600' : eventTone === 'red' ? 'bg-red-500' : 'bg-amber-500'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-3 border-t border-slate-100 pt-2">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-950">Today&apos;s Events</h3>
              <Link href="/calendar" className="text-xs font-bold text-emerald-700">View all</Link>
            </div>
            <div className="space-y-2">
              {todayEvents.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${item.type === 'payment' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                      {item.type === 'payment' ? <CheckCircle2 className="h-4 w-4" /> : <ReceiptText className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-800">{item.title}</p>
                      <p className="truncate text-xs text-slate-500">{item.detail}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{currency(item.amount)}</span>
                </div>
              ))}
              {todayEvents.length === 0 && (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">No events recorded today.</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-950">Recent Activity</h2>
            <Link href="/payments" className="text-xs font-bold text-emerald-700">View all</Link>
          </div>
          <div className="space-y-2.5">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.type === 'payment' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {item.type === 'payment' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-800">{item.title}</p>
                    <p className="truncate text-xs text-slate-500">{item.detail} - {formatDate(item.date)}</p>
                  </div>
                </div>
                <p className={`shrink-0 text-xs font-black ${item.type === 'payment' ? 'text-emerald-700' : 'text-red-600'}`}>
                  {item.type === 'payment' ? '+' : '-'} {currency(item.amount)}
                </p>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="rounded-lg bg-slate-50 px-3 py-6 text-center text-xs font-semibold text-slate-500">No recent activity yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-2">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="flex items-center gap-2 px-1">
            <CircleAlert className="h-4 w-4 text-amber-600" strokeWidth={1.9} />
            <h2 className="text-sm font-black text-slate-950">Alerts</h2>
          </div>
          <div className="grid flex-1 gap-2 md:grid-cols-3">
            {data.alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="rounded-lg border border-amber-100 bg-white/70 px-3 py-1.5">
                <p className="truncate text-xs font-black text-slate-800">{alert.title}</p>
                <p className="truncate text-xs text-slate-600">{alert.body}</p>
              </div>
            ))}
            {data.alerts.length === 0 && (
              <div className="rounded-lg border border-emerald-100 bg-white/70 px-3 py-1.5 md:col-span-3">
                <p className="text-xs font-black text-emerald-700">No urgent alerts right now.</p>
                <p className="text-xs text-slate-600">Payments, expenses, and due dates are quiet for this view.</p>
              </div>
            )}
          </div>
          <Link href="/calendar" className="shrink-0 text-xs font-bold text-emerald-800">View calendar</Link>
        </div>
      </section>
    </div>
  )
}
