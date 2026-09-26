import { requireCurrentAppUser } from '@/lib/auth'
import { getRentTrackerData } from '@/lib/data'
import { currentPaymentMonth } from '@/lib/format'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/** One month's rent for every property the landlord owns, for the rent tracker. */
export async function GET(req: Request) {
  const user = await requireCurrentAppUser()
  const requested = new URL(req.url).searchParams.get('month') ?? ''
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(requested) ? requested : currentPaymentMonth()

  try {
    const report = await getRentTrackerData(user.id, month)
    return NextResponse.json(report, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    console.error('Error building the rent tracker:', error)
    return NextResponse.json({ error: 'The rent tracker could not be loaded.' }, { status: 500 })
  }
}
