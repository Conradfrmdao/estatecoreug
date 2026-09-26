import { LogoFull, LogoMark } from '@/components/brand/Logo'
import FeatureDeck, { type DeckFeature } from '@/components/landing/FeatureDeck'
import arrearsImage from '@/assets/landing/card-arrears.jpg'
import calendarImage from '@/assets/landing/card-calendar.jpg'
import maintenanceImage from '@/assets/landing/card-maintenance.jpg'
import paymentsImage from '@/assets/landing/card-payments.jpg'
import receiptsImage from '@/assets/landing/card-receipts.jpg'
import unitsImage from '@/assets/landing/card-units.jpg'
import heroImage from '@/assets/landing/hero-apartments.jpg'
import { auth } from '@clerk/nextjs/server'
import {
  ArrowRight,
  Clock3,
  Headphones,
  LockKeyhole,
  Mail,
  Phone,
  Smartphone,
  type LucideIcon
} from 'lucide-react'
import type { Viewport } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const viewport: Viewport = { themeColor: '#F5F7F4' }

const features: DeckFeature[] = [
  {
    title: 'Properties and units',
    body: 'Every property, its units and their monthly rent. Occupied and vacant units are counted for you.',
    image: unitsImage,
    alt: 'An apartment block with balconies in the afternoon sun'
  },
  {
    title: 'Payments that add up',
    body: 'Record one month or twelve in a single payment. It pays the oldest unpaid month first, and anything extra carries forward.',
    image: paymentsImage,
    alt: 'A carpenter in his workshop, smiling at his phone'
  },
  {
    title: 'Arrears that stay visible',
    body: 'Unpaid rent stays with the tenant from month to month until it is cleared, so a new month never hides an old balance.',
    image: arrearsImage,
    alt: 'The Who owes rent list in EstateCore UG, with one tenant two months overdue and the unpaid month carried forward',
    shade: false
  },
  {
    title: 'A receipt for every payment',
    body: 'Download a PDF receipt as soon as rent is recorded, ready to send to the tenant.',
    image: receiptsImage,
    alt: 'A rent receipt made by EstateCore UG, showing the unit, the tenant and the amount paid',
    shade: false
  },
  {
    title: 'A rent calendar',
    body: 'Due dates, overdue rent, payments and expenses on one calendar, day by day.',
    image: calendarImage,
    alt: 'A monthly planner open beside a cup of coffee'
  },
  {
    title: 'Expenses and reports',
    body: 'Log repairs and bills against a property or unit, then download rent, arrears, cash-flow and property reports as PDFs.',
    image: maintenanceImage,
    alt: 'A technician in a hard hat at work'
  }
]

const steps: { title: string; body: string }[] = [
  { title: 'Create your account', body: 'Sign up with your email address.' },
  { title: 'Get approved', body: 'The EstateCore UG team reviews every new account before it opens.' },
  { title: 'Add your properties', body: 'Enter each property, then its units and their monthly rent.' },
  { title: 'Move tenants in', body: 'Assign tenants to units and record rent as it arrives. Balances, receipts and reports follow.' }
]

const assurances: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: LockKeyhole, title: 'Private to your account', body: 'Each landlord sees only their own properties, tenants and money.' },
  { icon: Clock3, title: 'UGX and Kampala time', body: 'Every amount in shillings, every date on East Africa Time.' },
  { icon: Smartphone, title: 'On your phone', body: 'Built for the phone in your pocket, and it can sit on your home screen.' },
  { icon: Headphones, title: 'Help inside the app', body: 'Message the EstateCore UG team from any screen.' }
]

