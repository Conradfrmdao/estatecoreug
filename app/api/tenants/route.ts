import { tenants, units } from '@/drizzle/schema'
import { requireCurrentAppUser } from '@/lib/auth'
import { getUnitForUser, listTenantsForUser } from '@/lib/data'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const user = await requireCurrentAppUser()
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') ?? '').toLowerCase()
  const active = url.searchParams.get('active')
  const unitId = url.searchParams.get('unitId') ?? ''
  const rows = await listTenantsForUser(user.id)

  const filtered = rows.filter(({ tenant, unit, property }) => {
    if (q && ![tenant.fullName, tenant.phone, tenant.email ?? '', unit.unitNumber, property.name].some((value) => value.toLowerCase().includes(q))) {
      return false
    }

    if (active === 'true' && !tenant.active) {
      return false
    }

    if (active === 'false' && tenant.active) {
      return false
    }

    if (unitId && tenant.unitId !== Number(unitId)) {
      return false
    }

    return true
  })

  return NextResponse.json(
    filtered.map(({ tenant, unit, property }) => ({
      ...tenant,
      unitNumber: unit.unitNumber,
      rentAmount: unit.rentAmount,
      propertyName: property.name
    }))
  )
}

export async function POST(req: Request) {
  const user = await requireCurrentAppUser()
  const body = await req.json()
  const unitId = Number(body.unitId)
  const fullName = String(body.fullName ?? '').trim()
  const phone = String(body.phone ?? '').trim()
  const email = body.email ? String(body.email).trim() : null
  const moveInDate = body.moveInDate ? new Date(body.moveInDate) : new Date()
  const rentDueDate = body.rentDueDate ? new Date(body.rentDueDate) : new Date()
  const active = body.active ?? true

  if (!unitId || !fullName || !phone || Number.isNaN(moveInDate.valueOf()) || Number.isNaN(rentDueDate.valueOf())) {
    return NextResponse.json({ error: 'Unit, name, phone, move-in date, and rent due date are required.' }, { status: 400 })
  }

  const unit = await getUnitForUser(user.id, unitId)

  if (!unit) {
    return NextResponse.json({ error: 'Unit not found.' }, { status: 404 })
  }

  const existingActiveTenant = (await listTenantsForUser(user.id)).find(
    (row) => row.tenant.unitId === unitId && row.tenant.active
  )

  if (active && existingActiveTenant) {
    return NextResponse.json({ error: 'This unit already has an active tenant.' }, { status: 409 })
  }

  const [created] = await db
    .insert(tenants)
    .values({
      unitId,
      fullName,
      phone,
      email,
      moveInDate,
      rentDueDate,
      active
    })
    .returning()

  if (active) {
    await db.update(units).set({ status: 'occupied' }).where(eq(units.id, unitId))
  }

  return NextResponse.json(created, { status: 201 })
}
