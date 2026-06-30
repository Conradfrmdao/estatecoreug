import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import path from 'path'

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
  data: Array<{
    id: number
    name: string
    location: string
    unitsCount: number
    occupiedCount: number
    occupancyRate: number
  }>
}

type ReportProps = MonthlyRentReportProps | UnpaidTenantsReportProps | IncomeExpenseReportProps | PropertySummaryReportProps

export function ReportDocument(props: ReportProps) {
  const logoPath = path.join(process.cwd(), 'public/estatecore-lockup.png')
  const dateStr = new Date().toLocaleDateString('en-GB')
  const formatUGX = (amount: number) => `UGX ${amount.toLocaleString('en-US')}`

  return (
    <Document>
      <Page size="A4" style={styles.page}>
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
          {props.type === 'monthly-rent' && <Text style={styles.metaText}>Month: {props.month}</Text>}
          {props.type === 'unpaid-tenants' && <Text style={styles.metaText}>As of Month: {props.month}</Text>}
          {props.type === 'income-expense' && <Text style={styles.metaText}>Period: {props.monthRange}</Text>}
        </View>

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
                  <Text style={{ width: '100%', textAlign: 'center', color: '#94a3b8' }}>No payments logged for this month.</Text>
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
                <Text style={[styles.th, { width: '30%' }]}>Property</Text>
                <Text style={[styles.th, { width: '30%' }]}>Location</Text>
                <Text style={[styles.th, { width: '15%', textAlign: 'center' }]}>Total Units</Text>
                <Text style={[styles.th, { width: '15%', textAlign: 'center' }]}>Occupied</Text>
                <Text style={[styles.th, { width: '10%', textAlign: 'right' }]}>Rate</Text>
              </View>
              {props.data.map((p, i) => (
                <View key={p.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
                  <Text style={{ width: '30%', fontWeight: 'bold' }}>{p.name}</Text>
                  <Text style={{ width: '30%' }}>{p.location}</Text>
                  <Text style={{ width: '15%', textAlign: 'center' }}>{p.unitsCount}</Text>
                  <Text style={{ width: '15%', textAlign: 'center' }}>{p.occupiedCount}</Text>
                  <Text style={{ width: '10%', textAlign: 'right', color: '#166534', fontWeight: 'bold' }}>{p.occupancyRate}%</Text>
                </View>
              ))}
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
