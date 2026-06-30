import {
  expenses,
  properties,
  rentPayments,
  tenants,
  units,
  type Expense,
  type Property,
  type RentPayment,
  type Tenant,
  type Unit,
  users,
  type User
} from '@/drizzle/schema'
import { db } from '@/lib/db'
import { currentPaymentMonth } from '@/lib/format'
import {
  allocatedPaymentForPeriod,
  calculateTenantPeriodBalance,
  getPaymentCoverage,
  parseMonth,
  type TenantRentStatus
} from '@/lib/rent-cycle'
import { and, desc, eq, ne } from 'drizzle-orm'

export type UnitWithProperty = {
  unit: Unit
  property: Property
}

export type TenantWithUnit = {
  tenant: Tenant
  unit: Unit
  property: Property
}

export type PaymentWithTenant = {
  payment: RentPayment
  tenant: Tenant
  unit: Unit
  property: Property
}

export type ExpenseWithProperty = {
  expense: Expense
  property: Property
  unit: Unit | null
}

export type TenantBalance = TenantWithUnit & {
  amountPaid: number
  balance: number
  dueDate: Date
  daysUntilDue: number
  paymentStatus: TenantRentStatus
}

export type UserWithStats = {
  user: User
  stats: {
    properties: number
    tenants: number
    payments: number
    expenses: number
    paymentTotal: number
    expenseTotal: number
  }
}

export type CalendarEvent = {
  id: string
  date: string
  title: string
  type: 'move_in' | 'due' | 'overdue' | 'payment' | 'expense'
  detail: string
  severity: 'info' | 'success' | 'warning' | 'danger'
}

