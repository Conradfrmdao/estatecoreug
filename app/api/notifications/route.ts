import { NextResponse } from 'next/server'

import { requireCurrentAppUser } from '@/lib/auth'
import { getDashboardData } from '@/lib/data'
import { currency, currentPaymentMonth, formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

function notificationTone(severity: string) {
  if (severity === 'danger') return 'danger'
  if (severity === 'warning') return 'warning'
  if (severity === 'success') return 'success'
  return 'info'
}

export async function GET(req: Request) {
  const user = await requireCurrentAppUser()
  const url = new URL(req.url)
  const month = url.searchParams.get('month') ?? currentPaymentMonth()
  const data = await getDashboardData(user.id, month)

  const alertItems = data.alerts.map((alert) => ({
    id: alert.id,
    title: alert.title,
    body: alert.body,
    tone: notificationTone(alert.severity),
    href: '/calendar'
  }))

  const tenantItems = data.tenantBalances
    .filter((row) => row.paymentStatus !== 'paid')
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .map((row) => {
      const partial = row.paymentStatus === 'partial'
      const overdue = row.paymentStatus === 'overdue'
      const dueSoon = row.paymentStatus === 'upcoming' || row.paymentStatus === 'due_today'

      return {
        id: `tenant-${row.tenant.id}-${row.paymentStatus}`,
        title: partial
          ? 'Payment not complete'
          : overdue
            ? 'Rent overdue'
            : dueSoon
              ? 'Rent due soon'
              : 'Rent unpaid',
        body: `${row.tenant.fullName} owes ${currency(row.balance)} for ${row.property.name}, Unit ${row.unit.unitNumber}. Due ${formatDate(row.dueDate)}.`,
        tone: overdue ? 'danger' : dueSoon || partial ? 'warning' : 'info',
        href: `/tenants?month=${month}&status=unpaid`
      }
    })

  const seen = new Set<string>()
  const notifications = [...tenantItems, ...alertItems]
    .filter((item) => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
    .slice(0, 10)

  return NextResponse.json({
    count: notifications.length,
    notifications
  })
}
