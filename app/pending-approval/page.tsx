import { getCurrentAppUser } from '@/lib/auth'
import { SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const statusCopy = {
  pending: {
    title: 'Account pending approval',
    body: 'Your Estate Core UG account has been created and is waiting for platform admin approval.'
  },
  rejected: {
    title: 'Account request rejected',
    body: 'This account request was not approved. Contact Estate Core UG support if you believe this is a mistake.'
  },
  suspended: {
    title: 'Account suspended',
    body: 'This account is suspended. Your property data is protected until an admin reactivates access.'
  }
}

export default async function PendingApprovalPage() {
  const user = await getCurrentAppUser()

  if (!user) {
    redirect('/sign-in')
  }

  if (user.accountStatus === 'approved') {
    redirect('/dashboard')
  }

  const copy = statusCopy[user.accountStatus as keyof typeof statusCopy] ?? statusCopy.pending

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <section className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center shadow-sm" style={{ borderColor: '#e2e8f0' }}>
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: '#e6f7ef', color: '#00A550' }}>
          <span className="text-xl font-bold">EC</span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: '#00A550' }}>
          Estate Core UG
        </p>
        <h1 className="mt-3 text-3xl font-bold" style={{ color: '#1a1a2e' }}>
          {copy.title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          {copy.body}
        </p>
        <div className="mt-8 rounded-xl bg-slate-50 p-4 text-left text-sm text-slate-600">
          <p className="font-semibold text-slate-900">{user.name}</p>
          <p>{user.email}</p>
          <p className="mt-2 text-xs uppercase tracking-wider text-slate-400">
            Status: {user.accountStatus}
          </p>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-xl border px-5 py-2.5 text-sm font-semibold text-slate-700"
            style={{ borderColor: '#e2e8f0' }}
          >
            Back to home
          </Link>
          <SignOutButton>
            <button className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: '#00A550' }}>
              Sign out
            </button>
          </SignOutButton>
        </div>
      </section>
    </main>
  )
}
