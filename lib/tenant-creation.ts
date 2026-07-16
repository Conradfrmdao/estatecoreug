import { buildPaymentAllocationPlan, calculateDueDate, type PaymentTiming } from './rent-cycle.ts'
import { parseMoneyAmount } from './money.ts'

export type TenantCreationPlan = {
  unitId: number
  fullName: string
  phone: string
  email: string | null
  moveInDate: Date
  monthsCovered: number
  rentDueDate: Date
  active: boolean
  paymentTiming: PaymentTiming
  recordFirstPayment: boolean
  paymentAmount: number
  paymentDate: Date
  paymentMethod: string
}

function parseDate(value: unknown) {
  if (!value) {
    return null
  }

  const date = new Date(String(value))
  return Number.isNaN(date.valueOf()) ? null : date
}

function parsePositiveInteger(value: unknown, fallback: number) {
  const number = Number(value ?? fallback)
  if (!Number.isFinite(number)) {
    return fallback
  }

  return Math.max(1, Math.trunc(number))
}

function parseBoolean(value: unknown, fallback: boolean) {
  if (typeof value === 'boolean') {
    return value
  }

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return fallback
}

export function planTenantCreation(body: Record<string, unknown>, now = new Date()): TenantCreationPlan {
  const unitId = Number(body.unitId)
  const fullName = String(body.fullName ?? '').trim()
  const phone = String(body.phone ?? '').trim()
  const email = body.email ? String(body.email).trim() : null
  const moveInDate = parseDate(body.moveInDate)
  const monthsCovered = parsePositiveInteger(body.monthsCovered, 1)
  const active = parseBoolean(body.active, true)
  const requestedFirstPayment = parseBoolean(body.recordFirstPayment, false)
  const paymentTiming: PaymentTiming = body.paymentTiming === 'advance' || body.paymentTiming === 'arrears'
    ? body.paymentTiming
    : requestedFirstPayment ? 'advance' : 'arrears'
  const recordFirstPayment = paymentTiming === 'advance'
  const paymentAmount = recordFirstPayment
    ? parseMoneyAmount(body.paymentAmount, 'First payment amount')
    : 0
  const paymentDate = parseDate(body.paymentDate) ?? now
  const paymentMethod = String(body.paymentMethod ?? 'cash').trim() || 'cash'

  if (!unitId || !Number.isInteger(unitId) || unitId < 1 || !fullName || !phone || !moveInDate) {
    throw new Error('Unit, name, phone, and move-in date are required.')
  }

  return {
    unitId,
    fullName,
    phone,
    email,
    moveInDate,
    monthsCovered,
    rentDueDate: calculateDueDate(moveInDate, monthsCovered),
    active,
    paymentTiming,
    recordFirstPayment,
    paymentAmount,
    paymentDate,
    paymentMethod
  }
}

export function buildFirstPaymentPlan(plan: TenantCreationPlan, tenantId: number, rentAmount: number) {
  const allocation = buildPaymentAllocationPlan({
    amountPaid: plan.paymentAmount,
    moveInDate: plan.moveInDate,
    rentAmount,
    payments: [],
    preferredStartDate: plan.moveInDate
  })

  return {
    nextRentDueDate: allocation.nextRentDueDate,
    paymentValues: {
      tenantId,
      unitId: plan.unitId,
      amountPaid: plan.paymentAmount,
      balanceAfterPayment: allocation.balanceAfterPayment,
      paymentMonth: allocation.paymentMonth,
      coverageStart: allocation.coverageStart,
      coverageEnd: allocation.coverageEnd,
      monthsCovered: allocation.monthsCovered,
      allocations: allocation.allocations,
      paymentDate: plan.paymentDate,
      paymentMethod: plan.paymentMethod,
      notes: `First rent payment from move-in.`
    }
  }
}

export function buildFirstPaymentValues(plan: TenantCreationPlan, tenantId: number, rentAmount: number) {
  return buildFirstPaymentPlan(plan, tenantId, rentAmount).paymentValues
}
