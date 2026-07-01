import UnitForm from '@/components/UnitForm'
import { requireCurrentAppUser } from '@/lib/auth'
import { getUnitForUser } from '@/lib/data'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditUnitPage({ params }: { params: { id: string } }) {
  const user = await requireCurrentAppUser()
  const row = await getUnitForUser(user.id, Number(params.id))

  if (!row) notFound()

  const { unit } = row

  return (
    <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6 animate-in">
      <div>
        <Link href="/units"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition"
          style={{ color: '#64748b' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to units
        </Link>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl" style={{ color: '#1a1a2e' }}>Edit Unit</h1>
        <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>Update Unit {unit.unitNumber}.</p>
      </div>

      <section className="rounded-xl border bg-white p-4 sm:p-6"
        style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <UnitForm
          initialData={{
            id: unit.id,
            propertyId: unit.propertyId,
            unitNumber: unit.unitNumber,
            rentAmount: unit.rentAmount,
            status: unit.status
          }}
        />
      </section>
    </div>
  )
}
