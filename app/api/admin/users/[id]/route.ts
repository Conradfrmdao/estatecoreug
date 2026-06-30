import { users } from '@/drizzle/schema'
import { requireAdminUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function parseId(value: string) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

type AdminUserRouteContext = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: AdminUserRouteContext) {
  const admin = await requireAdminUser()
  const { id: idParam } = await params
  const id = parseId(idParam)

  if (!id) {
    return NextResponse.json({ error: 'Invalid user id.' }, { status: 400 })
  }

  const body = await req.json()
  const action = String(body.action ?? '')
  const now = new Date()

  if (id === admin.id && ['reject', 'suspend'].includes(action)) {
    return NextResponse.json({ error: 'You cannot disable your own admin account.' }, { status: 400 })
  }

  const updates =
    action === 'approve'
      ? { accountStatus: 'approved', approvedAt: now, rejectedAt: null, suspendedAt: null }
      : action === 'reject'
        ? { accountStatus: 'rejected', rejectedAt: now, suspendedAt: null }
        : action === 'suspend'
          ? { accountStatus: 'suspended', suspendedAt: now }
          : action === 'activate'
            ? { accountStatus: 'approved', approvedAt: now, suspendedAt: null, rejectedAt: null }
            : null

  if (!updates) {
    return NextResponse.json({ error: 'Unsupported admin action.' }, { status: 400 })
  }

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, id))
    .returning()

  if (!updated) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 })
  }

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: AdminUserRouteContext) {
  const admin = await requireAdminUser()
  const { id: idParam } = await params
  const id = parseId(idParam)

  if (!id) {
    return NextResponse.json({ error: 'Invalid user id.' }, { status: 400 })
  }

  if (id === admin.id) {
    return NextResponse.json({ error: 'You cannot delete your own admin account.' }, { status: 400 })
  }

  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning()

  if (!deleted) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
