import { units } from '@/drizzle/schema'
import { requireCurrentAppUser } from '@/lib/auth'
import { getPropertyForUser, getUnitForUser } from '@/lib/data'
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
    return NextResponse.json({ error: 'Invalid unit id.' }, { status: 400 })
  }

  const row = await getUnitForUser(user.id, id)

  if (!row) {
    return NextResponse.json({ error: 'Unit not found.' }, { status: 404 })
  }

  return NextResponse.json({
    ...row.unit,
    propertyName: row.property.name
  })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireCurrentAppUser()
  const id = parseId(params.id)

  if (!id) {
    return NextResponse.json({ error: 'Invalid unit id.' }, { status: 400 })
  }

  const existing = await getUnitForUser(user.id, id)

  if (!existing) {
    return NextResponse.json({ error: 'Unit not found.' }, { status: 404 })
  }

  const body = await req.json()
  const propertyId = Number(body.propertyId)
  const unitNumber = String(body.unitNumber ?? '').trim()
  const rentAmount = Number(body.rentAmount)
  const status = body.status === 'occupied' ? 'occupied' : 'vacant'

  if (!propertyId || !unitNumber || !Number.isFinite(rentAmount) || rentAmount < 0) {
    return NextResponse.json({ error: 'Property, unit number, and rent amount are required.' }, { status: 400 })
  }

  const property = await getPropertyForUser(user.id, propertyId)

  if (!property) {
    return NextResponse.json({ error: 'Property not found.' }, { status: 404 })
  }

  const [updated] = await db
    .update(units)
    .set({
      propertyId,
      unitNumber,
      rentAmount,
      status
    })
    .where(eq(units.id, id))
    .returning()

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireCurrentAppUser()
  const id = parseId(params.id)

  if (!id) {
    return NextResponse.json({ error: 'Invalid unit id.' }, { status: 400 })
  }

  const existing = await getUnitForUser(user.id, id)

  if (!existing) {
    return NextResponse.json({ error: 'Unit not found.' }, { status: 404 })
  }

  try {
    await db.delete(units).where(eq(units.id, id))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Delete tenants, payments, and expenses linked to this unit first.' },
      { status: 409 }
    )
  }
}
