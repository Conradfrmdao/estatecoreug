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
  type Unit
} from '@/drizzle/schema'
import { db } from '@/lib/db'
import { currentPaymentMonth } from '@/lib/format'
import { and, desc, eq } from 'drizzle-orm'

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
  paymentStatus: 'paid' | 'partial' | 'unpaid'
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

function getExpenseMonth(expense: Expense) {
  return expense.expenseDate.toISOString().slice(0, 7)
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
  const activeTenants = tenantRows.filter(({ tenant }) => tenant.active)
  const paidByTenant = new Map<number, number>()

  for (const { payment } of paymentRows) {
    if (payment.paymentMonth !== month) {
      continue
    }

    paidByTenant.set(
      payment.tenantId,
      (paidByTenant.get(payment.tenantId) ?? 0) + payment.amountPaid
    )
  }

  return activeTenants.map((row) => {
    const amountPaid = paidByTenant.get(row.tenant.id) ?? 0
    const balance = Math.max(row.unit.rentAmount - amountPaid, 0)
    const paymentStatus =
      balance <= 0 ? 'paid' : amountPaid > 0 ? 'partial' : 'unpaid'

    return {
      ...row,
      amountPaid,
      balance,
      paymentStatus
    } satisfies TenantBalance
  })
}

export async function calculateBalanceAfterPayment(params: {
  userId: number
  tenantId: number
  amountPaid: number
  paymentMonth: string
  ignorePaymentId?: number
}) {
  const tenantRow = await getTenantForUser(params.userId, params.tenantId)

  if (!tenantRow) {
    return null
  }

  const paymentRows = await listPaymentsForUser(params.userId)
  const alreadyPaid = sum(
    paymentRows
      .filter(({ payment }) => {
        if (payment.tenantId !== params.tenantId) {
          return false
        }

        if (payment.paymentMonth !== params.paymentMonth) {
          return false
        }

        return payment.id !== params.ignorePaymentId
      })
      .map(({ payment }) => payment.amountPaid)
  )

  return {
    unitId: tenantRow.unit.id,
    balanceAfterPayment: Math.max(
      tenantRow.unit.rentAmount - alreadyPaid - params.amountPaid,
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
    tenantBalances
  ] = await Promise.all([
    listPropertiesForUser(userId),
    listUnitsForUser(userId),
    listTenantsForUser(userId),
    listPaymentsForUser(userId),
    listExpensesForUser(userId),
    listTenantBalances(userId, month)
  ])

  const monthlyPayments = paymentRows.filter(({ payment }) => payment.paymentMonth === month)
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
    recentPayments: paymentRows.slice(0, 5),
    recentExpenses: expenseRows.slice(0, 5)
  }
}
