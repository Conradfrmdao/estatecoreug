import { supportConversations } from '@/drizzle/schema'
import { requireCurrentAppUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { and, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

function parseId(value: string) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function POST(_req: Request, { params }: RouteContext) {
  const user = await requireCurrentAppUser()
  const { id: idParam } = await params
  const id = parseId(idParam)

  if (!id) {
    return NextResponse.json({ error: 'Invalid chat id.' }, { status: 400 })
  }

  const [conversation] = await db
    .select()
    .from(supportConversations)
    .where(
      user.role === 'admin'
        ? eq(supportConversations.id, id)
        : and(eq(supportConversations.id, id), eq(supportConversations.userId, user.id))
    )
    .limit(1)

  if (!conversation) {
    return NextResponse.json({ error: 'Chat not found.' }, { status: 404 })
  }

  const [updated] = await db
    .update(supportConversations)
    .set({
      status: 'closed',
      endedAt: new Date(),
      adminId: user.role === 'admin' ? user.id : conversation.adminId
    })
    .where(eq(supportConversations.id, id))
    .returning()

  return NextResponse.json(updated)
}
