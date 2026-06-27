import { requireCurrentAppUser } from '@/lib/auth'
import { getDashboardData } from '@/lib/data'
import { currentPaymentMonth, monthLabel } from '@/lib/format'
import { ReportDocument } from '@/lib/pdf/reports'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { renderToStream } = require('@react-pdf/renderer')
import { NextResponse } from 'next/server'
import React from 'react'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: { type: string } }) {
  try {
    const user = await requireCurrentAppUser()
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') ?? currentPaymentMonth()
    const type = params.type

    const dashboardData = await getDashboardData(user.id, month)

    let reportProps: any = null

    if (type === 'monthly-rent') {
      const payments = dashboardData.payments
        .filter(({ payment }) => payment.paymentMonth === month)
        .map(({ payment, tenant, unit, property }) => ({
          id: payment.id,
          tenantName: tenant.fullName,
          propertyName: property.name,
          unitNumber: unit.unitNumber,
          amountPaid: payment.amountPaid,
          paymentDate: payment.paymentDate,
          paymentMethod: payment.paymentMethod
        }))

      reportProps = {
        type: 'monthly-rent',
        title: `Monthly Rent Report — ${monthLabel(month)}`,
        month: monthLabel(month),
        data: {
          payments,
          summary: {
            totalExpected: dashboardData.summary.totalExpected,
            totalCollected: dashboardData.summary.collectedThisMonth,
            totalOutstanding: dashboardData.summary.totalOutstanding
          }
        }
      }
    } else if (type === 'unpaid-tenants') {
      const unpaid = dashboardData.tenantBalances
        .filter((tb) => tb.balance > 0)
        .map((tb) => ({
          tenantName: tb.tenant.fullName,
          propertyName: tb.property.name,
          unitNumber: tb.unit.unitNumber,
          rentAmount: tb.unit.rentAmount,
          balance: tb.balance,
          phone: tb.tenant.phone
        }))

      reportProps = {
        type: 'unpaid-tenants',
        title: `Unpaid Tenants Report — ${monthLabel(month)}`,
        month: monthLabel(month),
        data: {
          unpaid,
          summary: {
            unpaidCount: unpaid.length,
            totalOutstanding: unpaid.reduce((acc, curr) => acc + curr.balance, 0)
          }
        }
      }
    } else if (type === 'income-expense') {
      const expenseByCategory = new Map<string, number>()
      dashboardData.expenses.forEach(({ expense }) => {
        const expMonth = expense.expenseDate.toISOString().slice(0, 7)
        if (expMonth === month) {
          expenseByCategory.set(
            expense.category,
            (expenseByCategory.get(expense.category) ?? 0) + expense.amount
          )
        }
      })

      const categories = Array.from(expenseByCategory.entries()).map(([category, amount]) => ({
        category,
        amount
      })).sort((a, b) => b.amount - a.amount)

      const recentExpenses = dashboardData.expenses
        .filter(({ expense }) => expense.expenseDate.toISOString().slice(0, 7) === month)
        .map(({ expense, property }) => ({
          title: expense.title,
          category: expense.category,
          amount: expense.amount,
          expenseDate: expense.expenseDate,
          propertyName: property.name
        }))

      reportProps = {
        type: 'income-expense',
        title: `Income vs Expense Report — ${monthLabel(month)}`,
        monthRange: monthLabel(month),
        data: {
          income: dashboardData.summary.collectedThisMonth,
          expenses: dashboardData.summary.expensesThisMonth,
          net: dashboardData.summary.netThisMonth,
          categories,
          recentExpenses
        }
      }
    } else if (type === 'property-summary') {
      const propertyData = dashboardData.properties.map((property) => {
        const pUnits = dashboardData.units.filter(({ unit }) => unit.propertyId === property.id)
        const occupiedUnits = pUnits.filter(({ unit }) => unit.status === 'occupied')
        const occupancyRate = pUnits.length > 0
          ? Math.round((occupiedUnits.length / pUnits.length) * 100)
          : 0

        return {
          id: property.id,
          name: property.name,
          location: property.location,
          unitsCount: pUnits.length,
          occupiedCount: occupiedUnits.length,
          occupancyRate
        }
      })

      reportProps = {
        type: 'property-summary',
        title: 'Property Portfolio Performance Summary',
        data: propertyData
      }
    } else {
      return NextResponse.json({ error: 'Invalid report type.' }, { status: 400 })
    }

    const element = React.createElement(ReportDocument, reportProps)
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
        'Content-Disposition': `attachment; filename="report_${type}_${month}.pdf"`
      }
    })
  } catch (error: any) {
    console.error('Error rendering PDF report:', error)
    return NextResponse.json({ error: error.message || 'Failed to render PDF.' }, { status: 500 })
  }
}
