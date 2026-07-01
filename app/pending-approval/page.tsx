import { getCurrentAppUser } from '@/lib/auth'
import { SignOutButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const statusCopy = {
  pending: {
    eyebrow: 'Approval required',
    title: 'Your account is waiting for approval.',
    body: 'An admin will review your account before you can access the system.',
    note: 'Please check back later or contact support if you think this is a mistake.'
  },
  rejected: {
    eyebrow: 'Access not approved',
    title: 'Account request rejected',
    body: 'This account request was not approved.',
    note: 'Contact Estate Core UG support if you believe this is a mistake.'
  },
  suspended: {
    eyebrow: 'Access paused',
    title: 'Account suspended',
    body: 'This account is suspended. Your property data remains protected.',
    note: 'Contact support or wait for an admin to reactivate your access.'
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
    <main className="min-h-dvh overflow-y-auto bg-slate-50 px-4 py-6 sm:px-6 sm:py-10">
      <section
        className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-xl items-center justify-center sm:min-h-[calc(100dvh-5rem)]"
        aria-labelledby="approval-title"
      >
        <div className="w-full rounded-2xl border bg-white px-4 py-6 text-center shadow-sm sm:px-8 sm:py-8" style={{ borderColor: '#e2e8f0' }}>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:h-24 sm:w-24">
            <Image
              src="/estatecore-mark.png"
              alt="Estate Core UG logo"
              width={96}
              height={96}
              priority
              className="h-full w-full rounded-xl object-contain"
              sizes="96px"
            />
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.18em]" style={{ color: '#00A550' }}>
            {copy.eyebrow}
          </p>
          <p className="mt-2 text-lg font-black leading-tight text-slate-950 sm:text-xl">
            Estate Core UG
          </p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Property Management
          </p>
          <h1 id="approval-title" className="mt-5 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
            {copy.title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
            {copy.body}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {copy.note}
          </p>
          <div className="mt-6 rounded-xl border bg-slate-50 p-4 text-left text-sm text-slate-600" style={{ borderColor: '#e2e8f0' }}>
            <p className="truncate font-bold text-slate-950">{user.name}</p>
            <p className="mt-1 truncate">{user.email}</p>
            <div className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-amber-700">
              Status: {user.accountStatus}
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              style={{ borderColor: '#e2e8f0' }}
            >
              Back to home
            </Link>
            <SignOutButton>
              <button className="inline-flex min-h-11 w-full items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-95" style={{ backgroundColor: '#00A550' }}>
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </section>
    </main>
  )
}
