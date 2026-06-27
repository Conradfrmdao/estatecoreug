import { requireCurrentAppUser } from '@/lib/auth'
import { getDashboardData } from '@/lib/data'
import { currentPaymentMonth } from '@/lib/format'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const user = await requireCurrentAppUser()
  const url = new URL(req.url)
  const month = url.searchParams.get('month') ?? currentPaymentMonth()
  const data = await getDashboardData(user.id, month)

  return NextResponse.json(data.summary)
}
