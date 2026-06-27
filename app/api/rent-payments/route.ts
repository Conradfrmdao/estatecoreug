import { rentPayments } from '@/drizzle/schema'
import { requireCurrentAppUser } from '@/lib/auth'
import { calculateBalanceAfterPayment, listPaymentsForUser } from '@/lib/data'
import { db } from '@/lib/db'
import { currentPaymentMonth } from '@/lib/format'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const user = await requireCurrentAppUser()
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') ?? '').toLowerCase()
  const month = url.searchParams.get('month') ?? ''
  const method = url.searchParams.get('method') ?? ''
  const rows = await listPaymentsForUser(user.id)
  const filtered = rows.filter(({ payment, tenant, unit, property }) => {
    if (q && ![tenant.fullName, unit.unitNumber, property.name, payment.paymentMethod, payment.notes ?? ''].some((value) => value.toLowerCase().includes(q))) {
      return false
    }

    if (month && payment.paymentMonth !== month) {
      return false
    }

    if (method && payment.paymentMethod !== method) {
      return false
    }

    return true
  })

  return NextResponse.json(
    filtered.map(({ payment, tenant, unit, property }) => ({
      ...payment,
      tenantName: tenant.fullName,
      unitNumber: unit.unitNumber,
      propertyName: property.name,
      rentAmount: unit.rentAmount
    }))
  )
}

export async function POST(req: Request) {
  const user = await requireCurrentAppUser()
  const body = await req.json()
  const tenantId = Number(body.tenantId)
  const amountPaid = Number(body.amountPaid)
  const paymentMonth = String(body.paymentMonth ?? currentPaymentMonth()).trim()
  const paymentDate = body.paymentDate ? new Date(body.paymentDate) : new Date()
  const paymentMethod = String(body.paymentMethod ?? 'other').trim()
  const notes = body.notes ? String(body.notes).trim() : null

  if (!tenantId || !Number.isFinite(amountPaid) || amountPaid <= 0 || !paymentMonth || Number.isNaN(paymentDate.valueOf())) {
    return NextResponse.json({ error: 'Tenant, positive amount, payment month, and payment date are required.' }, { status: 400 })
  }

  const balance = await calculateBalanceAfterPayment({
    userId: user.id,
    tenantId,
    amountPaid,
    paymentMonth
  })

  if (!balance) {
    return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 })
  }

  const [created] = await db
    .insert(rentPayments)
    .values({
      tenantId,
      unitId: balance.unitId,
      amountPaid,
      balanceAfterPayment: balance.balanceAfterPayment,
      paymentMonth,
      paymentDate,
      paymentMethod,
      notes
    })
    .returning()

  return NextResponse.json(created, { status: 201 })
}
