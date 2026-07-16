import { supportConversations, supportMessages, users } from '@/drizzle/schema'
import { requireCurrentAppUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { and, count, desc, eq, gt } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function cleanMessage(value: unknown) {
  const body = String(value ?? '').trim()
  if (!body) {
    throw new Error('Message is required.')
  }
  return body.slice(0, 2000)
}

async function serializeConversation(
  conversation: typeof supportConversations.$inferSelect,
  viewerRole: string
) {
  const isAdmin = viewerRole === 'admin'
  const readAt = isAdmin ? conversation.adminReadAt : conversation.landlordReadAt
  const unreadFilters = [
    eq(supportMessages.conversationId, conversation.id),
    eq(supportMessages.senderRole, isAdmin ? 'landlord' : 'admin')
  ]
  if (readAt) unreadFilters.push(gt(supportMessages.createdAt, readAt))

  const [[owner], [lastMessage], [unread]] = await Promise.all([
    db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, conversation.userId))
      .limit(1),
    db
      .select()
      .from(supportMessages)
      .where(eq(supportMessages.conversationId, conversation.id))
      .orderBy(desc(supportMessages.createdAt), desc(supportMessages.id))
      .limit(1),
    db
      .select({ count: count() })
      .from(supportMessages)
      .where(and(...unreadFilters))
  ])

  return {
    ...conversation,
    user: owner ?? null,
    lastMessage: lastMessage ?? null,
    unreadCount: Number(unread?.count ?? 0)
  }
}

export async function GET() {
  const user = await requireCurrentAppUser()
  const isAdmin = user.role === 'admin'
  const conversations = await db
    .select()
    .from(supportConversations)
    .where(isAdmin ? undefined : eq(supportConversations.userId, user.id))
    .orderBy(desc(supportConversations.lastMessageAt), desc(supportConversations.id))
    .limit(isAdmin ? 100 : 10)

  const serialized = await Promise.all(
    conversations.map((conversation) => serializeConversation(conversation, user.role))
  )
  const activeConversation = serialized.find((conversation) => conversation.status === 'open') ?? serialized[0] ?? null
  const messages = activeConversation
    ? await db
        .select()
        .from(supportMessages)
        .where(eq(supportMessages.conversationId, activeConversation.id))
        .orderBy(supportMessages.createdAt, supportMessages.id)
    : []

  return NextResponse.json({
    conversations: serialized,
    activeConversation,
    messages,
    totalUnread: serialized.reduce((total, conversation) => total + conversation.unreadCount, 0)
  })
}

export async function POST(req: Request) {
  try {
    const user = await requireCurrentAppUser()
    const body = await req.json()
    const isAdmin = user.role === 'admin'
    const targetUserId = isAdmin ? Number(body.userId) : user.id
    const message = body.message ? cleanMessage(body.message) : null
    const subject = String(body.subject ?? 'Support request').trim().slice(0, 255) || 'Support request'

    if (!targetUserId || !Number.isInteger(targetUserId)) {
      return NextResponse.json({ error: 'A valid user is required.' }, { status: 400 })
    }

    if (isAdmin) {
      const target = await db.query.users.findFirst({ where: eq(users.id, targetUserId) })
      if (!target) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 })
      }
    }

    const [existingOpen] = await db
      .select()
      .from(supportConversations)
      .where(and(eq(supportConversations.userId, targetUserId), eq(supportConversations.status, 'open')))
      .orderBy(desc(supportConversations.lastMessageAt), desc(supportConversations.id))
      .limit(1)

    const now = new Date()
    const [conversation] = existingOpen
      ? await db
          .update(supportConversations)
          .set({
            adminId: isAdmin ? user.id : existingOpen.adminId,
            lastMessageAt: now,
            ...(isAdmin ? { adminReadAt: now } : { landlordReadAt: now })
          })
          .where(eq(supportConversations.id, existingOpen.id))
          .returning()
      : await db
          .insert(supportConversations)
          .values({
            userId: targetUserId,
            adminId: isAdmin ? user.id : null,
            subject,
            lastMessageAt: now,
            ...(isAdmin ? { adminReadAt: now } : { landlordReadAt: now })
          })
          .returning()

    if (message) {
      await db.insert(supportMessages).values({
        conversationId: conversation.id,
        senderUserId: user.id,
        senderRole: isAdmin ? 'admin' : 'landlord',
        body: message
      })
    }

    const messages = await db
      .select()
      .from(supportMessages)
      .where(eq(supportMessages.conversationId, conversation.id))
      .orderBy(supportMessages.createdAt, supportMessages.id)

    return NextResponse.json({
      conversation: await serializeConversation(conversation, user.role),
      messages
    }, { status: existingOpen ? 200 : 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to start chat.' },
      { status: 400 }
    )
  }
}
