import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import path from 'path'
import type { PropertySummaryData } from '@/lib/data'
import { formatDate, monthNameLabel, shortDate } from '@/lib/format'
import type { RentTrackerProperty, RentTrackerTotals } from '@/lib/rent-tracker'
import { rentTrackerNotes, statusLabel, timingLabel } from '@/lib/rent-tracker-labels'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#334155',
    backgroundColor: '#ffffff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#166534',
    paddingBottom: 15,
    marginBottom: 15
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: 'contain'
  },
  titleContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 2
  },
  subtitle: {
    fontSize: 8,
    color: '#d97706',
    letterSpacing: 1
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15
  },
  metaText: {
    fontSize: 9,
    color: '#475569'
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
    marginTop: 10
  },
  table: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 15
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 8,
    alignItems: 'center'
  },
  tableRowAlternate: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  tableHeader: {
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 2,
    borderBottomColor: '#166534'
  },
  th: {
    fontWeight: 'bold',
    color: '#166534'
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center'
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#166534',
    marginTop: 3
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8'
  }
})

interface MonthlyRentReportProps {
  type: 'monthly-rent'
  title: string
  month: string
  data: {
    payments: Array<{
      id: number
      tenantName: string
      propertyName: string
      unitNumber: string
      amountPaid: number
      paymentDate: string | Date
      paymentMethod: string
    }>
    summary: {
      totalExpected: number
      totalCollected: number
      totalOutstanding: number
    }
  }
}

interface PaymentHistoryReportProps {
  type: 'payment-history'
  title: string
  periodLabel: string
  data: {
    payments: Array<{
      id: number
      tenantName: string
      propertyName: string
      unitNumber: string
      amountPaid: number
      paymentDate: string | Date
      paymentMethod: string
    }>
    summary: {
      paymentCount: number
      totalCollected: number
    }
  }
}

interface UnpaidTenantsReportProps {
  type: 'unpaid-tenants'
  title: string
  month: string
  data: {
    unpaid: Array<{
      tenantName: string
      propertyName: string
      unitNumber: string
      rentAmount: number
      balance: number
      phone: string
    }>
    summary: {
      unpaidCount: number
      totalOutstanding: number
    }
  }
}

interface IncomeExpenseReportProps {
  type: 'income-expense'
  title: string
  monthRange: string
  data: {
    income: number
    expenses: number
    net: number
    categories: Array<{
      category: string
      amount: number
    }>
    recentExpenses: Array<{
      title: string
      category: string
      amount: number
      expenseDate: string | Date
      propertyName: string
    }>
  }
}

interface PropertySummaryReportProps {
  type: 'property-summary'
  title: string
  month: string
  data: Array<{
    id: number
    name: string
    location: string
    unitsCount: number
    occupiedCount: number
    occupancyRate: number
    expected: number
    collected: number
    outstanding: number
    expenses: number
    net: number
  }>
}

interface PropertyDetailReportProps {
  type: 'property-detail'
  title: string
  propertyName: string
  month: string
  data: PropertySummaryData
}

interface RentTrackerReportProps {
  type: 'rent-tracker'
  title: string
  month: string
  monthKey: string
  scopeLabel: string
  filterLabel: string | null
  data: {
    timing: 'past' | 'current' | 'future'
    totals: RentTrackerTotals
    /** Only the tenants the filter keeps; the totals are for everyone. */
    properties: RentTrackerProperty[]
  }
}

type ReportProps =
  | RentTrackerReportProps
  | MonthlyRentReportProps
  | PaymentHistoryReportProps
  | UnpaidTenantsReportProps
  | IncomeExpenseReportProps
  | PropertySummaryReportProps
  | PropertyDetailReportProps

/* Whole words only: a note that breaks "Au-gust" across lines reads badly. */
const wholeWords = (word: string) => [word]

const trackerStatusColor = {
  paid: '#166534',
  part_paid: '#b45309',
  not_yet: '#475569',
  late: '#b91c1c'
} as const

