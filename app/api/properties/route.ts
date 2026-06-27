import { properties } from '@/drizzle/schema'
import { requireCurrentAppUser } from '@/lib/auth'
import { listPropertiesForUser } from '@/lib/data'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const user = await requireCurrentAppUser()
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') ?? '').toLowerCase()
  const rows = await listPropertiesForUser(user.id)
  const filtered = q
    ? rows.filter((row) =>
        [row.name, row.location].some((value) => value.toLowerCase().includes(q))
      )
    : rows

  return NextResponse.json(filtered)
}

export async function POST(req: Request) {
  const user = await requireCurrentAppUser()
  const body = await req.json()
  const name = String(body.name ?? '').trim()
  const location = String(body.location ?? '').trim()

  if (!name || !location) {
    return NextResponse.json({ error: 'Name and location are required.' }, { status: 400 })
  }

  const [created] = await db
    .insert(properties)
    .values({
      name,
      location,
      userId: user.id
    })
    .returning()

  return NextResponse.json(created, { status: 201 })
}
