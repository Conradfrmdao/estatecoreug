import { auth } from '@clerk/nextjs/server'
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  LockKeyhole,
  WalletCards
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const capabilities = [
  {
    icon: Building2,
    title: 'Portfolio control',
    desc: 'Properties, units, rent amounts, occupancy, and tenant assignments stay organized in one workspace.'
  },
  {
    icon: WalletCards,
    title: 'Coverage-aware rent',
    desc: 'Record one, three, six, twelve, or custom months and keep due dates honest.'
  },
  {
    icon: CalendarDays,
    title: 'Rent calendar',
    desc: 'See move-ins, due dates, overdue rent, payments, expenses, and daily events.'
  },
  {
    icon: LockKeyhole,
    title: 'Private by account',
    desc: 'Every landlord sees only their own properties, tenants, receipts, and reports.'
  }
]

const workflow = [
  'Admin approves the landlord account',
  'Add properties and vacant units',
  'Move tenants in with rent coverage',
  'Track alerts, receipts, and reports'
]

export default async function Home() {
  const { userId } = await auth()
  const primaryHref = userId ? '/dashboard' : '/sign-up'

  return (
    <main className="min-h-screen bg-[#071a0f] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 text-white shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
        <div className="absolute inset-0 -z-10 bg-[#071a0f]/94 backdrop-blur-xl" />

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/95 shadow-sm ring-1 ring-white/15">
              <Image src="/estatecore-mark.png" alt="EstateCore UG" width={112} height={112} className="h-14 w-14 object-cover" priority />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xl font-black leading-none tracking-tight text-white sm:text-2xl">EstateCore UG</span>
              <span className="mt-1.5 block truncate text-xs font-bold uppercase tracking-[0.18em] text-slate-300 sm:text-sm">Property Management</span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-3">
            {userId ? (
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-base font-black text-white" style={{ backgroundColor: '#00A550' }}>
                Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="hidden rounded-xl px-4 py-3 text-base font-black text-slate-100 hover:bg-white/10 sm:inline-flex">
                  Sign in
                </Link>
                <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-base font-black text-white" style={{ backgroundColor: '#00A550' }}>
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="relative isolate">
        <Image
          src="/estatecore-hero-bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-30 object-cover"
        />
        <div className="absolute inset-0 -z-20 bg-[#071a0f]/35" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(7,26,15,0.9)_0%,rgba(7,26,15,0.62)_38%,rgba(7,26,15,0.18)_68%,rgba(7,26,15,0.36)_100%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-full bg-[linear-gradient(180deg,rgba(0,165,80,0.22)_0%,rgba(0,165,80,0.12)_42%,rgba(0,165,80,0)_100%)] blur-2xl" />

        <section>
          <div className="relative mx-auto flex min-h-[calc(100svh-5rem)] max-w-7xl items-center px-5 py-10 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] sm:text-xs" style={{ color: '#74e3a2' }}>
                Estate Core UG Property Management Solutions
              </p>
              <h1 className="mt-4 max-w-4xl text-[clamp(2.75rem,6vw,5.75rem)] font-black leading-[0.96] tracking-tight">
                Crafting Rental Operations That Matter
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg lg:text-xl lg:leading-8">
                Manage units, tenants, rent coverage, receipts, expenses, calendar reminders, and approval controls without spreadsheets or guesswork.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href={primaryHref} className="inline-flex items-center justify-center gap-3 rounded-full bg-white px-7 py-3.5 text-base font-black text-slate-950 shadow-xl sm:px-8">
                  {userId ? 'View Dashboard' : 'Start Managing'}
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/sign-in" className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-base font-black text-white backdrop-blur sm:px-8">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="bg-[#f5f7f5] px-5 py-14 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.18em]" style={{ color: '#00A550' }}>Operating system</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Everything a landlord checks every day.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {capabilities.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <Icon className="h-6 w-6" style={{ color: '#00A550' }} />
                  <h3 className="mt-5 text-lg font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-14 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em]" style={{ color: '#00A550' }}>Workflow</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">From approval to receipt without loose ends.</h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              EstateCore UG keeps the business rules visible: approval status, occupied units, rent coverage, due dates, receipts, and cross-account isolation.
            </p>
          </div>
          <div className="grid gap-3">
            {workflow.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: '#00A550' }} />
                <span className="text-sm font-black text-slate-800">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden px-5 py-16 text-white sm:px-6 lg:px-8">
        <Image
          src="/estatecore-hero-bg.png"
          alt=""
          fill
          sizes="100vw"
          className="absolute inset-0 -z-30 object-cover"
        />
        <div className="absolute inset-0 -z-20 bg-[#071a0f]/55" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(7,26,15,0.92)_0%,rgba(7,26,15,0.64)_48%,rgba(7,26,15,0.34)_100%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-full bg-[linear-gradient(180deg,rgba(0,165,80,0.16)_0%,rgba(0,165,80,0.05)_100%)] blur-2xl" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <FileText className="mb-4 h-6 w-6" style={{ color: '#74e3a2' }} />
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">Ready to run your portfolio properly?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
              Start with approval, add your properties, and keep every rent cycle accountable.
            </p>
          </div>
          <Link href={primaryHref} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-black text-slate-950">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#071a0f] px-5 py-7 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-white">EstateCore UG Property Management Solutions</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            <a href="tel:+256751929535" className="hover:text-white">Contact: +256 751929535</a>
            <a href="mailto:godlovesconrad@gmail.com" className="hover:text-white">Email: godlovesconrad@gmail.com</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
