import { requireCurrentAppUser } from '@/lib/auth'
import { getDashboardData } from '@/lib/data'
import { currentPaymentMonth, dateKey, monthLabel } from '@/lib/format'
import { ReportDocument } from '@/lib/pdf/reports'
import { renderToBuffer } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import React from 'react'

export const dynamic = 'force-dynamic'

type ReportRouteContext = { params: Promise<{ type: string }> }

function safeFilenamePart(value: string) {
  return value
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 64) || 'report'
}

export async function GET(req: Request, { params }: ReportRouteContext) {
  try {
    const user = await requireCurrentAppUser()
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') ?? currentPaymentMonth()
    const { type } = await params

    const dashboardData = await getDashboardData(user.id, month)

    let reportProps: any = null

    if (type === 'monthly-rent') {
      const payments = dashboardData.monthlyPayments
        .map(({ payment, tenant, unit, property, allocatedAmount, coverageDate }) => ({
          id: payment.id,
          tenantName: tenant.fullName,
          propertyName: property.name,
          unitNumber: unit.unitNumber,
          amountPaid: allocatedAmount,
          paymentDate: coverageDate,
          paymentMethod: payment.paymentMethod
        }))

      reportProps = {
        type: 'monthly-rent',
        title: `Monthly Rent Report - ${monthLabel(month)}`,
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
        title: `Unpaid Tenants Report - ${monthLabel(month)}`,
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
        const expMonth = dateKey(expense.expenseDate).slice(0, 7)
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
        .filter(({ expense }) => dateKey(expense.expenseDate).slice(0, 7) === month)
        .map(({ expense, property }) => ({
          title: expense.title,
          category: expense.category,
          amount: expense.amount,
          expenseDate: expense.expenseDate,
          propertyName: property.name
        }))

      reportProps = {
        type: 'income-expense',
        title: `Income vs Expense Report - ${monthLabel(month)}`,
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
    const buffer: Buffer = await renderToBuffer(element as any)
    const filename = safeFilenamePart(`estatecore-${type}-${month}`)

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'private, no-store'
      }
    })
  } catch (error: any) {
    console.error('Error rendering PDF report:', error)
    return NextResponse.json({ error: error.message || 'Failed to render PDF.' }, { status: 500 })
  }
}
