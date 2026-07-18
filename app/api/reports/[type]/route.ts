import { requireCurrentAppUser } from '@/lib/auth'
import { getDashboardData, getPropertySummaryData, listPaymentsForUser, listPropertiesForUser } from '@/lib/data'
import { currentPaymentMonth, dateKey, formatDate, monthLabel } from '@/lib/format'
import { normalizePaymentFilters, paymentMatchesSearch, paymentReceivedInPeriod } from '@/lib/payment-filters'
import { ReportDocument } from '@/lib/pdf/reports'
import { scopeReportRows } from '@/lib/report-scope'
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
    const propertyIdParam = searchParams.get('propertyId')
    const requestedPropertyId = propertyIdParam === null ? null : Number(propertyIdParam)

    if (propertyIdParam !== null && (!Number.isInteger(requestedPropertyId) || Number(requestedPropertyId) < 1)) {
      return NextResponse.json({ error: 'A valid property id is required.' }, { status: 400 })
    }

    const scopedProperty = requestedPropertyId
      ? (await listPropertiesForUser(user.id)).find((property) => property.id === requestedPropertyId) ?? null
      : null

    if (requestedPropertyId && !scopedProperty) {
      return NextResponse.json({ error: 'Property not found.' }, { status: 404 })
    }

    const scopeName = scopedProperty?.name ?? 'All Properties'
    let dashboardData: Awaited<ReturnType<typeof getDashboardData>> | null = null
    let reportProps: any = null
    const loadDashboardData = async () => {
      dashboardData ??= await getDashboardData(user.id, month)
      return dashboardData
    }

    if (type === 'monthly-rent') {
      const dashboardData = await loadDashboardData()
      const monthlyPayments = scopeReportRows(
        dashboardData.monthlyPayments,
        requestedPropertyId,
        ({ unit }) => unit.propertyId
      )
      const tenantBalances = scopeReportRows(
        dashboardData.tenantBalances,
        requestedPropertyId,
        ({ unit }) => unit.propertyId
      )
      const outstandingTenants = scopeReportRows(
        dashboardData.outstandingTenants,
        requestedPropertyId,
        ({ unit }) => unit.propertyId
      )
      const payments = monthlyPayments
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
        title: `${scopeName} Monthly Rent Report - ${monthLabel(month)}`,
        month: monthLabel(month),
        data: {
          payments,
          summary: {
            totalExpected: tenantBalances.reduce((total, row) => total + row.unit.rentAmount, 0),
            totalCollected: monthlyPayments.reduce((total, row) => total + row.allocatedAmount, 0),
            totalOutstanding: outstandingTenants.reduce((total, row) => total + row.balance, 0)
          }
        }
      }
    } else if (type === 'payment-history') {
      const paymentRows = await listPaymentsForUser(user.id)

      const filters = normalizePaymentFilters({
        period: searchParams.get('period'),
        date: searchParams.get('date'),
        month: searchParams.get('month'),
        year: searchParams.get('year')
      })
      const query = (searchParams.get('q') ?? '').trim().toLowerCase()
      const payments = paymentRows
        .filter((row) => !scopedProperty || row.property.id === scopedProperty.id)
        .filter(({ payment }) => paymentReceivedInPeriod(payment.paymentDate, filters.period, {
          day: filters.day,
          month: filters.month,
          year: filters.year
        }))
        .filter((row) => paymentMatchesSearch(row, query))
        .map(({ payment, tenant, unit, property: rowProperty }) => ({
          id: payment.id,
          tenantName: tenant.fullName,
          propertyName: rowProperty.name,
          unitNumber: unit.unitNumber,
          amountPaid: payment.amountPaid,
          paymentDate: payment.paymentDate,
          paymentMethod: payment.paymentMethod
        }))
      const periodLabel = filters.period === 'day'
        ? formatDate(`${filters.day}T00:00:00.000Z`)
        : filters.period === 'month'
          ? monthLabel(filters.month)
          : filters.period === 'year'
            ? filters.year
            : 'All recorded dates'
      const filterDescription = query ? `${periodLabel}; search: ${query}` : periodLabel

      reportProps = {
        type: 'payment-history',
        title: `${scopeName} Payment History`,
        periodLabel: filterDescription,
        data: {
          payments,
          summary: {
            paymentCount: payments.length,
            totalCollected: payments.reduce((total, payment) => total + payment.amountPaid, 0)
          }
        }
      }
    } else if (type === 'unpaid-tenants') {
      const dashboardData = await loadDashboardData()
      const unpaid = scopeReportRows(
        dashboardData.outstandingTenants,
        requestedPropertyId,
        ({ unit }) => unit.propertyId
      )
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
        title: `${scopeName} Unpaid Tenants Report - ${monthLabel(month)}`,
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
      const dashboardData = await loadDashboardData()
      const scopedExpenses = scopeReportRows(
        dashboardData.expenses,
        requestedPropertyId,
        ({ expense }) => expense.propertyId
      )
      const scopedIncome = scopeReportRows(
        dashboardData.monthlyPayments,
        requestedPropertyId,
        ({ unit }) => unit.propertyId
      ).reduce((total, row) => total + row.allocatedAmount, 0)
      const monthlyExpenses = scopedExpenses.filter(
        ({ expense }) => dateKey(expense.expenseDate).slice(0, 7) === month
      )
      const expenseTotal = monthlyExpenses.reduce((total, row) => total + row.expense.amount, 0)
      const expenseByCategory = new Map<string, number>()
      monthlyExpenses.forEach(({ expense }) => {
        expenseByCategory.set(
          expense.category,
          (expenseByCategory.get(expense.category) ?? 0) + expense.amount
        )
      })

      const categories = Array.from(expenseByCategory.entries()).map(([category, amount]) => ({
        category,
        amount
      })).sort((a, b) => b.amount - a.amount)

      const recentExpenses = monthlyExpenses
        .map(({ expense, property }) => ({
          title: expense.title,
          category: expense.category,
          amount: expense.amount,
          expenseDate: expense.expenseDate,
          propertyName: property.name
        }))

      reportProps = {
        type: 'income-expense',
        title: `${scopeName} Income vs Expense Report - ${monthLabel(month)}`,
        monthRange: monthLabel(month),
        data: {
          income: scopedIncome,
          expenses: expenseTotal,
          net: scopedIncome - expenseTotal,
          categories,
          recentExpenses
        }
      }
    } else if (type === 'property-detail') {
      if (!requestedPropertyId) {
        return NextResponse.json({ error: 'A valid property id is required.' }, { status: 400 })
      }

      const propertyData = await getPropertySummaryData(user.id, requestedPropertyId, month)

      if (!propertyData) {
        return NextResponse.json({ error: 'Property not found.' }, { status: 404 })
      }

      reportProps = {
        type: 'property-detail',
        title: `${propertyData.property.name} Property Report - ${monthLabel(month)}`,
        propertyName: propertyData.property.name,
        month: monthLabel(month),
        data: propertyData
      }
    } else if (type === 'property-summary') {
      const dashboardData = await loadDashboardData()
      const reportProperties = scopedProperty ? [scopedProperty] : dashboardData.properties
      const propertyData = reportProperties.map((property) => {
        const pUnits = dashboardData.units.filter(({ unit }) => unit.propertyId === property.id)
        const occupiedUnits = pUnits.filter(({ unit }) => unit.status === 'occupied')
        const tenantBalances = dashboardData.tenantBalances.filter(({ unit }) => unit.propertyId === property.id)
        const collected = dashboardData.monthlyPayments
          .filter(({ unit }) => unit.propertyId === property.id)
          .reduce((total, payment) => total + payment.allocatedAmount, 0)
        const expenses = dashboardData.expenses
          .filter(({ expense }) =>
            expense.propertyId === property.id && dateKey(expense.expenseDate).slice(0, 7) === month
          )
          .reduce((total, row) => total + row.expense.amount, 0)
        const occupancyRate = pUnits.length > 0
          ? Math.round((occupiedUnits.length / pUnits.length) * 100)
          : 0

        return {
          id: property.id,
          name: property.name,
          location: property.location,
          unitsCount: pUnits.length,
          occupiedCount: occupiedUnits.length,
          occupancyRate,
          expected: tenantBalances.reduce((total, row) => total + row.unit.rentAmount, 0),
          collected,
          outstanding: tenantBalances.reduce((total, row) => total + row.balance, 0),
          expenses,
          net: collected - expenses
        }
      })

      reportProps = {
        type: 'property-summary',
        title: `Property Portfolio Performance - ${monthLabel(month)}`,
        month: monthLabel(month),
        data: propertyData
      }
    } else {
      return NextResponse.json({ error: 'Invalid report type.' }, { status: 400 })
    }

    const element = React.createElement(ReportDocument, reportProps)
    const buffer: Buffer = await renderToBuffer(element as any)
    const filename = safeFilenamePart(
      type === 'property-detail' && reportProps?.propertyName
        ? `estatecore-${reportProps.propertyName}-${month}-property-report`
        : scopedProperty
          ? `estatecore-${scopedProperty.name}-${type}-${month}`
        : type === 'payment-history'
          ? `estatecore-filtered-payments-${dateKey()}`
        : `estatecore-${type}-${month}`
    )

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
