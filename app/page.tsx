import { LogoFull, LogoMark } from '@/components/brand/Logo'
import { auth } from '@clerk/nextjs/server'
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  FileText,
  Headphones,
  History,
  LockKeyhole,
  Mail,
  Phone,
  ReceiptText,
  Smartphone,
  WalletCards,
  type LucideIcon
} from 'lucide-react'
import type { Viewport } from 'next'
import Link from 'next/link'

export const viewport: Viewport = { themeColor: '#F5F7F4' }

const features: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Building2,
    title: 'Properties and units',
    body: 'Every property, its units and their monthly rent. Occupied and vacant units are counted for you.'
  },
  {
    icon: WalletCards,
    title: 'Payments that add up',
    body: 'Record one month or twelve in a single payment. It pays the oldest unpaid month first, and anything extra carries forward.'
  },
  {
    icon: History,
    title: 'Arrears that stay visible',
    body: 'Unpaid rent stays with the tenant from month to month until it is cleared, so a new month never hides an old balance.'
  },
  {
    icon: ReceiptText,
    title: 'A receipt for every payment',
    body: 'Download a PDF receipt as soon as rent is recorded, ready to send to the tenant.'
  },
  {
    icon: CalendarDays,
    title: 'A rent calendar',
    body: 'Due dates, overdue rent, payments and expenses on one calendar, day by day.'
  },
  {
    icon: FileText,
    title: 'Expenses and reports',
    body: 'Log repairs and bills against a property or unit, then download rent, arrears, cash-flow and property reports as PDFs.'
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

/* A still picture of the dashboard, drawn with the dashboard's own cards.
   The figures are examples and say so. */
function ProductPreview() {
  const rows = [
    { unit: 'A1', status: 'Paid', tone: 'bg-paid-bg text-paid-fg', icon: Check, amount: '650,000', note: 'September' },
    { unit: 'A2', status: 'Part paid', tone: 'bg-carried-bg text-carried-fg', icon: Clock3, amount: '200,000', note: 'of 450,000' },
    { unit: 'B1', status: 'Overdue', tone: 'bg-overdue-bg text-overdue-fg', icon: CircleAlert, amount: '900,000', note: '2 months' }
  ]

  return (
    <figure className="page-enter" aria-label="An example of the EstateCore UG dashboard">
      <div className="app-backdrop rounded-[32px] p-3 shadow-[0_34px_80px_-34px_rgba(4,30,18,0.65)] sm:rounded-[40px] sm:p-5">
        <div className="grid gap-3 rounded-[24px] bg-canvas p-3 sm:grid-cols-[1.2fr_1fr] sm:rounded-[30px] sm:p-4" aria-hidden="true">
          <div className="flex flex-col gap-3 rounded-[22px] bg-white p-4 sm:col-span-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[12.5px] font-bold text-muted">Collected in September</p>
              <p className="mt-1 text-[26px] font-extrabold leading-8 tracking-[-0.02em] text-ink tabular-nums">
                <span className="mr-1 text-[15px] font-bold text-muted">UGX</span>2,200,000
              </p>
            </div>
            <div className="w-full sm:w-[46%]">
              <div className="h-2.5 overflow-hidden rounded-full bg-line">
                <div className="h-full w-[76%] rounded-full bg-brand" />
              </div>
              <p className="mt-1.5 text-[12px] font-semibold text-muted">76% of UGX 2,900,000 expected</p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 rounded-[22px] bg-hi p-4">
            <p className="text-[14px] font-extrabold text-ink">Rent by unit</p>
            {rows.map(({ unit, status, tone, icon: Icon, amount, note }) => (
              <div key={unit} className="flex items-center gap-2.5 rounded-[16px] bg-white/70 px-3 py-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-ink text-[12px] font-extrabold text-white">
                  {unit}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-extrabold ${tone}`}>
                    <Icon className="h-3 w-3 shrink-0" strokeWidth={2.6} />
                    {status}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-[13px] font-extrabold tabular-nums text-ink">{amount}</span>
                  <span className="block text-[11px] font-semibold text-forest-ink">{note}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-1 flex-col justify-between gap-3 rounded-[22px] bg-night p-4 text-white">
              <p className="text-[13px] font-bold text-night-muted">Net in September</p>
              <p className="text-[24px] font-extrabold leading-7 tracking-[-0.02em] tabular-nums">
                <span className="mr-1 text-[14px] font-bold text-night-muted">UGX</span>1,770,000
              </p>
              <p className="text-[12px] font-semibold text-night-muted">Collected minus expenses</p>
            </div>
            <div className="flex items-center gap-3 rounded-[22px] bg-mint p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-forest">
                <Building2 className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <span>
                <span className="block text-[20px] font-extrabold leading-6 tabular-nums text-ink">6 of 9</span>
                <span className="block text-[12px] font-semibold text-forest-ink">units occupied</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-[12px] font-semibold text-muted">Example figures</figcaption>
    </figure>
  )
}

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
        <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[1.02fr_1fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-16">
          <div className="page-enter">
            <p className="eyebrow">Property management for Ugandan landlords</p>
            <h1 className="mt-3 text-[clamp(2.25rem,5.4vw,3.8rem)] font-extrabold leading-[1.04] tracking-[-0.035em] text-ink">
              Know who has paid, who owes, and how much.
            </h1>
            <p className="mt-5 max-w-xl text-[16.5px] font-medium leading-7 text-ink-soft sm:text-[17.5px] sm:leading-8">
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

          <ProductPreview />
        </section>

        <section id="features" aria-labelledby="features-title" className="scroll-mt-20 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <p className="eyebrow">What it keeps track of</p>
              <h2 id="features-title" className="mt-2 text-[30px] font-extrabold leading-9 tracking-[-0.025em] text-ink sm:text-[36px] sm:leading-[44px]">
                Your rent book, with the arithmetic done.
              </h2>
            </div>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex flex-col gap-4 rounded-card bg-canvas p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint text-forest">
                    <Icon aria-hidden="true" className="h-6 w-6" strokeWidth={1.9} />
                  </span>
                  <div>
                    <h3 className="text-[17px] font-extrabold leading-6 text-ink">{title}</h3>
                    <p className="mt-1.5 text-[14.5px] font-medium leading-6 text-ink-soft">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
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
