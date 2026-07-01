import { units } from '@/drizzle/schema'
import { requireCurrentAppUser } from '@/lib/auth'
import { getPropertyForUser, getUnitForUser, listTenantsForUser } from '@/lib/data'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function parseId(value: string) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

type UnitRouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: UnitRouteContext) {
  const user = await requireCurrentAppUser()
  const { id: idParam } = await params
  const id = parseId(idParam)

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

export async function PATCH(req: Request, { params }: UnitRouteContext) {
  const user = await requireCurrentAppUser()
  const { id: idParam } = await params
  const id = parseId(idParam)

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

  const activeTenant = (await listTenantsForUser(user.id)).find(
    (row) => row.tenant.unitId === id && row.tenant.active
  )

  if (status === 'occupied' && !activeTenant) {
    return NextResponse.json(
      { error: 'Assign an active tenant before marking this unit occupied.' },
      { status: 400 }
    )
  }

  if (status === 'vacant' && activeTenant) {
    return NextResponse.json(
      { error: 'Deactivate or move the active tenant before marking this unit vacant.' },
      { status: 409 }
    )
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

export async function DELETE(_req: Request, { params }: UnitRouteContext) {
  const user = await requireCurrentAppUser()
  const { id: idParam } = await params
  const id = parseId(idParam)

  if (!id) {
    return NextResponse.json({ error: 'Invalid unit id.' }, { status: 400 })
  }

  const existing = await getUnitForUser(user.id, id)

  if (!existing) {
    return NextResponse.json({ error: 'Unit not found.' }, { status: 404 })
  }

  await db.delete(units).where(eq(units.id, id))

  return NextResponse.json({ ok: true })
}
