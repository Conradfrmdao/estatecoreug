import { rentPayments } from '@/drizzle/schema'
import { requireCurrentAppUser } from '@/lib/auth'
import { calculateBalanceAfterPayment, getPaymentForUser } from '@/lib/data'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function parseId(value: string) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireCurrentAppUser()
  const id = parseId(params.id)

  if (!id) {
    return NextResponse.json({ error: 'Invalid payment id.' }, { status: 400 })
  }

  const row = await getPaymentForUser(user.id, id)

  if (!row) {
    return NextResponse.json({ error: 'Payment not found.' }, { status: 404 })
  }

  return NextResponse.json({
    ...row.payment,
    tenantName: row.tenant.fullName,
    unitNumber: row.unit.unitNumber,
    propertyName: row.property.name
  })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireCurrentAppUser()
  const id = parseId(params.id)

  if (!id) {
    return NextResponse.json({ error: 'Invalid payment id.' }, { status: 400 })
  }

  const existing = await getPaymentForUser(user.id, id)

  if (!existing) {
    return NextResponse.json({ error: 'Payment not found.' }, { status: 404 })
  }

  const body = await req.json()
  const tenantId = Number(body.tenantId)
  const amountPaid = Number(body.amountPaid)
  const paymentMonth = String(body.paymentMonth ?? '').trim()
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
    paymentMonth,
    ignorePaymentId: id
  })

  if (!balance) {
    return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 })
  }

  const [updated] = await db
    .update(rentPayments)
    .set({
      tenantId,
      unitId: balance.unitId,
      amountPaid,
      balanceAfterPayment: balance.balanceAfterPayment,
      paymentMonth,
      paymentDate,
      paymentMethod,
      notes
    })
    .where(eq(rentPayments.id, id))
    .returning()

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireCurrentAppUser()
  const id = parseId(params.id)

  if (!id) {
    return NextResponse.json({ error: 'Invalid payment id.' }, { status: 400 })
  }

  const existing = await getPaymentForUser(user.id, id)

  if (!existing) {
    return NextResponse.json({ error: 'Payment not found.' }, { status: 404 })
  }

  await db.delete(rentPayments).where(eq(rentPayments.id, id))
  return NextResponse.json({ ok: true })
}
