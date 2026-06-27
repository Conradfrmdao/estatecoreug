import { expenses } from '@/drizzle/schema'
import { requireCurrentAppUser } from '@/lib/auth'
import { getExpenseForUser, getPropertyForUser, getUnitForUser } from '@/lib/data'
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
    return NextResponse.json({ error: 'Invalid expense id.' }, { status: 400 })
  }

  const row = await getExpenseForUser(user.id, id)

  if (!row) {
    return NextResponse.json({ error: 'Expense not found.' }, { status: 404 })
  }

  return NextResponse.json({
    ...row.expense,
    propertyName: row.property.name,
    unitNumber: row.unit?.unitNumber ?? null
  })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireCurrentAppUser()
  const id = parseId(params.id)

  if (!id) {
    return NextResponse.json({ error: 'Invalid expense id.' }, { status: 400 })
  }

  const existing = await getExpenseForUser(user.id, id)

  if (!existing) {
    return NextResponse.json({ error: 'Expense not found.' }, { status: 404 })
  }

  const body = await req.json()
  const propertyId = Number(body.propertyId)
  const unitId = body.unitId ? Number(body.unitId) : null
  const title = String(body.title ?? '').trim()
  const category = String(body.category ?? 'other').trim()
  const amount = Number(body.amount)
  const expenseDate = body.expenseDate ? new Date(body.expenseDate) : new Date()
  const description = body.description ? String(body.description).trim() : null

  if (!propertyId || !title || !Number.isFinite(amount) || amount <= 0 || Number.isNaN(expenseDate.valueOf())) {
    return NextResponse.json({ error: 'Property, title, positive amount, and expense date are required.' }, { status: 400 })
  }

  const property = await getPropertyForUser(user.id, propertyId)

  if (!property) {
    return NextResponse.json({ error: 'Property not found.' }, { status: 404 })
  }

  if (unitId) {
    const unit = await getUnitForUser(user.id, unitId)

    if (!unit || unit.unit.propertyId !== propertyId) {
      return NextResponse.json({ error: 'Unit must belong to the selected property.' }, { status: 400 })
    }
  }

  const [updated] = await db
    .update(expenses)
    .set({
      propertyId,
      unitId,
      title,
      category,
      amount,
      expenseDate,
      description
    })
    .where(eq(expenses.id, id))
    .returning()

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireCurrentAppUser()
  const id = parseId(params.id)

  if (!id) {
    return NextResponse.json({ error: 'Invalid expense id.' }, { status: 400 })
  }

  const existing = await getExpenseForUser(user.id, id)

  if (!existing) {
    return NextResponse.json({ error: 'Expense not found.' }, { status: 404 })
  }

  await db.delete(expenses).where(eq(expenses.id, id))
  return NextResponse.json({ ok: true })
}
