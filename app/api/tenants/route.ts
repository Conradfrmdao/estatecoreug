import { rentPayments, tenants, units } from '@/drizzle/schema'
import { requireCurrentAppUser } from '@/lib/auth'
import { getUnitForUser, listTenantsForUser } from '@/lib/data'
import { db } from '@/lib/db'
import { buildFirstPaymentValues, planTenantCreation } from '@/lib/tenant-creation'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function isActiveTenantConflict(error: unknown) {
  if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
    return true
  }

  return error instanceof Error && error.message.includes('tenants_one_active_per_unit_idx')
}

function occupiedUnitResponse() {
  return NextResponse.json(
    { error: 'This unit is already occupied. Move or deactivate the current tenant before assigning another one.' },
    { status: 409 }
  )
}

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
  let plan

  try {
    plan = planTenantCreation(await req.json())
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Tenant details are invalid.' },
      { status: 400 }
    )
  }

  const unit = await getUnitForUser(user.id, plan.unitId)

  if (!unit) {
    return NextResponse.json({ error: 'Unit not found.' }, { status: 404 })
  }

  const existingActiveTenant = (await listTenantsForUser(user.id)).find(
    (row) => row.tenant.unitId === plan.unitId && row.tenant.active
  )

  if (plan.active && (existingActiveTenant || unit.unit.status === 'occupied')) {
    return occupiedUnitResponse()
  }

  let created: typeof tenants.$inferSelect | null = null

  try {
    const [tenant] = await db
      .insert(tenants)
      .values({
        unitId: plan.unitId,
        fullName: plan.fullName,
        phone: plan.phone,
        email: plan.email,
        moveInDate: plan.moveInDate,
        rentDueDate: plan.rentDueDate,
        active: plan.active
      })
      .returning()
    created = tenant

    if (plan.recordFirstPayment) {
      await db.insert(rentPayments).values(
        buildFirstPaymentValues(plan, tenant.id, unit.unit.rentAmount)
      )
    }

    if (plan.active) {
      await db.update(units).set({ status: 'occupied' }).where(eq(units.id, plan.unitId))
    }
  } catch (error) {
    if (created) {
      await db.delete(tenants).where(eq(tenants.id, created.id)).catch(() => undefined)
    }
    if (isActiveTenantConflict(error)) {
      return occupiedUnitResponse()
    }
    console.error('Failed to save tenant:', error)
    return NextResponse.json(
      { error: 'Failed to save tenant. Check the unit, payment amount, and database connection.' },
      { status: 500 }
    )
  }

  return NextResponse.json(created, { status: 201 })
}
