import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export type AppUserRole = 'admin' | 'landlord'
export type AppUserStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

function isAdminEmail(email: string) {
  return getAdminEmails().includes(email.toLowerCase())
}

export async function getCurrentUser() {
  const authResult = await auth()
  const userId = authResult?.userId
  if (!userId) throw new Error('Unauthenticated')

  let user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId)
  })

  if (!user) {
    const clerkUser = await currentUser()
    if (!clerkUser) throw new Error('User not found in database or Clerk')

    const email =
      clerkUser.primaryEmailAddress?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      `${clerkUser.id}@clerk.local`

    const name =
      clerkUser.fullName ??
      clerkUser.username ??
      clerkUser.firstName ??
      email
    const phone = clerkUser.primaryPhoneNumber?.phoneNumber ?? null
    const admin = isAdminEmail(email)
    const now = new Date()

    const [created] = await db
      .insert(users)
      .values({
        clerkId: clerkUser.id,
        email,
        name,
        phone,
        role: admin ? 'admin' : 'landlord',
        accountStatus: admin ? 'approved' : 'pending',
        approvedAt: admin ? now : null,
        lastSeenAt: now
      })
      .returning()

    user = created
  } else {
    const admin = isAdminEmail(user.email)
    const updates: Partial<typeof users.$inferInsert> = {
      lastSeenAt: new Date()
    }

    if (admin && (user.role !== 'admin' || user.accountStatus !== 'approved')) {
      updates.role = 'admin'
      updates.accountStatus = 'approved'
      updates.approvedAt = user.approvedAt ?? new Date()
      updates.rejectedAt = null
      updates.suspendedAt = null
    }

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, user.id))
      .returning()

    user = updated ?? user
  }

  return user
}

export async function getCurrentAppUser() {
  try {
    return await getCurrentUser()
  } catch {
    return null
  }
}

export async function requireCurrentAppUser() {
  const user = await getCurrentAppUser()
  if (!user) {
    redirect('/sign-in')
  }
  if (user.accountStatus !== 'approved') {
    redirect('/pending-approval')
  }
  return user
}

export async function requireAdminUser() {
  const user = await getCurrentAppUser()
  if (!user) {
    redirect('/sign-in')
  }
  if (user.accountStatus !== 'approved') {
    redirect('/pending-approval')
  }
  if (user.role !== 'admin') {
    redirect('/dashboard')
  }
  return user
}