export type AppAlert = {
  id: string
  title: string
  body: string
  severity: 'info' | 'success' | 'warning' | 'danger'
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

function getExpenseMonth(expense: Expense) {
  return expense.expenseDate.toISOString().slice(0, 7)
}

function getPaymentDateMonth(payment: RentPayment) {
  return payment.paymentDate.toISOString().slice(0, 7)
}

function buildTenantBalances(
  tenantRows: TenantWithUnit[],
  paymentRows: PaymentWithTenant[],
  month: string
) {
  const period = parseMonth(month)
  const activeTenants = tenantRows.filter(({ tenant }) => tenant.active)
  const paymentsByTenant = new Map<number, RentPayment[]>()

  for (const { payment } of paymentRows) {
    const rows = paymentsByTenant.get(payment.tenantId) ?? []
    rows.push(payment)
    paymentsByTenant.set(payment.tenantId, rows)
  }

  return activeTenants.flatMap((row) => {
    const balance = calculateTenantPeriodBalance(
      row,
      paymentsByTenant.get(row.tenant.id) ?? [],
      period
    )

    if (!balance) {
      return []
    }

    return [{
      ...row,
      ...balance
    } satisfies TenantBalance]
  })
}

function buildAlerts(tenantBalances: TenantBalance[], paymentRows: PaymentWithTenant[], expenseRows: ExpenseWithProperty[]) {
  const today = new Date().toISOString().slice(0, 10)
  const alerts: AppAlert[] = []

  for (const row of tenantBalances) {
    if (row.paymentStatus === 'due_today') {
      alerts.push({
        id: `due-${row.tenant.id}`,
        title: 'Rent due today',
        body: `${row.tenant.fullName} owes ${row.property.name}, Unit ${row.unit.unitNumber}.`,
        severity: 'warning'
      })
    }

    if (row.paymentStatus === 'upcoming') {
      alerts.push({
        id: `upcoming-${row.tenant.id}`,
        title: `${row.daysUntilDue} days left`,
        body: `${row.tenant.fullName}'s rent is coming due soon.`,
        severity: 'info'
      })
    }

    if (row.paymentStatus === 'overdue') {
      alerts.push({
        id: `overdue-${row.tenant.id}`,
        title: `Overdue by ${Math.abs(row.daysUntilDue)} days`,
        body: `${row.tenant.fullName} has ${row.balance.toLocaleString('en-UG')} UGX outstanding.`,
        severity: 'danger'
      })
    }
  }

  for (const { payment, tenant } of paymentRows.slice(0, 10)) {
    if (payment.paymentDate.toISOString().slice(0, 10) === today) {
      alerts.push({
        id: `paid-${payment.id}`,
        title: 'Payment recorded today',
        body: `${tenant.fullName} paid ${payment.amountPaid.toLocaleString('en-UG')} UGX.`,
        severity: 'success'
      })
    }
  }

  for (const { expense } of expenseRows.slice(0, 10)) {
    if (expense.expenseDate.toISOString().slice(0, 10) === today) {
      alerts.push({
        id: `expense-${expense.id}`,
        title: 'Expense recorded today',
        body: `${expense.title} was logged for ${expense.amount.toLocaleString('en-UG')} UGX.`,
        severity: 'info'
      })
    }
  }

  return alerts.slice(0, 8)
}

function toEventDate(value: Date) {
  return value.toISOString().slice(0, 10)
}

function buildCalendarEvents(
  tenantRows: TenantWithUnit[],
  paymentRows: PaymentWithTenant[],
  expenseRows: ExpenseWithProperty[]
) {
  const events: CalendarEvent[] = []

  for (const { tenant, unit, property } of tenantRows) {
    events.push({
      id: `move-in-${tenant.id}`,
      date: toEventDate(tenant.moveInDate),
      title: `${tenant.fullName} moved in`,
      type: 'move_in',
      detail: `${property.name}, Unit ${unit.unitNumber}`,
      severity: 'info'
    })

    if (tenant.active) {
      const overdue = tenant.rentDueDate < new Date()
      events.push({
        id: `due-${tenant.id}`,
        date: toEventDate(tenant.rentDueDate),
        title: overdue ? `${tenant.fullName} rent overdue` : `${tenant.fullName} rent due`,
        type: overdue ? 'overdue' : 'due',
        detail: `${property.name}, Unit ${unit.unitNumber}`,
        severity: overdue ? 'danger' : 'warning'
      })
    }
  }

  for (const { payment, tenant, property, unit } of paymentRows) {
    const coverage = getPaymentCoverage(payment)
    events.push({
      id: `payment-${payment.id}`,
      date: toEventDate(payment.paymentDate),
      title: `${tenant.fullName} paid rent`,
      type: 'payment',
      detail: `${property.name}, Unit ${unit.unitNumber}, ${coverage.monthsCovered} month${coverage.monthsCovered === 1 ? '' : 's'} covered`,
      severity: 'success'
    })
  }

  for (const { expense, property, unit } of expenseRows) {
    events.push({
      id: `expense-${expense.id}`,
      date: toEventDate(expense.expenseDate),
      title: expense.title,
      type: 'expense',
      detail: `${property.name}${unit ? `, Unit ${unit.unitNumber}` : ''}`,
      severity: 'info'
    })
  }

  return events.sort((a, b) => a.date.localeCompare(b.date))
}

export async function listUsersWithStats(): Promise<UserWithStats[]> {
  const [userRows, propertyRows, tenantRows, paymentRows, expenseRows] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)),
    db.select({ id: properties.id, userId: properties.userId }).from(properties),
    db
      .select({ id: tenants.id, userId: properties.userId })
      .from(tenants)
      .innerJoin(units, eq(units.id, tenants.unitId))
      .innerJoin(properties, eq(properties.id, units.propertyId)),
    db
      .select({ id: rentPayments.id, userId: properties.userId, amountPaid: rentPayments.amountPaid })
      .from(rentPayments)
      .innerJoin(units, eq(units.id, rentPayments.unitId))
      .innerJoin(properties, eq(properties.id, units.propertyId)),
    db
      .select({ id: expenses.id, userId: properties.userId, amount: expenses.amount })
      .from(expenses)
      .innerJoin(properties, eq(properties.id, expenses.propertyId))
  ])

  return userRows.map((user) => {
    const userProperties = propertyRows.filter((row) => row.userId === user.id)
    const userTenants = tenantRows.filter((row) => row.userId === user.id)
    const userPayments = paymentRows.filter((row) => row.userId === user.id)
    const userExpenses = expenseRows.filter((row) => row.userId === user.id)

    return {
      user,
      stats: {
        properties: userProperties.length,
        tenants: userTenants.length,
        payments: userPayments.length,
        expenses: userExpenses.length,
        paymentTotal: sum(userPayments.map((row) => row.amountPaid)),
        expenseTotal: sum(userExpenses.map((row) => row.amount))
      }
    }
  })
}