function RentTrackerSection(props: RentTrackerReportProps) {
  const { totals, properties, timing } = props.data
  const digits = (amount: number) => amount.toLocaleString('en-US')
  const monthName = monthNameLabel(props.monthKey)
  const dueWord = timing === 'past' ? 'Was due' : 'Due'
  const shown = properties.filter((property) => property.units.length > 0)
  const cell = { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#e2e8f0' }

  return (
    <View>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={{ color: '#64748b', fontSize: 8 }}>EXPECTED FOR {monthName.toUpperCase()}</Text>
          <Text style={styles.summaryVal}>UGX {digits(totals.expected)}</Text>
          <Text style={{ color: '#64748b', fontSize: 8, marginTop: 2 }}>
            {totals.tenants} tenant{totals.tenants === 1 ? '' : 's'}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={{ color: '#64748b', fontSize: 8 }}>PAID SO FAR</Text>
          <Text style={styles.summaryVal}>UGX {digits(totals.paid)}</Text>
          <Text style={{ color: '#64748b', fontSize: 8, marginTop: 2 }}>
            {totals.paidCount} paid in full{totals.partCount > 0 ? `, ${totals.partCount} part paid` : ''}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={{ color: '#64748b', fontSize: 8 }}>{timing === 'past' ? 'NEVER CAME IN' : 'STILL TO COME'}</Text>
          <Text style={[styles.summaryVal, { color: '#b45309' }]}>UGX {digits(totals.left)}</Text>
          <Text style={{ color: '#64748b', fontSize: 8, marginTop: 2 }}>
            {totals.owingCount} not paid yet{totals.lateCount > 0 ? `, ${totals.lateCount} late` : ''}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>When the rent is due</Text>
      <View style={styles.table}>
        {totals.dueDates.length === 0 ? (
          <View style={styles.tableRow}>
            <Text style={{ width: '100%', textAlign: 'center', color: '#94a3b8' }}>No tenant is billed for {monthName}.</Text>
          </View>
        ) : (
          totals.dueDates.map((day, index) => (
            <View
              key={`${day.date}-${day.timing}`}
              wrap={false}
              style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}
            >
              <Text style={{ width: '22%', fontWeight: 'bold' }}>
                {dueWord} {formatDate(`${day.date}T00:00:00.000Z`)}
              </Text>
              <Text style={{ width: '28%' }}>{timingLabel(day.timing)}</Text>
              <Text style={{ width: '14%' }}>
                {day.tenants} tenant{day.tenants === 1 ? '' : 's'}
              </Text>
              <Text style={{ width: '18%', textAlign: 'right' }}>UGX {digits(day.expected)}</Text>
              <Text style={{ width: '18%', textAlign: 'right', color: day.owingCount > 0 ? '#b45309' : '#166534' }}>
                {day.paidCount} paid, {day.owingCount} not yet
              </Text>
            </View>
          ))
        )}
      </View>

      {totals.earlierOwed > 0 && (
        <Text style={{ fontSize: 8.5, color: '#475569', marginBottom: 10 }}>
          Separately, {totals.earlierOwedCount} of these tenants still owe UGX {digits(totals.earlierOwed)} for months
          before {monthName}.
        </Text>
      )}

      {shown.length === 0 && (
        <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>No tenants to show.</Text>
      )}

      {shown.map((property) => (
        <View key={property.propertyId}>
          <View wrap={false}>
            <Text style={styles.sectionTitle}>{property.name}</Text>
            <Text style={{ fontSize: 8.5, color: '#475569', marginBottom: 6 }}>
              UGX {digits(property.totals.expected)} expected from {property.totals.tenants} tenant
              {property.totals.tenants === 1 ? '' : 's'} · {property.totals.paidCount} paid ·{' '}
              {property.totals.owingCount} not yet · UGX {digits(property.totals.left)} still to come
            </Text>
            <View style={[styles.tableRow, styles.tableHeader, cell, { borderTopWidth: 1 }]}>
              <Text style={[styles.th, { width: '9%' }]}>Unit</Text>
              <Text style={[styles.th, { width: '31%' }]}>Tenant</Text>
              <Text style={[styles.th, { width: '10%' }]}>Due</Text>
              <Text style={[styles.th, { width: '12%', textAlign: 'right' }]}>Rent</Text>
              <Text style={[styles.th, { width: '12%', textAlign: 'right' }]}>Paid</Text>
              <Text style={[styles.th, { width: '12%', textAlign: 'right' }]}>Left</Text>
              <Text style={[styles.th, { width: '14%', textAlign: 'right' }]}>Status</Text>
            </View>
          </View>
          {property.units
            .flatMap((unit) => unit.tenants)
            .map((row, index) => {
              const notes = rentTrackerNotes(row, props.monthKey)
              return (
                <View
                  key={row.tenantId}
                  wrap={false}
                  style={[index % 2 === 0 ? styles.tableRow : styles.tableRowAlternate, cell]}
                >
                  <Text style={{ width: '9%', fontWeight: 'bold' }}>{row.unitNumber}</Text>
                  <View style={{ width: '31%', paddingRight: 6 }}>
                    <Text hyphenationCallback={wholeWords} style={{ fontWeight: 'bold', color: '#0f172a' }}>
                      {row.name}
                    </Text>
                    {row.phone ? <Text style={{ fontSize: 7.5, color: '#64748b' }}>{row.phone}</Text> : null}
                    {notes.map((note) => (
                      <Text key={note} hyphenationCallback={wholeWords} style={{ fontSize: 7.5, color: '#92400e', marginTop: 1 }}>
                        {note}
                      </Text>
                    ))}
                  </View>
                  <Text style={{ width: '10%' }}>{shortDate(`${row.dueDate}T00:00:00.000Z`)}</Text>
                  <Text style={{ width: '12%', textAlign: 'right' }}>{digits(row.rent)}</Text>
                  <Text style={{ width: '12%', textAlign: 'right', color: '#166534' }}>{digits(row.paid)}</Text>
                  <Text style={{ width: '12%', textAlign: 'right', fontWeight: row.left > 0 ? 'bold' : 'normal' }}>
                    {digits(row.left)}
                  </Text>
                  <Text style={{ width: '14%', textAlign: 'right', fontWeight: 'bold', color: trackerStatusColor[row.status] }}>
                    {statusLabel(row)}
                  </Text>
                </View>
              )
            })}
          {property.emptyUnits.length > 0 && (
            <Text style={{ fontSize: 8, color: '#94a3b8', marginTop: 4 }}>
              No tenant billed for {monthName}: {property.emptyUnits.map((unit) => unit.unitNumber).join(', ')}
            </Text>
          )}
        </View>
      ))}
    </View>
  )
}

