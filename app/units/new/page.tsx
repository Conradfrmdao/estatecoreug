import UnitForm from '@/components/UnitForm'
import Link from 'next/link'

export default function NewUnitPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-in">
      <div>
        <Link href="/units"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition"
          style={{ color: '#64748b' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to units
        </Link>
        <h1 className="mt-3 text-3xl font-bold" style={{ color: '#1a1a2e' }}>New Unit</h1>
        <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>Add a new rental unit to a property.</p>
      </div>

      <section className="rounded-xl border bg-white p-6"
        style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <UnitForm />
      </section>
    </div>
  )
}