export async function listPropertiesForUser(userId: number) {
  return db
    .select()
    .from(properties)
    .where(eq(properties.userId, userId))
    .orderBy(desc(properties.createdAt))
}

export async function listUnitsForUser(userId: number) {
  return db
    .select({
      unit: units,
      property: properties
    })
    .from(units)
    .innerJoin(properties, eq(properties.id, units.propertyId))
    .where(eq(properties.userId, userId))
    .orderBy(desc(units.createdAt))
}

export async function listTenantsForUser(userId: number) {
  return db
    .select({
      tenant: tenants,
      unit: units,
      property: properties
    })
    .from(tenants)
    .innerJoin(units, eq(units.id, tenants.unitId))
    .innerJoin(properties, eq(properties.id, units.propertyId))
    .where(eq(properties.userId, userId))
    .orderBy(desc(tenants.createdAt))
}

export async function listPaymentsForUser(userId: number) {
  return db
    .select({
      payment: rentPayments,
      tenant: tenants,
      unit: units,
      property: properties
    })
    .from(rentPayments)
    .innerJoin(tenants, eq(tenants.id, rentPayments.tenantId))
    .innerJoin(units, eq(units.id, rentPayments.unitId))
    .innerJoin(properties, eq(properties.id, units.propertyId))
    .where(eq(properties.userId, userId))
    .orderBy(desc(rentPayments.paymentDate))
}

export async function listExpensesForUser(userId: number) {
  return db
    .select({
      expense: expenses,
      property: properties,
      unit: units
    })
    .from(expenses)
    .innerJoin(properties, eq(properties.id, expenses.propertyId))
    .leftJoin(units, eq(units.id, expenses.unitId))
    .where(eq(properties.userId, userId))
    .orderBy(desc(expenses.expenseDate))
}

export async function getPropertyForUser(userId: number, propertyId: number) {
  const [row] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.userId, userId), eq(properties.id, propertyId)))
    .limit(1)

  return row ?? null
}

export async function getUnitForUser(userId: number, unitId: number) {
  const [row] = await db
    .select({
      unit: units,
      property: properties
    })
    .from(units)
    .innerJoin(properties, eq(properties.id, units.propertyId))
    .where(and(eq(properties.userId, userId), eq(units.id, unitId)))
    .limit(1)

  return row ?? null
}

export async function getTenantForUser(userId: number, tenantId: number) {
  const [row] = await db
    .select({
      tenant: tenants,
      unit: units,
      property: properties
    })
    .from(tenants)
    .innerJoin(units, eq(units.id, tenants.unitId))
    .innerJoin(properties, eq(properties.id, units.propertyId))
    .where(and(eq(properties.userId, userId), eq(tenants.id, tenantId)))
    .limit(1)

  return row ?? null
}

export async function getPaymentForUser(userId: number, paymentId: number) {
  const [row] = await db
    .select({
      payment: rentPayments,
      tenant: tenants,
      unit: units,
      property: properties
    })
    .from(rentPayments)
    .innerJoin(tenants, eq(tenants.id, rentPayments.tenantId))
    .innerJoin(units, eq(units.id, rentPayments.unitId))
    .innerJoin(properties, eq(properties.id, units.propertyId))
    .where(and(eq(properties.userId, userId), eq(rentPayments.id, paymentId)))
    .limit(1)

  return row ?? null
}

export async function getExpenseForUser(userId: number, expenseId: number) {
  const [row] = await db
    .select({
      expense: expenses,
      property: properties,
      unit: units
    })
    .from(expenses)
    .innerJoin(properties, eq(properties.id, expenses.propertyId))
    .leftJoin(units, eq(units.id, expenses.unitId))
    .where(and(eq(properties.userId, userId), eq(expenses.id, expenseId)))
    .limit(1)

  return row ?? null
}

export async function listTenantBalances(userId: number, month = currentPaymentMonth()) {
  const tenantRows = await listTenantsForUser(userId)
  const paymentRows = await listPaymentsForUser(userId)
  return buildTenantBalances(tenantRows, paymentRows, month)
}

