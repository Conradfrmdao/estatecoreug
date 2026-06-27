import Link from 'next/link'
import Image from 'next/image'
import { SignedIn, SignedOut } from '@clerk/nextjs'

const features = [
  {
    icon: '🏠',
    title: 'Track Rent in UGX',
    desc: 'Record payments in Uganda Shillings. See who paid, who owes, and total balances at a glance.',
  },
  {
    icon: '👥',
    title: 'Manage Tenants',
    desc: 'Store tenant details, move-in dates, and rent due dates. Know your tenants without notebooks.',
  },
  {
    icon: '📊',
    title: 'Financial Reports',
    desc: 'Generate monthly reports, income vs expense summaries, and unpaid tenant lists as PDFs.',
  },
  {
    icon: '🏢',
    title: 'Multiple Properties',
    desc: 'Manage all your properties and units from one dashboard. Each unit tracked separately.',
  },
  {
    icon: '🔧',
    title: 'Expense Tracking',
    desc: 'Log renovations, repairs, plumbing, and maintenance costs. See your true net profit.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    desc: 'Your data is yours only. Multi-tenant architecture means no data ever leaks between accounts.',
  },
]

const steps = [
  { num: '01', title: 'Sign up free', desc: 'Create your account in under a minute. No credit card required.' },
  { num: '02', title: 'Add your properties', desc: 'Add buildings and units. Set rent amounts for each unit.' },
  { num: '03', title: 'Start tracking rent', desc: 'Record payments in UGX, track balances, and generate reports.' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-green-900/40" style={{ backgroundColor: '#0a1a0f' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/estatecoreuglogo.png"
              alt="EstateCore UG"
              width={1536}
              height={1024}
              className="h-9 w-auto object-contain"
            />
          </Link>

          {/* Nav actions */}
          <div className="flex items-center gap-3">
            <SignedOut>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-150 px-3 py-1.5"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="text-sm font-bold px-5 py-2 rounded-full transition-all duration-200 bg-white hover:bg-green-50"
                style={{ color: '#166534' }}
              >
                Get started →
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="text-sm font-bold px-5 py-2 rounded-full transition-all duration-200 bg-white hover:bg-green-50"
                style={{ color: '#166534' }}
              >
                Dashboard →
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex flex-col justify-center items-center px-6 text-center overflow-hidden"
        style={{ backgroundColor: '#0a1a0f' }}
      >
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: 'radial-gradient(ellipse at center, #166534 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Eyebrow badge */}
          <span className="inline-flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full border"
            style={{ backgroundColor: 'rgba(22,101,52,0.3)', borderColor: 'rgba(22,163,74,0.4)', color: '#4ade80' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Built for Ugandan Landlords
          </span>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mt-6 leading-none">
            The property management<br />
            <span style={{ color: '#4ade80' }}>tool built for Uganda.</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl mt-6 leading-relaxed max-w-2xl mx-auto" style={{ color: '#d1d5db' }}>
            Track rent in UGX, manage tenants, log expenses, and get clear
            financial reports — all from one clean dashboard. No spreadsheets.
          </p>

          {/* Primary CTA */}
          <div className="mt-10">
            <Link href="/sign-up">
              <button className="bg-white font-bold text-lg px-10 py-4 rounded-full transition-all duration-200 shadow-lg hover:bg-green-50"
                style={{ color: '#166534', boxShadow: '0 8px 32px rgba(22,101,52,0.4)' }}>
                Start for free →
              </button>
            </Link>
            <p className="mt-4 text-sm" style={{ color: '#9ca3af' }}>
              Already have an account?{' '}
              <Link href="/sign-in" className="hover:underline" style={{ color: '#4ade80' }}>
                Sign in
              </Link>
            </p>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center justify-center gap-6 md:gap-8 flex-wrap text-sm" style={{ color: '#9ca3af' }}>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">500+</span>
              <span>units tracked</span>
            </div>
            <div className="hidden sm:block w-px h-6" style={{ backgroundColor: '#374151' }} />
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">UGX</span>
              <span>native currency</span>
            </div>
            <div className="hidden sm:block w-px h-6" style={{ backgroundColor: '#374151' }} />
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg" style={{ color: '#4ade80' }}>✓</span>
              <span>No spreadsheets</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything a Ugandan landlord needs
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto text-base md:text-lg">
              Built specifically for the way property management works in Uganda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-6" style={{ backgroundColor: '#0a1a0f' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Up and running in minutes
            </h2>
            <p className="mt-3 text-base md:text-lg" style={{ color: '#9ca3af' }}>
              No training required. No complicated setup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, i) => (
              <div key={step.num} className="text-center md:text-left relative">
                {/* Connector arrow between steps */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-12 text-center" style={{ color: '#166534' }}>
                    →
                  </div>
                )}
                <div className="text-4xl font-extrabold mb-4" style={{ color: '#22c55e', opacity: 0.4 }}>
                  {step.num}
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-6 text-center bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Ready to stop using notebooks?
          </h2>
          <p className="text-gray-500 mt-4 text-lg">
            Join landlords across Uganda managing rent the smart way.
          </p>
          <Link href="/sign-up">
            <button
              className="mt-8 text-white font-bold text-lg px-10 py-4 rounded-full transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: '#16a34a' }}
            >
              Get started for free →
            </button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t" style={{ backgroundColor: '#0a1a0f', borderColor: '#1f2d1f' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Image
            src="/estatecoreuglogo.png"
            alt="EstateCore UG"
            width={1536}
            height={1024}
            className="h-7 w-auto object-contain"
          />
          <p className="text-sm" style={{ color: '#6b7280' }}>
            © {new Date().getFullYear()} EstateCore UG. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
