import { getCurrentAppUser } from '@/lib/auth'
import { SignOutButton } from '@clerk/nextjs'
import HouseMark from '@/components/shell/HouseMark'
import { Mail, Phone } from 'lucide-react'
import type { Viewport } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = { themeColor: '#E6EBE6' }

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

const supportContact = {
  phone: '+256 751929535',
  email: 'godlovesconrad@gmail.com'
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
    <main className="min-h-dvh overflow-y-auto bg-ground px-4 py-6 sm:px-6 sm:py-10">
      <section
        className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-xl items-center justify-center sm:min-h-[calc(100dvh-5rem)]"
        aria-labelledby="approval-title"
      >
        <div className="page-enter w-full rounded-[28px] bg-white px-5 py-7 text-center shadow-soft sm:px-9 sm:py-9">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-hi text-ink">
            <HouseMark size={32} />
          </span>
          <p className="eyebrow mt-5">{copy.eyebrow}</p>
          <p className="mt-2 text-[17px] font-extrabold leading-tight text-ink">EstateCore UG</p>
          <p className="mt-0.5 text-[12px] font-semibold text-muted">Property management</p>
          <h1 id="approval-title" className="mt-5 text-[26px] font-extrabold leading-8 tracking-[-0.02em] text-ink sm:text-[28px] sm:leading-[34px]">
            {copy.title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] font-medium leading-6 text-ink-soft">
            {copy.body}
          </p>
          <p className="mx-auto mt-2 max-w-md text-[14px] font-medium leading-6 text-muted">
            {copy.note}
          </p>
          <div className="mt-6 grid gap-2.5 text-left sm:grid-cols-2">
            <div className="min-w-0 rounded-tile bg-canvas px-4 py-3.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted">Your account</p>
              <p className="mt-1 truncate text-[15px] font-bold text-ink">{user.name}</p>
              <p className="truncate text-[13px] font-medium text-muted">{user.email}</p>
              <span className="mt-2.5 inline-flex rounded-full bg-carried-bg px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-carried-fg">
                Status: {user.accountStatus}
              </span>
            </div>
            <div className="min-w-0 rounded-tile bg-mint px-4 py-3.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-forest-ink">Support contact</p>
              <p className="mt-1 flex items-center gap-2 text-[14px] font-semibold text-ink">
                <Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-forest" strokeWidth={2} />
                <a href={`tel:${supportContact.phone.replace(/\s+/g, '')}`} className="text-ink hover:text-brand-text">
                  {supportContact.phone}
                </a>
              </p>
              <p className="mt-1.5 flex min-w-0 items-center gap-2 text-[14px] font-semibold text-ink">
                <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-forest" strokeWidth={2} />
                <a href={`mailto:${supportContact.email}`} className="min-w-0 text-ink [overflow-wrap:anywhere] hover:text-brand-text">
                  {supportContact.email}
                </a>
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href="/" className="btn btn-lg btn-outline">
              Back to home
            </Link>
            <SignOutButton>
              <button type="button" className="btn btn-lg btn-ink w-full">
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </section>
    </main>
  )
}
