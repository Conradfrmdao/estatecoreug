import { requireCurrentAppUser } from '@/lib/auth'
import { getPaymentForUser } from '@/lib/data'
import { ReceiptDocument } from '@/lib/pdf/receipt'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { renderToStream } = require('@react-pdf/renderer')
import { NextResponse } from 'next/server'
import React from 'react'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { paymentId: string } }) {
  try {
    const user = await requireCurrentAppUser()
    const paymentId = Number(params.paymentId)

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
      paymentDate: row.payment.paymentDate,
      paymentMethod: row.payment.paymentMethod,
      notes: row.payment.notes,
      tenantName: row.tenant.fullName,
      unitNumber: row.unit.unitNumber,
      propertyName: row.property.name,
      rentAmount: row.unit.rentAmount
    }

    const element = React.createElement(ReceiptDocument, { payment: paymentData })
    const stream = await renderToStream(element as any)

    const responseStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Buffer) => controller.enqueue(chunk))
        stream.on('end', () => controller.close())
        stream.on('error', (err: Error) => controller.error(err))
      }
    })

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt_${paymentId}.pdf"`
      }
    })
  } catch (error: any) {
    console.error('Error rendering PDF receipt:', error)
    return NextResponse.json({ error: error.message || 'Failed to render PDF.' }, { status: 500 })
  }
}
