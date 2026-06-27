import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  // Clerk v5 uses auth() as a function — works in both v4 and v5
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

    const [created] = await db
      .insert(users)
      .values({
        clerkId: clerkUser.id,
        email,
        name
      })
      .returning()
    
    user = created
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
  return user
}
