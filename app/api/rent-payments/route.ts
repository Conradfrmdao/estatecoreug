import { rentPayments, tenants } from '@/drizzle/schema'
import { requireCurrentAppUser } from '@/lib/auth'
import { buildRentPaymentPlanForTenant, listPaymentsForUser } from '@/lib/data'
import { db } from '@/lib/db'
import { allocatedPaymentForPeriod, parseMonth, PaymentAllocationError } from '@/lib/rent-cycle'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const user = await requireCurrentAppUser()
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') ?? '').toLowerCase()
  const month = url.searchParams.get('month') ?? ''
  const method = url.searchParams.get('method') ?? ''
  let selectedPeriod: ReturnType<typeof parseMonth> | null = null

  if (month) {
    try {
      selectedPeriod = parseMonth(month)
    } catch {
      return NextResponse.json({ error: 'Invalid payment month.' }, { status: 400 })
    }
  }

  const rows = await listPaymentsForUser(user.id)
  const filtered = rows.filter(({ payment, tenant, unit, property }) => {
    if (q && ![tenant.fullName, unit.unitNumber, property.name, payment.paymentMethod, payment.notes ?? ''].some((value) => value.toLowerCase().includes(q))) {
      return false
    }

    if (selectedPeriod && allocatedPaymentForPeriod(payment, selectedPeriod) <= 0) {
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
      allocatedAmount: selectedPeriod ? allocatedPaymentForPeriod(payment, selectedPeriod) : payment.amountPaid,
      tenantName: tenant.fullName,
      unitNumber: unit.unitNumber,
      propertyName: property.name,
      rentAmount: unit.rentAmount
    }))
  )
}

export async function POST(req: Request) {
  try {
    const user = await requireCurrentAppUser()
    const body = await req.json()
    const tenantId = Number(body.tenantId)
    const amountPaid = Number(body.amountPaid)
    const paymentDate = body.paymentDate ? new Date(body.paymentDate) : new Date()
    const paymentMethod = String(body.paymentMethod ?? 'other').trim()
    const notes = body.notes ? String(body.notes).trim() : null
    const preferredStartDate = body.coverageStart ? new Date(body.coverageStart) : undefined

    if (!tenantId || !Number.isFinite(amountPaid) || amountPaid <= 0 || Number.isNaN(paymentDate.valueOf())) {
      return NextResponse.json({ error: 'Tenant, positive amount, and payment date are required.' }, { status: 400 })
    }

    if (preferredStartDate && Number.isNaN(preferredStartDate.valueOf())) {
      return NextResponse.json({ error: 'Payment coverage dates are invalid.' }, { status: 400 })
    }

    let plan
    try {
      plan = await buildRentPaymentPlanForTenant({
        userId: user.id,
        tenantId,
        amountPaid,
        preferredStartDate
      })
    } catch (error) {
      if (error instanceof PaymentAllocationError) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      throw error
    }

    if (!plan) {
      return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 })
    }

    const [created] = await db
      .insert(rentPayments)
      .values({
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
      .returning()

    await db
      .update(tenants)
      .set({ rentDueDate: plan.nextRentDueDate })
      .where(eq(tenants.id, tenantId))

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Failed to save payment:', error)
    return NextResponse.json({ error: 'Failed to save payment. Check the tenant, coverage dates, and database connection.' }, { status: 500 })
  }
}