export default async function Home() {
  const { userId } = await auth()
  const signedIn = Boolean(userId)
  const year = new Date().getFullYear()

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="sticky top-0 z-40 bg-canvas/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label="EstateCore UG home" className="flex min-w-0 items-center gap-3">
            <LogoMark tone="forest" size={40} />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[16px] font-extrabold tracking-[-0.01em] text-ink">EstateCore UG</span>
              <span className="hidden truncate text-[11.5px] font-semibold text-muted min-[400px]:block">Property management</span>
            </span>
          </Link>
          <nav aria-label="Site" className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <a href="#features" className="btn btn-sm hidden font-semibold text-muted hover:bg-white hover:text-ink md:inline-flex">
              Features
            </a>
            <a href="#how-it-works" className="btn btn-sm hidden font-semibold text-muted hover:bg-white hover:text-ink md:inline-flex">
              How it works
            </a>
            {signedIn ? (
              <Link href="/dashboard" className="btn btn-ink max-sm:btn-sm">
                Open dashboard
                <ArrowRight aria-hidden="true" className="hidden h-4 w-4 sm:block" strokeWidth={2.2} />
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="btn btn-outline hidden sm:inline-flex">
                  Sign in
                </Link>
                <Link href="/sign-up" className="btn btn-ink max-sm:btn-sm">
                  Create account
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden bg-gradient-to-b from-canvas from-60% to-white">
          {/* A photograph of the kind of building our landlords own, fading into the page. */}
          <div
            aria-hidden="true"
            className="hero-photo pointer-events-none absolute inset-x-0 top-0 -z-10 h-[320px] sm:h-[420px] lg:inset-y-0 lg:left-[calc(50%-60px)] lg:h-auto"
          >
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              placeholder="blur"
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="photo-enter object-cover object-[62%_30%] lg:object-[58%_center]"
            />
          </div>

          <div className="mx-auto max-w-6xl px-4 pb-16 pt-[250px] sm:px-6 sm:pt-[340px] lg:flex lg:min-h-[640px] lg:items-center lg:pb-20 lg:pt-12 xl:min-h-[680px]">
            <div className="page-enter max-w-xl lg:max-w-[500px] xl:max-w-[560px]">
              <p className="eyebrow">Property management for Ugandan landlords</p>
              <h1 className="mt-3 text-[clamp(2.25rem,5.4vw,3.8rem)] font-extrabold leading-[1.04] tracking-[-0.035em] text-ink">
                Know who has paid, who owes, and how much.
              </h1>
              <p className="mt-5 text-[16.5px] font-medium leading-7 text-ink-soft sm:text-[17.5px] sm:leading-8">
                EstateCore UG keeps your properties, units and tenants in one place. Record rent as it comes in and
                every shilling lands on the right month, with receipts and reports ready when you need them.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {signedIn ? (
                  <Link href="/dashboard" className="btn btn-lg btn-ink px-7">
                    Open your dashboard
                    <ArrowRight aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
                  </Link>
                ) : (
                  <>
                    <Link href="/sign-up" className="btn btn-lg btn-ink px-7">
                      Create an account
                      <ArrowRight aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
                    </Link>
                    <Link href="/sign-in" className="btn btn-lg btn-outline px-7">
                      Sign in
                    </Link>
                  </>
                )}
              </div>
              {!signedIn && (
                <p className="mt-4 text-[13px] font-medium text-muted">
                  New accounts are approved by the EstateCore UG team before they open.
                </p>
              )}
            </div>
          </div>
        </section>

        <section id="features" aria-labelledby="features-title" className="scroll-mt-20 overflow-x-clip bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <FeatureDeck
              features={features}
              eyebrow="What it keeps track of"
              title="Your rent book, with the arithmetic done."
              titleId="features-title"
            />
          </div>
        </section>

        <section id="how-it-works" aria-labelledby="steps-title" className="scroll-mt-20 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <p className="eyebrow">How it works</p>
              <h2 id="steps-title" className="mt-2 text-[30px] font-extrabold leading-9 tracking-[-0.025em] text-ink sm:text-[36px] sm:leading-[44px]">
                From sign-up to your first receipt.
              </h2>
            </div>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map(({ title, body }, index) => (
                <li key={title} className="flex flex-col gap-4 rounded-card bg-white p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-hi text-[15px] font-extrabold text-ink">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-[17px] font-extrabold leading-6 text-ink">{title}</h3>
                    <p className="mt-1.5 text-[14.5px] font-medium leading-6 text-ink-soft">{body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <ul className="mt-6 grid gap-4 rounded-card bg-forest p-6 text-white sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
              {assurances.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-hi">
                    <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <span>
                    <span className="block text-[15px] font-extrabold leading-5">{title}</span>
                    <span className="mt-1 block text-[13.5px] font-medium leading-5 text-forest-muted">{body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="start-title" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
          <div className="app-backdrop flex flex-col items-start gap-6 rounded-[32px] p-8 text-white shadow-[0_34px_80px_-34px_rgba(4,30,18,0.65)] sm:rounded-[40px] sm:p-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 id="start-title" className="text-[30px] font-extrabold leading-9 tracking-[-0.025em] sm:text-[36px] sm:leading-[44px]">
                Bring your rent book into one place.
              </h2>
              <p className="mt-3 text-[16px] font-medium leading-7 text-white/80">
                Set up your properties once. After that, recording rent takes a few taps.
              </p>
            </div>
            <Link href={signedIn ? '/dashboard' : '/sign-up'} className="btn btn-lg btn-white shrink-0 px-7">
              {signedIn ? 'Open your dashboard' : 'Create an account'}
              <ArrowRight aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <LogoFull tone="forest" width={200} />
          <div className="flex flex-col gap-3 text-[14px] font-semibold text-ink-soft sm:flex-row sm:items-center sm:gap-6">
            <a href="tel:+256751929535" className="inline-flex items-center gap-2 hover:text-brand-text">
              <Phone aria-hidden="true" className="h-4 w-4 text-brand-text" strokeWidth={2} />
              +256 751 929 535
            </a>
            <a href="mailto:godlovesconrad@gmail.com" className="inline-flex items-center gap-2 hover:text-brand-text">
              <Mail aria-hidden="true" className="h-4 w-4 text-brand-text" strokeWidth={2} />
              godlovesconrad@gmail.com
            </a>
          </div>
        </div>
        <div className="border-t border-line">
          <p className="mx-auto max-w-6xl px-4 py-5 text-[12.5px] font-medium text-muted sm:px-6">
            &copy; {year} EstateCore UG Property Management Solutions
          </p>
        </div>
      </footer>
    </div>
  )
}
