import { rentPayments, tenants } from '@/drizzle/schema'
import { requireCurrentAppUser } from '@/lib/auth'
import { calculateBalanceAfterPayment, getTenantForUser, listPaymentsForUser } from '@/lib/data'
import { db } from '@/lib/db'
import { currentPaymentMonth } from '@/lib/format'
import { calculateDueDate, monthFromDate, parseMonth } from '@/lib/rent-cycle'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function parseMonthsCovered(value: unknown) {
  const number = Number(value ?? 1)
  if (!Number.isFinite(number)) {
    return 1
  }

  return Math.max(1, Math.trunc(number))
}

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
  try {
    const user = await requireCurrentAppUser()
    const body = await req.json()
    const tenantId = Number(body.tenantId)
    const amountPaid = Number(body.amountPaid)
    const requestedPaymentMonth = String(body.paymentMonth ?? currentPaymentMonth()).trim()
    const paymentDate = body.paymentDate ? new Date(body.paymentDate) : new Date()
    const paymentMethod = String(body.paymentMethod ?? 'other').trim()
    const monthsCovered = parseMonthsCovered(body.monthsCovered)
    const notes = body.notes ? String(body.notes).trim() : null

    if (!tenantId || !Number.isFinite(amountPaid) || amountPaid <= 0 || !requestedPaymentMonth || Number.isNaN(paymentDate.valueOf())) {
      return NextResponse.json({ error: 'Tenant, positive amount, payment month, and payment date are required.' }, { status: 400 })
    }

    const tenantRow = await getTenantForUser(user.id, tenantId)

    if (!tenantRow) {
      return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 })
    }

    const coverageStart = body.coverageStart
      ? new Date(body.coverageStart)
      : tenantRow.tenant.rentDueDate ?? parseMonth(requestedPaymentMonth).start
    const coverageEnd = body.coverageEnd
      ? new Date(body.coverageEnd)
      : calculateDueDate(coverageStart, monthsCovered)
    const paymentMonth = monthFromDate(coverageStart)

    if (Number.isNaN(coverageStart.valueOf()) || Number.isNaN(coverageEnd.valueOf()) || coverageEnd <= coverageStart) {
      return NextResponse.json({ error: 'Payment coverage dates are invalid.' }, { status: 400 })
    }

    const balance = await calculateBalanceAfterPayment({
      userId: user.id,
      tenantId,
      amountPaid,
      paymentMonth,
      monthsCovered
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
        coverageStart,
        coverageEnd,
        monthsCovered,
        paymentDate,
        paymentMethod,
        notes
      })
      .returning()

    if (coverageEnd > tenantRow.tenant.rentDueDate) {
      await db
        .update(tenants)
        .set({ rentDueDate: coverageEnd })
        .where(eq(tenants.id, tenantId))
    }

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Failed to save payment:', error)
    return NextResponse.json({ error: 'Failed to save payment. Check the tenant, coverage dates, and database connection.' }, { status: 500 })
  }
}
