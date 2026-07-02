import { supportConversations, supportMessages } from '@/drizzle/schema'
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

function cleanMessage(value: unknown) {
  const body = String(value ?? '').trim()
  if (!body) {
    throw new Error('Message is required.')
  }
  return body.slice(0, 2000)
}

async function getAuthorizedConversation(userId: number, role: string, conversationId: number) {
  const [conversation] = await db
    .select()
    .from(supportConversations)
    .where(
      role === 'admin'
        ? eq(supportConversations.id, conversationId)
        : and(eq(supportConversations.id, conversationId), eq(supportConversations.userId, userId))
    )
    .limit(1)

  return conversation ?? null
}

export async function GET(_req: Request, { params }: RouteContext) {
  const user = await requireCurrentAppUser()
  const { id: idParam } = await params
  const id = parseId(idParam)

  if (!id) {
    return NextResponse.json({ error: 'Invalid chat id.' }, { status: 400 })
  }

  const conversation = await getAuthorizedConversation(user.id, user.role, id)
  if (!conversation) {
    return NextResponse.json({ error: 'Chat not found.' }, { status: 404 })
  }

  const messages = await db
    .select()
    .from(supportMessages)
    .where(eq(supportMessages.conversationId, id))
    .orderBy(supportMessages.createdAt, supportMessages.id)

  return NextResponse.json({ conversation, messages })
}

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const user = await requireCurrentAppUser()
    const { id: idParam } = await params
    const id = parseId(idParam)

    if (!id) {
      return NextResponse.json({ error: 'Invalid chat id.' }, { status: 400 })
    }

    const conversation = await getAuthorizedConversation(user.id, user.role, id)
    if (!conversation) {
      return NextResponse.json({ error: 'Chat not found.' }, { status: 404 })
    }

    if (conversation.status !== 'open') {
      return NextResponse.json({ error: 'This chat has ended. Start a new chat to continue.' }, { status: 409 })
    }

    const body = await req.json()
    const message = cleanMessage(body.message)
    const now = new Date()
    const [created] = await db
      .insert(supportMessages)
      .values({
        conversationId: id,
        senderUserId: user.id,
        senderRole: user.role === 'admin' ? 'admin' : 'landlord',
        body: message
      })
      .returning()

    await db
      .update(supportConversations)
      .set({
        adminId: user.role === 'admin' ? user.id : conversation.adminId,
        lastMessageAt: now
      })
      .where(eq(supportConversations.id, id))

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to send message.' },
      { status: 400 }
    )
  }
}
