import { requireCurrentAppUser } from '@/lib/auth'
import { getDashboardData, getPropertySummaryData, listPaymentsForUser, listPropertiesForUser } from '@/lib/data'
import { currentPaymentMonth, dateKey, formatDate, monthLabel } from '@/lib/format'
import { normalizePaymentFilters, paymentMatchesSearch, paymentReceivedInPeriod } from '@/lib/payment-filters'
import { ReportDocument } from '@/lib/pdf/reports'
import {
  buildReportPeriodSnapshot,
  normalizeReportMonth,
  normalizeReportPeriod
} from '@/lib/report-period'
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
    const month = normalizeReportMonth(searchParams.get('month'), currentPaymentMonth())
    const reportPeriod = normalizeReportPeriod(searchParams.get('period'))
    const reportPeriodLabel = reportPeriod === 'all' ? 'All time' : monthLabel(month)
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
      const snapshot = buildReportPeriodSnapshot(dashboardData, {
        period: reportPeriod,
        month,
        propertyId: requestedPropertyId
      })
      const payments = snapshot.payments
        .map(({ payment, tenant, unit, property, reportAmount, reportDate }) => ({
          id: payment.id,
          tenantName: tenant.fullName,
          propertyName: property.name,
          unitNumber: unit.unitNumber,
          amountPaid: reportAmount,
          paymentDate: reportDate,
          paymentMethod: payment.paymentMethod
        }))

      reportProps = {
        type: 'monthly-rent',
        title: `${scopeName} ${reportPeriod === 'all' ? 'All-Time' : 'Monthly'} Rent Report - ${reportPeriodLabel}`,
        month: reportPeriodLabel,
        data: {
          payments,
          summary: {
            totalExpected: snapshot.summary.expected,
            totalCollected: snapshot.summary.collected,
            totalOutstanding: snapshot.summary.outstanding
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
      const snapshot = buildReportPeriodSnapshot(dashboardData, {
        period: reportPeriod,
        month,
        propertyId: requestedPropertyId
      })
      const unpaid = snapshot.tenantRows
        .filter(({ balance }) => balance > 0)
        .map((row) => ({
          tenantName: row.tenant.fullName,
          propertyName: row.property.name,
          unitNumber: row.unit.unitNumber,
          rentAmount: row.expected,
          balance: row.balance,
          phone: row.tenant.phone
        }))

      reportProps = {
        type: 'unpaid-tenants',
        title: `${scopeName} Unpaid Tenants Report - ${reportPeriodLabel}`,
        month: reportPeriodLabel,
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
      const snapshot = buildReportPeriodSnapshot(dashboardData, {
        period: reportPeriod,
        month,
        propertyId: requestedPropertyId
      })
      const expenseByCategory = new Map<string, number>()
      snapshot.expenses.forEach(({ expense }) => {
        expenseByCategory.set(
          expense.category,
          (expenseByCategory.get(expense.category) ?? 0) + expense.amount
        )
      })

      const categories = Array.from(expenseByCategory.entries()).map(([category, amount]) => ({
        category,
        amount
      })).sort((a, b) => b.amount - a.amount)

      const recentExpenses = snapshot.expenses
        .map(({ expense, property }) => ({
          title: expense.title,
          category: expense.category,
          amount: expense.amount,
          expenseDate: expense.expenseDate,
          propertyName: property.name
        }))

      reportProps = {
        type: 'income-expense',
        title: `${scopeName} Income vs Expense Report - ${reportPeriodLabel}`,
        monthRange: reportPeriodLabel,
        data: {
          income: snapshot.summary.collected,
          expenses: snapshot.summary.expenses,
          net: snapshot.summary.net,
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

      const dashboardData = await loadDashboardData()
      const snapshot = buildReportPeriodSnapshot(dashboardData, {
        period: reportPeriod,
        month,
        propertyId: requestedPropertyId
      })
      const tenantTotalsByUnit = new Map<number, { amountPaid: number; balance: number }>()
      snapshot.tenantRows.forEach((row) => {
        const current = tenantTotalsByUnit.get(row.unit.id) ?? { amountPaid: 0, balance: 0 }
        tenantTotalsByUnit.set(row.unit.id, {
          amountPaid: current.amountPaid + row.amountPaid,
          balance: current.balance + row.balance
        })
      })
      const expensesByUnit = new Map<number, number>()
      snapshot.expenses.forEach(({ expense }) => {
        if (expense.unitId) {
          expensesByUnit.set(
            expense.unitId,
            (expensesByUnit.get(expense.unitId) ?? 0) + expense.amount
          )
        }
      })
      const reportPropertyData = {
        ...propertyData,
        summary: {
          ...propertyData.summary,
          monthlyExpected: snapshot.summary.expected,
          collectedThisMonth: snapshot.summary.collected,
          outstandingRent: snapshot.summary.outstanding,
          expensesThisMonth: snapshot.summary.expenses,
          netThisMonth: snapshot.summary.net
        },
        unitSummaries: propertyData.unitSummaries.map((row) => {
          const tenantTotals = tenantTotalsByUnit.get(row.unit.id) ?? { amountPaid: 0, balance: 0 }
          return {
            ...row,
            monthlyAmountPaid: tenantTotals.amountPaid,
            monthlyBalance: tenantTotals.balance,
            outstandingBalance: tenantTotals.balance,
            monthlyExpenses: expensesByUnit.get(row.unit.id) ?? 0
          }
        }),
        recentPayments: snapshot.payments.map((row) => ({
          payment: {
            ...row.payment,
            amountPaid: row.reportAmount,
            paymentDate: row.reportDate
          },
          tenant: row.tenant,
          unit: row.unit,
          property: row.property
        })),
        monthlyExpenses: snapshot.expenses,
        recentExpenses: snapshot.expenses
      }

      reportProps = {
        type: 'property-detail',
        title: `${propertyData.property.name} Property Report - ${reportPeriodLabel}`,
        propertyName: propertyData.property.name,
        month: reportPeriodLabel,
        data: reportPropertyData
      }
    } else if (type === 'property-summary') {
      const dashboardData = await loadDashboardData()
      const reportProperties = scopedProperty ? [scopedProperty] : dashboardData.properties
      const propertyData = reportProperties.map((property) => {
        const pUnits = dashboardData.units.filter(({ unit }) => unit.propertyId === property.id)
        const occupiedUnits = pUnits.filter(({ unit }) => unit.status === 'occupied')
        const snapshot = buildReportPeriodSnapshot(dashboardData, {
          period: reportPeriod,
          month,
          propertyId: property.id
        })
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
          expected: snapshot.summary.expected,
          collected: snapshot.summary.collected,
          outstanding: snapshot.summary.outstanding,
          expenses: snapshot.summary.expenses,
          net: snapshot.summary.net
        }
      })

      reportProps = {
        type: 'property-summary',
        title: `Property Portfolio Performance - ${reportPeriodLabel}`,
        month: reportPeriodLabel,
        data: propertyData
      }
    } else {
      return NextResponse.json({ error: 'Invalid report type.' }, { status: 400 })
    }

    const element = React.createElement(ReportDocument, reportProps)
    const buffer: Buffer = await renderToBuffer(element as any)
    const filename = safeFilenamePart(
      type === 'property-detail' && reportProps?.propertyName
        ? `estatecore-${reportProps.propertyName}-${reportPeriod === 'all' ? 'all-time' : month}-property-report`
        : scopedProperty
          ? `estatecore-${scopedProperty.name}-${type}-${reportPeriod === 'all' ? 'all-time' : month}`
        : type === 'payment-history'
          ? `estatecore-filtered-payments-${dateKey()}`
        : `estatecore-${type}-${reportPeriod === 'all' ? 'all-time' : month}`
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
