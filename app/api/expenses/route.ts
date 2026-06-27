import { expenses } from '@/drizzle/schema'
import { requireCurrentAppUser } from '@/lib/auth'
import { getPropertyForUser, getUnitForUser, listExpensesForUser } from '@/lib/data'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const user = await requireCurrentAppUser()
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') ?? '').toLowerCase()
  const category = url.searchParams.get('category') ?? ''
  const propertyId = url.searchParams.get('propertyId') ?? ''
  const rows = await listExpensesForUser(user.id)
  const filtered = rows.filter(({ expense, property, unit }) => {
    if (q && ![expense.title, expense.category, expense.description ?? '', property.name, unit?.unitNumber ?? ''].some((value) => value.toLowerCase().includes(q))) {
      return false
    }

    if (category && expense.category !== category) {
      return false
    }

    if (propertyId && expense.propertyId !== Number(propertyId)) {
      return false
    }

    return true
  })

  return NextResponse.json(
    filtered.map(({ expense, property, unit }) => ({
      ...expense,
      propertyName: property.name,
      unitNumber: unit?.unitNumber ?? null
    }))
  )
}

export async function POST(req: Request) {
  const user = await requireCurrentAppUser()
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

  const [created] = await db
    .insert(expenses)
    .values({
      propertyId,
      unitId,
      title,
      category,
      amount,
      expenseDate,
      description
    })
    .returning()

  return NextResponse.json(created, { status: 201 })
}