export function ReportDocument(props: ReportProps) {
  const logoPath = path.join(process.cwd(), 'public/brand/estatecore-logo-forest.png')
  const dateStr = new Date().toLocaleDateString('en-GB')
  const formatUGX = (amount: number) => `UGX ${amount.toLocaleString('en-US')}`

  return (
    <Document>
      <Page size="A4" orientation={props.type === 'property-summary' ? 'landscape' : 'portrait'} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={logoPath} style={styles.logo} />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{props.title}</Text>
            <Text style={styles.subtitle}>ESTATECORE UG REPORT</Text>
          </View>
        </View>

        {/* Meta Info */}
        <View style={styles.reportMeta}>
          <Text style={styles.metaText}>Generated: {dateStr}</Text>
          {props.type === 'monthly-rent' && <Text style={styles.metaText}>Period: {props.month}</Text>}
          {props.type === 'payment-history' && <Text style={styles.metaText}>Filter: {props.periodLabel}</Text>}
          {props.type === 'unpaid-tenants' && <Text style={styles.metaText}>Period: {props.month}</Text>}
          {props.type === 'income-expense' && <Text style={styles.metaText}>Period: {props.monthRange}</Text>}
          {props.type === 'property-summary' && <Text style={styles.metaText}>Period: {props.month}</Text>}
          {props.type === 'property-detail' && <Text style={styles.metaText}>Property: {props.propertyName} | Period: {props.month}</Text>}
          {props.type === 'rent-tracker' && (
            <Text style={styles.metaText}>
              Rent for: {props.month} | {props.scopeLabel}
              {props.filterLabel ? ` | Showing: ${props.filterLabel}` : ''}
            </Text>
          )}
        </View>

        {props.type === 'rent-tracker' && <RentTrackerSection {...props} />}

        {/* Report Content */}
        {props.type === 'monthly-rent' && (
          <View>
            {/* Cards */}
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={{ color: '#64748b', fontSize: 8 }}>TOTAL EXPECTED</Text>
                <Text style={styles.summaryVal}>{formatUGX(props.data.summary.totalExpected)}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={{ color: '#64748b', fontSize: 8 }}>TOTAL COLLECTED</Text>
                <Text style={styles.summaryVal}>{formatUGX(props.data.summary.totalCollected)}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={{ color: '#64748b', fontSize: 8 }}>TOTAL OUTSTANDING</Text>
                <Text style={[styles.summaryVal, { color: '#b45309' }]}>{formatUGX(props.data.summary.totalOutstanding)}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Rent Payments Log</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.th, { width: '25%' }]}>Tenant</Text>
                <Text style={[styles.th, { width: '30%' }]}>Property / Unit</Text>
                <Text style={[styles.th, { width: '15%', textAlign: 'center' }]}>Method</Text>
                <Text style={[styles.th, { width: '15%', textAlign: 'center' }]}>Date</Text>
                <Text style={[styles.th, { width: '15%', textAlign: 'right' }]}>Amount</Text>
              </View>
              {props.data.payments.length === 0 ? (
                <View style={styles.tableRow}>
                  <Text style={{ width: '100%', textAlign: 'center', color: '#94a3b8' }}>No payments logged for this period.</Text>
                </View>
              ) : (
                props.data.payments.map((p, index) => (
                  <View key={p.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
                    <Text style={{ width: '25%' }}>{p.tenantName}</Text>
                    <Text style={{ width: '30%' }}>{p.propertyName} - Unit {p.unitNumber}</Text>
                    <Text style={{ width: '15%', textAlign: 'center' }}>{p.paymentMethod.toUpperCase()}</Text>
                    <Text style={{ width: '15%', textAlign: 'center' }}>{new Date(p.paymentDate).toLocaleDateString('en-GB')}</Text>
                    <Text style={{ width: '15%', textAlign: 'right', fontWeight: 'bold' }}>{formatUGX(p.amountPaid)}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {props.type === 'payment-history' && (
          <View>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={{ color: '#64748b', fontSize: 8 }}>PAYMENTS FOUND</Text>
                <Text style={styles.summaryVal}>{props.data.summary.paymentCount}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={{ color: '#64748b', fontSize: 8 }}>FILTERED TOTAL</Text>
                <Text style={styles.summaryVal}>{formatUGX(props.data.summary.totalCollected)}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Filtered Payment History</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.th, { width: '25%' }]}>Tenant</Text>
                <Text style={[styles.th, { width: '30%' }]}>Property / Unit</Text>
                <Text style={[styles.th, { width: '15%', textAlign: 'center' }]}>Method</Text>
                <Text style={[styles.th, { width: '15%', textAlign: 'center' }]}>Date</Text>
                <Text style={[styles.th, { width: '15%', textAlign: 'right' }]}>Amount</Text>
              </View>
              {props.data.payments.length === 0 ? (
                <View style={styles.tableRow}>
                  <Text style={{ width: '100%', textAlign: 'center', color: '#94a3b8' }}>No payments match these filters.</Text>
                </View>
              ) : (
                props.data.payments.map((payment, index) => (
                  <View key={payment.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
                    <Text style={{ width: '25%' }}>{payment.tenantName}</Text>
                    <Text style={{ width: '30%' }}>{payment.propertyName} - Unit {payment.unitNumber}</Text>
                    <Text style={{ width: '15%', textAlign: 'center' }}>{payment.paymentMethod.toUpperCase()}</Text>
                    <Text style={{ width: '15%', textAlign: 'center' }}>{new Date(payment.paymentDate).toLocaleDateString('en-GB')}</Text>
                    <Text style={{ width: '15%', textAlign: 'right', fontWeight: 'bold' }}>{formatUGX(payment.amountPaid)}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {props.type === 'unpaid-tenants' && (
          <View>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={{ color: '#64748b', fontSize: 8 }}>UNPAID TENANTS</Text>
                <Text style={styles.summaryVal}>{props.data.summary.unpaidCount}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={{ color: '#64748b', fontSize: 8 }}>TOTAL OUTSTANDING</Text>
                <Text style={[styles.summaryVal, { color: '#991b1b' }]}>{formatUGX(props.data.summary.totalOutstanding)}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Defaulters / Unpaid List</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.th, { width: '25%' }]}>Tenant</Text>
                <Text style={[styles.th, { width: '30%' }]}>Property / Unit</Text>
                <Text style={[styles.th, { width: '20%', textAlign: 'center' }]}>Contact</Text>
                <Text style={[styles.th, { width: '12%', textAlign: 'right' }]}>Rent</Text>
                <Text style={[styles.th, { width: '13%', textAlign: 'right' }]}>Due</Text>
              </View>
              {props.data.unpaid.length === 0 ? (
                <View style={styles.tableRow}>
                  <Text style={{ width: '100%', textAlign: 'center', color: '#166534' }}>All tenants have cleared their balances! No defaulters.</Text>
                </View>
              ) : (
                props.data.unpaid.map((u, i) => (
                  <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
                    <Text style={{ width: '25%' }}>{u.tenantName}</Text>
                    <Text style={{ width: '30%' }}>{u.propertyName} - Unit {u.unitNumber}</Text>
                    <Text style={{ width: '20%', textAlign: 'center' }}>{u.phone}</Text>
                    <Text style={{ width: '12%', textAlign: 'right' }}>{formatUGX(u.rentAmount)}</Text>
                    <Text style={{ width: '13%', textAlign: 'right', color: '#b91c1c', fontWeight: 'bold' }}>{formatUGX(u.balance)}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {props.type === 'income-expense' && (
          <View>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={{ color: '#64748b', fontSize: 8 }}>TOTAL INCOME</Text>
                <Text style={styles.summaryVal}>{formatUGX(props.data.income)}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={{ color: '#64748b', fontSize: 8 }}>TOTAL EXPENSES</Text>
                <Text style={[styles.summaryVal, { color: '#991b1b' }]}>{formatUGX(props.data.expenses)}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={{ color: '#64748b', fontSize: 8 }}>NET CASH FLOW</Text>
                <Text style={[styles.summaryVal, { color: props.data.net >= 0 ? '#166534' : '#991b1b' }]}>
                  {formatUGX(props.data.net)}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Expense Category Breakdown</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.th, { width: '60%' }]}>Category</Text>
                <Text style={[styles.th, { width: '40%', textAlign: 'right' }]}>Total Spent</Text>
              </View>
              {props.data.categories.length === 0 ? (
                <View style={styles.tableRow}>
                  <Text style={{ width: '100%', textAlign: 'center', color: '#94a3b8' }}>No expenses logged.</Text>
                </View>
              ) : (
                props.data.categories.map((c, i) => (
                  <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
                    <Text style={{ width: '60%' }}>{c.category.toUpperCase()}</Text>
                    <Text style={{ width: '40%', textAlign: 'right', fontWeight: 'bold' }}>{formatUGX(c.amount)}</Text>
                  </View>
                ))
              )}
            </View>

            <Text style={styles.sectionTitle}>Recent Logged Expenses</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.th, { width: '30%' }]}>Expense Title</Text>
                <Text style={[styles.th, { width: '25%' }]}>Property</Text>
                <Text style={[styles.th, { width: '20%' }]}>Category</Text>
                <Text style={[styles.th, { width: '12%', textAlign: 'center' }]}>Date</Text>
                <Text style={[styles.th, { width: '13%', textAlign: 'right' }]}>Amount</Text>
              </View>
              {props.data.recentExpenses.length === 0 ? (
                <View style={styles.tableRow}>
                  <Text style={{ width: '100%', textAlign: 'center', color: '#94a3b8' }}>No expenses logged in this range.</Text>
                </View>
              ) : (
                props.data.recentExpenses.map((re, i) => (
                  <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
                    <Text style={{ width: '30%' }}>{re.title}</Text>
                    <Text style={{ width: '25%' }}>{re.propertyName}</Text>
                    <Text style={{ width: '20%' }}>{re.category.toUpperCase()}</Text>
                    <Text style={{ width: '12%', textAlign: 'center' }}>{new Date(re.expenseDate).toLocaleDateString('en-GB')}</Text>
                    <Text style={{ width: '13%', textAlign: 'right', fontWeight: 'bold' }}>{formatUGX(re.amount)}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {props.type === 'property-summary' && (
          <View>
            <Text style={styles.sectionTitle}>Portfolio Performance Breakdown</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.th, { width: '20%' }]}>Property</Text>
                <Text style={[styles.th, { width: '8%', textAlign: 'center' }]}>Units</Text>
                <Text style={[styles.th, { width: '10%', textAlign: 'center' }]}>Occupied</Text>
                <Text style={[styles.th, { width: '14%', textAlign: 'right' }]}>Expected</Text>
                <Text style={[styles.th, { width: '14%', textAlign: 'right' }]}>Collected</Text>
                <Text style={[styles.th, { width: '14%', textAlign: 'right' }]}>Outstanding</Text>
                <Text style={[styles.th, { width: '10%', textAlign: 'right' }]}>Expenses</Text>
                <Text style={[styles.th, { width: '10%', textAlign: 'right' }]}>Net</Text>
              </View>
              {props.data.map((p, i) => (
                <View key={p.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
                  <Text style={{ width: '20%', fontWeight: 'bold' }}>{p.name}</Text>
                  <Text style={{ width: '8%', textAlign: 'center' }}>{p.unitsCount}</Text>
                  <Text style={{ width: '10%', textAlign: 'center' }}>{p.occupiedCount} ({p.occupancyRate}%)</Text>
                  <Text style={{ width: '14%', textAlign: 'right' }}>{formatUGX(p.expected)}</Text>
                  <Text style={{ width: '14%', textAlign: 'right', color: '#166534' }}>{formatUGX(p.collected)}</Text>
                  <Text style={{ width: '14%', textAlign: 'right', color: '#b45309' }}>{formatUGX(p.outstanding)}</Text>
                  <Text style={{ width: '10%', textAlign: 'right', color: '#991b1b' }}>{formatUGX(p.expenses)}</Text>
                  <Text style={{ width: '10%', textAlign: 'right', fontWeight: 'bold' }}>{formatUGX(p.net)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {props.type === 'property-detail' && (
          <View>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={{ color: '#64748b', fontSize: 8 }}>UNITS</Text>
                <Text style={styles.summaryVal}>{props.data.summary.totalUnits}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={{ color: '#64748b', fontSize: 8 }}>ACTIVE TENANTS</Text>
                <Text style={styles.summaryVal}>{props.data.summary.activeTenants}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={{ color: '#64748b', fontSize: 8 }}>RENT ROLL</Text>
                <Text style={styles.summaryVal}>{formatUGX(props.data.summary.monthlyRentRoll)}</Text>
              </View>
            </View>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={{ color: '#64748b', fontSize: 8 }}>COLLECTED</Text>
                <Text style={styles.summaryVal}>{formatUGX(props.data.summary.collectedThisMonth)}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={{ color: '#64748b', fontSize: 8 }}>OUTSTANDING</Text>
                <Text style={[styles.summaryVal, { color: '#b45309' }]}>{formatUGX(props.data.summary.outstandingRent)}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={{ color: '#64748b', fontSize: 8 }}>EXPENSES</Text>
                <Text style={[styles.summaryVal, { color: '#991b1b' }]}>{formatUGX(props.data.summary.expensesThisMonth)}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Units, Tenants, Rent, and Balances</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.th, { width: '13%' }]}>Unit</Text>
                <Text style={[styles.th, { width: '24%' }]}>Tenant</Text>
                <Text style={[styles.th, { width: '16%', textAlign: 'right' }]}>Rent</Text>
                <Text style={[styles.th, { width: '16%', textAlign: 'right' }]}>Paid</Text>
                <Text style={[styles.th, { width: '16%', textAlign: 'right' }]}>Outstanding</Text>
                <Text style={[styles.th, { width: '15%', textAlign: 'right' }]}>Expenses</Text>
              </View>
              {props.data.unitSummaries.length === 0 ? (
                <View style={styles.tableRow}>
                  <Text style={{ width: '100%', textAlign: 'center', color: '#94a3b8' }}>No units found for this property.</Text>
                </View>
              ) : (
                props.data.unitSummaries.map((row, index) => (
                  <View key={row.unit.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
                    <Text style={{ width: '13%', fontWeight: 'bold' }}>Unit {row.unit.unitNumber}</Text>
                    <Text style={{ width: '24%' }}>{row.activeTenant?.fullName ?? 'Vacant'}</Text>
                    <Text style={{ width: '16%', textAlign: 'right' }}>{formatUGX(row.unit.rentAmount)}</Text>
                    <Text style={{ width: '16%', textAlign: 'right', color: '#166534' }}>{formatUGX(row.monthlyAmountPaid)}</Text>
                    <Text style={{ width: '16%', textAlign: 'right', color: row.outstandingBalance > 0 ? '#b45309' : '#64748b' }}>
                      {formatUGX(row.outstandingBalance)}
                    </Text>
                    <Text style={{ width: '15%', textAlign: 'right', color: '#991b1b' }}>{formatUGX(row.monthlyExpenses)}</Text>
                  </View>
                ))
              )}
            </View>

            <Text style={styles.sectionTitle}>Payments in Period</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.th, { width: '28%' }]}>Tenant</Text>
                <Text style={[styles.th, { width: '18%' }]}>Unit</Text>
                <Text style={[styles.th, { width: '20%', textAlign: 'center' }]}>Date</Text>
                <Text style={[styles.th, { width: '34%', textAlign: 'right' }]}>Amount</Text>
              </View>
              {props.data.recentPayments.length === 0 ? (
                <View style={styles.tableRow}>
                  <Text style={{ width: '100%', textAlign: 'center', color: '#94a3b8' }}>No payments recorded for this property in the period.</Text>
                </View>
              ) : (
                props.data.recentPayments.map((row, index) => (
                  <View key={row.payment.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
                    <Text style={{ width: '28%' }}>{row.tenant.fullName}</Text>
                    <Text style={{ width: '18%' }}>Unit {row.unit.unitNumber}</Text>
                    <Text style={{ width: '20%', textAlign: 'center' }}>{new Date(row.payment.paymentDate).toLocaleDateString('en-GB')}</Text>
                    <Text style={{ width: '34%', textAlign: 'right', color: '#166534', fontWeight: 'bold' }}>{formatUGX(row.payment.amountPaid)}</Text>
                  </View>
                ))
              )}
            </View>

            <Text style={styles.sectionTitle}>Expenses in Period</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.th, { width: '34%' }]}>Expense</Text>
                <Text style={[styles.th, { width: '18%' }]}>Unit</Text>
                <Text style={[styles.th, { width: '20%', textAlign: 'center' }]}>Date</Text>
                <Text style={[styles.th, { width: '28%', textAlign: 'right' }]}>Amount</Text>
              </View>
              {props.data.recentExpenses.length === 0 ? (
                <View style={styles.tableRow}>
                  <Text style={{ width: '100%', textAlign: 'center', color: '#94a3b8' }}>No expenses recorded for this property in the period.</Text>
                </View>
              ) : (
                props.data.recentExpenses.map((row, index) => (
                  <View key={row.expense.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
                    <Text style={{ width: '34%' }}>{row.expense.title}</Text>
                    <Text style={{ width: '18%' }}>{row.unit ? `Unit ${row.unit.unitNumber}` : 'Property'}</Text>
                    <Text style={{ width: '20%', textAlign: 'center' }}>{new Date(row.expense.expenseDate).toLocaleDateString('en-GB')}</Text>
                    <Text style={{ width: '28%', textAlign: 'right', color: '#991b1b', fontWeight: 'bold' }}>{formatUGX(row.expense.amount)}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          EstateCore UG — Professional Property Management Solutions for Uganda. Generated on {dateStr}
        </Text>
      </Page>
    </Document>
  )
}
