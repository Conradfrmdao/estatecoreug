import { properties } from '@/drizzle/schema'
import { requireCurrentAppUser } from '@/lib/auth'
import { getPropertyForUser } from '@/lib/data'
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
    return NextResponse.json({ error: 'Invalid property id.' }, { status: 400 })
  }

  const property = await getPropertyForUser(user.id, id)

  if (!property) {
    return NextResponse.json({ error: 'Property not found.' }, { status: 404 })
  }

  return NextResponse.json(property)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireCurrentAppUser()
  const id = parseId(params.id)

  if (!id) {
    return NextResponse.json({ error: 'Invalid property id.' }, { status: 400 })
  }

  const existing = await getPropertyForUser(user.id, id)

  if (!existing) {
    return NextResponse.json({ error: 'Property not found.' }, { status: 404 })
  }

  const body = await req.json()
  const name = String(body.name ?? '').trim()
  const location = String(body.location ?? '').trim()

  if (!name || !location) {
    return NextResponse.json({ error: 'Name and location are required.' }, { status: 400 })
  }

  const [updated] = await db
    .update(properties)
    .set({ name, location })
    .where(eq(properties.id, id))
    .returning()

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireCurrentAppUser()
  const id = parseId(params.id)

  if (!id) {
    return NextResponse.json({ error: 'Invalid property id.' }, { status: 400 })
  }

  const existing = await getPropertyForUser(user.id, id)

  if (!existing) {
    return NextResponse.json({ error: 'Property not found.' }, { status: 404 })
  }

  try {
    await db.delete(properties).where(eq(properties.id, id))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Delete units, tenants, payments, and expenses linked to this property first.' },
      { status: 409 }
    )
  }
}
