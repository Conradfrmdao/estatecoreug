import { rentPayments, tenants, units } from '@/drizzle/schema'
import { requireCurrentAppUser } from '@/lib/auth'
import { getTenantForUser, getUnitForUser, listTenantsForUser } from '@/lib/data'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function parseId(value: string) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

type TenantRouteContext = { params: Promise<{ id: string }> }

async function refreshUnitStatuses(userId: number, unitIds: number[]) {
  const uniqueUnitIds = Array.from(new Set(unitIds))
  const tenantRows = await listTenantsForUser(userId)

  await Promise.all(
    uniqueUnitIds.map((unitId) => {
      const hasActiveTenant = tenantRows.some(
        ({ tenant }) => tenant.unitId === unitId && tenant.active
      )

      return db
        .update(units)
        .set({ status: hasActiveTenant ? 'occupied' : 'vacant' })
        .where(eq(units.id, unitId))
    })
  )
}

export async function GET(_req: Request, { params }: TenantRouteContext) {
  const user = await requireCurrentAppUser()
  const { id: idParam } = await params
  const id = parseId(idParam)

  if (!id) {
    return NextResponse.json({ error: 'Invalid tenant id.' }, { status: 400 })
  }

  const row = await getTenantForUser(user.id, id)

  if (!row) {
    return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 })
  }

  return NextResponse.json({
    ...row.tenant,
    unitNumber: row.unit.unitNumber,
    rentAmount: row.unit.rentAmount,
    propertyName: row.property.name
  })
}

export async function PATCH(req: Request, { params }: TenantRouteContext) {
  const user = await requireCurrentAppUser()
  const { id: idParam } = await params
  const id = parseId(idParam)

  if (!id) {
    return NextResponse.json({ error: 'Invalid tenant id.' }, { status: 400 })
  }

  const existing = await getTenantForUser(user.id, id)

  if (!existing) {
    return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 })
  }

  const body = await req.json()
  const unitId = Number(body.unitId)
  const fullName = String(body.fullName ?? '').trim()
  const phone = String(body.phone ?? '').trim()
  const email = body.email ? String(body.email).trim() : null
  const moveInDate = body.moveInDate ? new Date(body.moveInDate) : new Date()
  const rentDueDate = body.rentDueDate ? new Date(body.rentDueDate) : new Date()
  const active = Boolean(body.active)

  if (!unitId || !fullName || !phone || Number.isNaN(moveInDate.valueOf()) || Number.isNaN(rentDueDate.valueOf())) {
    return NextResponse.json({ error: 'Unit, name, phone, move-in date, and rent due date are required.' }, { status: 400 })
  }

  const unit = await getUnitForUser(user.id, unitId)

  if (!unit) {
    return NextResponse.json({ error: 'Unit not found.' }, { status: 404 })
  }

  const tenantRows = await listTenantsForUser(user.id)
  const conflictingTenant = tenantRows.find(
    (row) => row.tenant.id !== id && row.tenant.unitId === unitId && row.tenant.active
  )
  const isSameActiveAssignment = existing.tenant.active && existing.tenant.unitId === unitId

  if (active && !isSameActiveAssignment && (conflictingTenant || unit.unit.status === 'occupied')) {
    return NextResponse.json(
      { error: 'This unit is already occupied. Move or deactivate the current tenant before assigning another one.' },
      { status: 409 }
    )
  }

  const [updated] = await db
    .update(tenants)
    .set({
      unitId,
      fullName,
      phone,
      email,
      moveInDate,
      rentDueDate,
      active
    })
    .where(eq(tenants.id, id))
    .returning()

  await refreshUnitStatuses(user.id, [existing.tenant.unitId, unitId])

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: TenantRouteContext) {
  const user = await requireCurrentAppUser()
  const { id: idParam } = await params
  const id = parseId(idParam)

  if (!id) {
    return NextResponse.json({ error: 'Invalid tenant id.' }, { status: 400 })
  }

  const existing = await getTenantForUser(user.id, id)

  if (!existing) {
    return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 })
  }

  try {
    await db.delete(rentPayments).where(eq(rentPayments.tenantId, id))
    await db.delete(tenants).where(eq(tenants.id, id))
    await refreshUnitStatuses(user.id, [existing.tenant.unitId])
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Unable to delete this tenant.' },
      { status: 409 }
    )
  }
}