export async function calculateBalanceAfterPayment(params: {
  userId: number
  tenantId: number
  amountPaid: number
  paymentMonth: string
  monthsCovered?: number
  ignorePaymentId?: number
}) {
  const tenantRow = await getTenantForUser(params.userId, params.tenantId)

  if (!tenantRow) {
    return null
  }

  const period = parseMonth(params.paymentMonth)
  const paymentRows = await db
    .select({
      amountPaid: rentPayments.amountPaid,
      paymentMonth: rentPayments.paymentMonth,
      coverageStart: rentPayments.coverageStart,
      coverageEnd: rentPayments.coverageEnd,
      monthsCovered: rentPayments.monthsCovered
    })
    .from(rentPayments)
    .where(
      params.ignorePaymentId
        ? and(
            eq(rentPayments.tenantId, params.tenantId),
            ne(rentPayments.id, params.ignorePaymentId)
          )
        : and(
            eq(rentPayments.tenantId, params.tenantId)
          )
    )
  const alreadyPaid = sum(
    paymentRows.map((payment) => allocatedPaymentForPeriod(payment, period))
  )
  const allocatedCurrentPayment = Math.round(
    params.amountPaid / Math.max(1, params.monthsCovered ?? 1)
  )

  return {
    unitId: tenantRow.unit.id,
    balanceAfterPayment: Math.max(
      tenantRow.unit.rentAmount - alreadyPaid - allocatedCurrentPayment,
      0
    )
  }
}

export async function getDashboardData(userId: number, month = currentPaymentMonth()) {
  const [
    propertyRows,
    unitRows,
    tenantRows,
    paymentRows,
    expenseRows,
  ] = await Promise.all([
    listPropertiesForUser(userId),
    listUnitsForUser(userId),
    listTenantsForUser(userId),
    listPaymentsForUser(userId),
    listExpensesForUser(userId)
  ])

  const tenantBalances = buildTenantBalances(tenantRows, paymentRows, month)
  const monthlyPayments = paymentRows.filter(({ payment }) => getPaymentDateMonth(payment) === month)
  const monthlyExpenses = expenseRows.filter(({ expense }) => getExpenseMonth(expense) === month)
  const activeTenants = tenantRows.filter(({ tenant }) => tenant.active)
  const totalExpected = sum(tenantBalances.map(({ unit }) => unit.rentAmount))
  const totalCollected = sum(paymentRows.map(({ payment }) => payment.amountPaid))
  const collectedThisMonth = sum(monthlyPayments.map(({ payment }) => payment.amountPaid))
  const totalExpenses = sum(expenseRows.map(({ expense }) => expense.amount))
  const expensesThisMonth = sum(monthlyExpenses.map(({ expense }) => expense.amount))
  const totalOutstanding = sum(tenantBalances.map(({ balance }) => balance))

  return {
    month,
    summary: {
      totalProperties: propertyRows.length,
      totalUnits: unitRows.length,
      occupiedUnits: unitRows.filter(({ unit }) => unit.status === 'occupied').length,
      vacantUnits: unitRows.filter(({ unit }) => unit.status === 'vacant').length,
      activeTenants: activeTenants.length,
      paidTenants: tenantBalances.filter(({ paymentStatus }) => paymentStatus === 'paid').length,
      unpaidTenants: tenantBalances.filter(({ paymentStatus }) => paymentStatus !== 'paid').length,
      totalExpected,
      totalCollected,
      collectedThisMonth,
      totalOutstanding,
      totalExpenses,
      expensesThisMonth,
      netProfit: totalCollected - totalExpenses,
      netThisMonth: collectedThisMonth - expensesThisMonth
    },
    properties: propertyRows,
    units: unitRows,
    tenants: tenantRows,
    payments: paymentRows,
    expenses: expenseRows,
    tenantBalances,
    alerts: buildAlerts(tenantBalances, paymentRows, expenseRows),
    recentPayments: paymentRows.slice(0, 5),
    recentExpenses: expenseRows.slice(0, 5)
  }
}

export async function getCalendarData(userId: number) {
  const [tenantRows, paymentRows, expenseRows] = await Promise.all([
    listTenantsForUser(userId),
    listPaymentsForUser(userId),
    listExpensesForUser(userId)
  ])

  return {
    events: buildCalendarEvents(tenantRows, paymentRows, expenseRows),
    alerts: buildAlerts(buildTenantBalances(tenantRows, paymentRows, currentPaymentMonth()), paymentRows, expenseRows)
  }
}
