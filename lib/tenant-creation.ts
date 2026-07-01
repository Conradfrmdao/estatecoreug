import { calculateDueDate, monthFromDate } from './rent-cycle.ts'

export type TenantCreationPlan = {
  unitId: number
  fullName: string
  phone: string
  email: string | null
  moveInDate: Date
  monthsCovered: number
  rentDueDate: Date
  active: boolean
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
  const recordFirstPayment = parseBoolean(body.recordFirstPayment, false)
  const paymentAmount = Number(body.paymentAmount ?? 0)
  const paymentDate = parseDate(body.paymentDate) ?? now
  const paymentMethod = String(body.paymentMethod ?? 'cash').trim() || 'cash'

  if (!unitId || !Number.isInteger(unitId) || unitId < 1 || !fullName || !phone || !moveInDate) {
    throw new Error('Unit, name, phone, and move-in date are required.')
  }

  if (recordFirstPayment && (!Number.isFinite(paymentAmount) || paymentAmount <= 0)) {
    throw new Error('A positive first payment amount is required.')
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
    recordFirstPayment,
    paymentAmount,
    paymentDate,
    paymentMethod
  }
}

export function buildFirstPaymentValues(plan: TenantCreationPlan, tenantId: number, rentAmount: number) {
  const allocatedAmount = Math.round(plan.paymentAmount / plan.monthsCovered)

  return {
    tenantId,
    unitId: plan.unitId,
    amountPaid: plan.paymentAmount,
    balanceAfterPayment: Math.max(rentAmount - allocatedAmount, 0),
    paymentMonth: monthFromDate(plan.moveInDate),
    coverageStart: plan.moveInDate,
    coverageEnd: plan.rentDueDate,
    monthsCovered: plan.monthsCovered,
    paymentDate: plan.paymentDate,
    paymentMethod: plan.paymentMethod,
    notes: `First rent payment covering ${plan.monthsCovered} month${plan.monthsCovered === 1 ? '' : 's'} from move-in.`
  }
}
