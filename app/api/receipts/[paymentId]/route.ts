import { requireCurrentAppUser } from '@/lib/auth'
import { getPaymentForUser } from '@/lib/data'
import { ReceiptDocument } from '@/lib/pdf/receipt'
import { renderToBuffer } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import React from 'react'

export const dynamic = 'force-dynamic'

type ReceiptRouteContext = { params: Promise<{ paymentId: string }> }

function safeFilenamePart(value: string) {
  return value
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 48) || 'receipt'
}

export async function GET(_req: Request, { params }: ReceiptRouteContext) {
  try {
    const user = await requireCurrentAppUser()
    const { paymentId: paymentIdParam } = await params
    const paymentId = Number(paymentIdParam)

    if (!paymentId || Number.isNaN(paymentId)) {
      return NextResponse.json({ error: 'Invalid payment ID.' }, { status: 400 })
    }

    const row = await getPaymentForUser(user.id, paymentId)

    if (!row) {
      return NextResponse.json({ error: 'Payment not found or unauthorized.' }, { status: 404 })
    }

    const paymentData = {
      id: row.payment.id,
      amountPaid: row.payment.amountPaid,
      balanceAfterPayment: row.payment.balanceAfterPayment,
      paymentMonth: row.payment.paymentMonth,
      coverageStart: row.payment.coverageStart,
      coverageEnd: row.payment.coverageEnd,
      monthsCovered: row.payment.monthsCovered,
      paymentDate: row.payment.paymentDate,
      paymentMethod: row.payment.paymentMethod,
      notes: row.payment.notes,
      tenantName: row.tenant.fullName,
      unitNumber: row.unit.unitNumber,
      propertyName: row.property.name,
      rentAmount: row.unit.rentAmount
    }

    const element = React.createElement(ReceiptDocument, { payment: paymentData })
    const buffer: Buffer = await renderToBuffer(element as any)
    const filename = [
      'receipt',
      `ec-pay-${paymentId.toString().padStart(5, '0')}`,
      safeFilenamePart(row.property.name),
      `unit-${safeFilenamePart(row.unit.unitNumber)}`
    ].join('-')

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'private, no-store'
      }
    })
  } catch (error: any) {
    console.error('Error rendering PDF receipt:', error)
    return NextResponse.json({ error: error.message || 'Failed to render PDF.' }, { status: 500 })
  }
}
