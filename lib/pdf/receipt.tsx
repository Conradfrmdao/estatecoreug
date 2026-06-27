import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import path from 'path'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#334155',
    backgroundColor: '#ffffff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#166534',
    paddingBottom: 15,
    marginBottom: 20
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 2
  },
  subtitle: {
    fontSize: 8,
    color: '#d97706',
    letterSpacing: 1
  },
  metaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  metaCol: {
    flexDirection: 'column'
  },
  metaLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 3,
    textTransform: 'uppercase'
  },
  metaValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  detailsTable: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 25
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 10,
    alignItems: 'center'
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
  col1: { width: '40%' },
  col2: { width: '20%', textAlign: 'center' },
  col3: { width: '20%', textAlign: 'right' },
  col4: { width: '20%', textAlign: 'right' },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 40
  },
  totalTable: {
    width: '40%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  grandTotalRow: {
    backgroundColor: '#166534',
    color: '#ffffff'
  },
  grandTotalText: {
    fontWeight: 'bold',
    color: '#ffffff'
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

interface ReceiptProps {
  payment: {
    id: number
    amountPaid: number
    balanceAfterPayment: number
    paymentMonth: string
    paymentDate: string | Date
    paymentMethod: string
    notes?: string | null
    tenantName: string
    unitNumber: string
    propertyName: string
    rentAmount: number
  }
}

export function ReceiptDocument({ payment }: ReceiptProps) {
  const logoPath = path.join(process.cwd(), 'public/estatecoreuglogo.png')
  const dateStr = new Date(payment.paymentDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  const formatUGX = (amount: number) => {
    return `UGX ${amount.toLocaleString('en-US')}`
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={logoPath} style={styles.logo} />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>RENT RECEIPT</Text>
            <Text style={styles.subtitle}>PROPERTY MANAGEMENT SOLUTIONS</Text>
          </View>
        </View>

        {/* Metadata */}
        <View style={styles.metaSection}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Receipt Number</Text>
            <Text style={styles.metaValue}>EC-PAY-{payment.id.toString().padStart(5, '0')}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Payment Date</Text>
            <Text style={styles.metaValue}>{dateStr}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Payment Method</Text>
            <Text style={styles.metaValue}>{payment.paymentMethod.toUpperCase()}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Month Covered</Text>
            <Text style={styles.metaValue}>{payment.paymentMonth}</Text>
          </View>
        </View>

        {/* Content Table */}
        <View style={styles.detailsTable}>
          {/* Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.col1, styles.th]}>Property & Unit</Text>
            <Text style={[styles.col2, styles.th]}>Tenant Name</Text>
            <Text style={[styles.col3, styles.th]}>Monthly Rent</Text>
            <Text style={[styles.col4, styles.th]}>Amount Paid</Text>
          </View>

          {/* Row */}
          <View style={styles.tableRow}>
            <Text style={styles.col1}>{payment.propertyName} - Unit {payment.unitNumber}</Text>
            <Text style={styles.col2}>{payment.tenantName}</Text>
            <Text style={styles.col3}>{formatUGX(payment.rentAmount)}</Text>
            <Text style={styles.col4}>{formatUGX(payment.amountPaid)}</Text>
          </View>
        </View>

        {/* Summary Totals */}
        <View style={styles.totalSection}>
          <View style={styles.totalTable}>
            <View style={styles.totalRow}>
              <Text style={{ fontSize: 9 }}>Rent Due:</Text>
              <Text style={{ fontSize: 9 }}>{formatUGX(payment.rentAmount)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={{ fontSize: 9 }}>Total Paid:</Text>
              <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{formatUGX(payment.amountPaid)}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={[styles.grandTotalText, { fontSize: 9 }]}>Balance:</Text>
              <Text style={[styles.grandTotalText, { fontSize: 9 }]}>{formatUGX(payment.balanceAfterPayment)}</Text>
            </View>
          </View>
        </View>

        {payment.notes && (
          <View style={{ marginTop: 10, padding: 10, backgroundColor: '#f8fafc', borderRadius: 4, borderWidth: 1, borderColor: '#e2e8f0' }}>
            <Text style={{ fontSize: 8, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Notes</Text>
            <Text style={{ fontSize: 9, color: '#334155' }}>{payment.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for your payment. Generated by EstateCore UG on {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  )
}
