import { units } from '@/drizzle/schema'
import { requireCurrentAppUser } from '@/lib/auth'
import { getPropertyForUser, listUnitsForUser } from '@/lib/data'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const user = await requireCurrentAppUser()
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') ?? '').toLowerCase()
  const status = url.searchParams.get('status') ?? ''
  const propertyId = url.searchParams.get('propertyId') ?? ''
  const rows = await listUnitsForUser(user.id)
  const filtered = rows.filter(({ unit, property }) => {
    if (q && ![unit.unitNumber, unit.status, property.name].some((value) => value.toLowerCase().includes(q))) {
      return false
    }

    if (status && unit.status !== status) {
      return false
    }

    if (propertyId && unit.propertyId !== Number(propertyId)) {
      return false
    }

    return true
  })

  return NextResponse.json(
    filtered.map(({ unit, property }) => ({
      ...unit,
      propertyName: property.name
    }))
  )
}

export async function POST(req: Request) {
  const user = await requireCurrentAppUser()
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

  if (status === 'occupied') {
    return NextResponse.json(
      { error: 'Create the unit as vacant, then assign an active tenant to occupy it.' },
      { status: 400 }
    )
  }

  const [created] = await db
    .insert(units)
    .values({
      propertyId,
      unitNumber,
      rentAmount,
      status
    })
    .returning()

  return NextResponse.json(created, { status: 201 })
}
