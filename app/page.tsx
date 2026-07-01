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
    <main className="min-h-screen overflow-x-hidden bg-[#071a0f] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#071a0f]/94 text-white shadow-[0_18px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:min-h-20 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/95 shadow-sm ring-1 ring-white/15 sm:h-14 sm:w-14">
              <Image src="/estatecore-mark.png" alt="Estate Core UG" width={112} height={112} className="h-full w-full object-contain" priority />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-black leading-none text-white min-[360px]:text-lg sm:text-2xl">Estate Core UG</span>
              <span className="mt-1 hidden truncate text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300 min-[380px]:block sm:mt-1.5 sm:text-sm sm:tracking-[0.18em]">Property Management</span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {userId ? (
              <Link href="/dashboard" className="inline-flex max-w-full items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-black text-white sm:gap-2 sm:px-5 sm:py-3 sm:text-base" style={{ backgroundColor: '#00A550' }}>
                <span className="hidden min-[380px]:inline">Dashboard</span>
                <span className="min-[380px]:hidden">Dash</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="hidden rounded-lg px-4 py-3 text-base font-black text-slate-100 hover:bg-white/10 sm:inline-flex">
                  Sign in
                </Link>
                <Link href="/sign-up" className="inline-flex max-w-full items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-black text-white sm:gap-2 sm:px-5 sm:py-3 sm:text-base" style={{ backgroundColor: '#00A550' }}>
                  <span className="hidden min-[380px]:inline">Get started</span>
                  <span className="min-[380px]:hidden">Start</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
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
          className="absolute inset-0 -z-30 object-cover object-[58%_center] sm:object-center"
        />
        <div className="absolute inset-0 -z-20 bg-[#071a0f]/50 sm:bg-[#071a0f]/35" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(7,26,15,0.96)_0%,rgba(7,26,15,0.74)_48%,rgba(7,26,15,0.58)_100%)] sm:bg-[linear-gradient(90deg,rgba(7,26,15,0.9)_0%,rgba(7,26,15,0.62)_38%,rgba(7,26,15,0.18)_68%,rgba(7,26,15,0.36)_100%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-full bg-[linear-gradient(180deg,rgba(0,165,80,0.22)_0%,rgba(0,165,80,0.12)_42%,rgba(0,165,80,0)_100%)] blur-2xl" />

        <section>
          <div className="relative mx-auto flex min-h-[calc(100svh-7rem)] max-w-7xl items-center px-4 py-8 sm:min-h-[calc(100svh-8rem)] sm:px-6 sm:py-14 lg:px-8">
            <div className="max-w-4xl">
              <p className="max-w-[24rem] text-[10px] font-black uppercase leading-4 tracking-[0.18em] sm:text-xs sm:tracking-[0.22em]" style={{ color: '#74e3a2' }}>
                Estate Core UG Property Management Solutions
              </p>
              <h1 className="mt-3 max-w-4xl text-[clamp(2.15rem,11vw,3.5rem)] font-black leading-[1.02] sm:mt-4 sm:text-[clamp(3.4rem,6vw,5.75rem)] sm:leading-[0.96]">
                Crafting Rental Operations That Matter
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 sm:mt-5 sm:text-lg sm:leading-7 lg:text-xl lg:leading-8">
                Manage units, tenants, rent coverage, receipts, expenses, calendar reminders, and approval controls without spreadsheets or guesswork.
              </p>

              <div className="mt-6 grid w-full gap-3 min-[420px]:max-w-md min-[420px]:grid-cols-2 sm:mt-7 sm:flex sm:max-w-none sm:flex-row">
                <Link href={primaryHref} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-xl sm:w-auto sm:gap-3 sm:px-8 sm:py-3.5 sm:text-base">
                  {userId ? 'View Dashboard' : 'Start Managing'}
                  <ArrowRight className="h-5 w-5 shrink-0" />
                </Link>
                <Link href="/sign-in" className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur sm:w-auto sm:px-8 sm:py-3.5 sm:text-base">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="bg-[#f5f7f5] px-4 py-12 text-slate-950 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] sm:text-sm" style={{ color: '#00A550' }}>Operating system</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-5xl">Everything a landlord checks every day.</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-2 xl:grid-cols-4">
            {capabilities.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <Icon className="h-6 w-6" style={{ color: '#00A550' }} />
                  <h3 className="mt-5 text-lg font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 text-slate-950 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 sm:gap-10 lg:grid-cols-[0.8fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] sm:text-sm" style={{ color: '#00A550' }}>Workflow</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-5xl">From approval to receipt without loose ends.</h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              EstateCore UG keeps the business rules visible: approval status, occupied units, rent coverage, due dates, receipts, and cross-account isolation.
            </p>
          </div>
          <div className="grid gap-3">
            {workflow.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: '#00A550' }} />
                <span className="text-sm font-black text-slate-800">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden px-4 py-12 text-white sm:px-6 sm:py-16 lg:px-8">
        <Image
          src="/estatecore-hero-bg.png"
          alt=""
          fill
          sizes="100vw"
          className="absolute inset-0 -z-30 object-cover object-[58%_center] sm:object-center"
        />
        <div className="absolute inset-0 -z-20 bg-[#071a0f]/68 sm:bg-[#071a0f]/55" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(7,26,15,0.95)_0%,rgba(7,26,15,0.78)_100%)] sm:bg-[linear-gradient(90deg,rgba(7,26,15,0.92)_0%,rgba(7,26,15,0.64)_48%,rgba(7,26,15,0.34)_100%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-full bg-[linear-gradient(180deg,rgba(0,165,80,0.16)_0%,rgba(0,165,80,0.05)_100%)] blur-2xl" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <FileText className="mb-4 h-6 w-6" style={{ color: '#74e3a2' }} />
            <h2 className="text-2xl font-black tracking-tight sm:text-5xl">Ready to run your portfolio properly?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
              Start with approval, add your properties, and keep every rent cycle accountable.
            </p>
          </div>
          <Link href={primaryHref} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-black text-slate-950 sm:w-auto sm:py-4">
            Continue
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#071a0f] px-4 py-7 text-white sm:px-6 lg:px-8">
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
