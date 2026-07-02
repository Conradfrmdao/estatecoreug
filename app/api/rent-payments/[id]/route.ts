import { rentPayments, tenants } from '@/drizzle/schema'
import { requireCurrentAppUser } from '@/lib/auth'
import { buildRentPaymentPlanForTenant, getPaymentForUser, recalculateTenantRentDueDate } from '@/lib/data'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function parseId(value: string) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

type PaymentRouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: PaymentRouteContext) {
  const user = await requireCurrentAppUser()
  const { id: idParam } = await params
  const id = parseId(idParam)

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

export async function PATCH(req: Request, { params }: PaymentRouteContext) {
  const user = await requireCurrentAppUser()
  const { id: idParam } = await params
  const id = parseId(idParam)

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
  const paymentDate = body.paymentDate ? new Date(body.paymentDate) : new Date()
  const paymentMethod = String(body.paymentMethod ?? 'other').trim()
  const notes = body.notes ? String(body.notes).trim() : null
  const preferredStartDate = body.coverageStart ? new Date(body.coverageStart) : existing.payment.coverageStart

  if (!tenantId || !Number.isFinite(amountPaid) || amountPaid <= 0 || Number.isNaN(paymentDate.valueOf())) {
    return NextResponse.json({ error: 'Tenant, positive amount, and payment date are required.' }, { status: 400 })
  }

  if (preferredStartDate && Number.isNaN(new Date(preferredStartDate).valueOf())) {
    return NextResponse.json({ error: 'Payment coverage dates are invalid.' }, { status: 400 })
  }

  const plan = await buildRentPaymentPlanForTenant({
    userId: user.id,
    tenantId,
    amountPaid,
    preferredStartDate: preferredStartDate ? new Date(preferredStartDate) : undefined,
    ignorePaymentId: id
  })

  if (!plan) {
    return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 })
  }

  const [updated] = await db
    .update(rentPayments)
    .set({
      tenantId,
      unitId: plan.unitId,
      amountPaid,
      balanceAfterPayment: plan.balanceAfterPayment,
      paymentMonth: plan.paymentMonth,
      coverageStart: plan.coverageStart,
      coverageEnd: plan.coverageEnd,
      monthsCovered: plan.monthsCovered,
      allocations: plan.allocations,
      paymentDate,
      paymentMethod,
      notes
    })
    .where(eq(rentPayments.id, id))
    .returning()

  await db
    .update(tenants)
    .set({ rentDueDate: plan.nextRentDueDate })
    .where(eq(tenants.id, tenantId))

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: PaymentRouteContext) {
  const user = await requireCurrentAppUser()
  const { id: idParam } = await params
  const id = parseId(idParam)

  if (!id) {
    return NextResponse.json({ error: 'Invalid payment id.' }, { status: 400 })
  }

  const existing = await getPaymentForUser(user.id, id)

  if (!existing) {
    return NextResponse.json({ error: 'Payment not found.' }, { status: 404 })
  }

  const tenantId = existing.payment.tenantId
  await db.delete(rentPayments).where(eq(rentPayments.id, id))
  await recalculateTenantRentDueDate(user.id, tenantId)
  return NextResponse.json({ ok: true })
}
