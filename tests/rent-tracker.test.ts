import assert from 'node:assert/strict'
import test from 'node:test'
import { buildRentTracker, paymentByBillingMonth } from '../lib/rent-tracker.ts'
import { buildTenantBalances } from '../lib/tenant-balances.ts'

const created = new Date('2026-01-01T00:00:00.000Z')
const plaza = { id: 1, userId: 1, name: 'Nkrumah Plaza', location: 'Kampala', createdAt: created }
const court = { id: 2, userId: 1, name: 'Acacia Court', location: 'Entebbe', createdAt: created }
const today = new Date('2026-09-26T09:00:00.000Z')

function unitOf(id: number, unitNumber: string, property = plaza, rentAmount = 500000) {
  return { id, propertyId: property.id, unitNumber, rentAmount, status: 'occupied', createdAt: created }
}

/** A tenant who moved in on `day` June. Pay-at-the-end tenants owe each month's rent at its close. */
function tenantIn(
  id: number,
  unit: ReturnType<typeof unitOf>,
  options: { day: number; timing: 'advance' | 'arrears'; dueDate?: string }
) {
  const moveIn = new Date(Date.UTC(2026, 5, options.day))
  return {
    tenant: {
      id,
      unitId: unit.id,
      fullName: `Tenant ${id}`,
      phone: '+256700000000',
      email: null,
      moveInDate: moveIn,
      billingStartDate: moveIn,
      rentDueDate: options.dueDate ? new Date(`${options.dueDate}T00:00:00.000Z`) : moveIn,
      paymentTiming: options.timing,
      billingCycleMonths: 1,
      active: true,
      createdAt: moveIn
    },
    unit,
    property: unit.propertyId === court.id ? court : plaza
  }
}

let nextPaymentId = 1

/** A payment for the stored rent periods `months`, a full rent each unless `amounts` says otherwise. */
function paymentFor(
  tenantId: number,
  months: string[],
  dueDay: number,
  paymentDate: string,
  amounts: number[] = months.map(() => 500000)
) {
  const [year, month] = months[0].split('-').map(Number)
  return {
    payment: {
      id: nextPaymentId++,
      tenantId,
      unitId: 1,
      amountPaid: amounts.reduce((total, amount) => total + amount, 0),
      balanceAfterPayment: 0,
      paymentMonth: months[0],
      coverageStart: new Date(Date.UTC(year, month - 1, dueDay)),
      coverageEnd: new Date(Date.UTC(year, month - 1 + months.length, dueDay)),
      monthsCovered: months.length,
      allocations: months.map((entry, index) => ({
        month: entry,
        amount: amounts[index],
        rentAmount: 500000,
        balanceAfterAllocation: 500000 - amounts[index]
      })),
      paymentDate: new Date(paymentDate),
      paymentMethod: 'cash',
      notes: null,
      createdAt: new Date(paymentDate)
    }
  }
}

function tracker(
  tenants: ReturnType<typeof tenantIn>[],
  payments: ReturnType<typeof paymentFor>[],
  units = tenants.map((row) => row.unit),
  properties = [plaza],
  month = '2026-09'
) {
  return buildRentTracker({
    properties: properties as any,
    units: units.map((unit) => ({ unit, property: unit.propertyId === court.id ? court : plaza })) as any,
    tenants: tenants as any,
    payments: payments as any,
    month,
    referenceDate: today
  })
}

test('someone who pays at the end of the month is not late before their day', () => {
  // Stored period June (30 Jun - 30 Jul) is July's rent; July is August's.
  const row = tenantIn(1, unitOf(1, 'A1'), { day: 30, timing: 'arrears', dueDate: '2026-09-30' })
  const report = tracker([row], [paymentFor(1, ['2026-06', '2026-07'], 30, '2026-08-30T09:00:00.000Z')])
  const [tenant] = report.properties[0].units[0].tenants

  assert.equal(tenant.paymentTiming, 'arrears')
  assert.equal(tenant.dueDate, '2026-09-30')
  assert.equal(tenant.status, 'not_yet')
  assert.equal(tenant.overdue, false)
  assert.equal(tenant.left, 500000)
  assert.equal(tenant.earlierOwed, 0)
  assert.equal(report.totals.dueBy, '2026-09-30')
  assert.equal(report.totals.lateCount, 0)
  assert.equal(report.timing, 'current')
})

test('the same tenant is late once their day has passed', () => {
  // Only July is paid, so the app holds their next due date at 30 August.
  const row = tenantIn(1, unitOf(1, 'A1'), { day: 30, timing: 'arrears', dueDate: '2026-08-30' })
  const report = tracker([row], [paymentFor(1, ['2026-06'], 30, '2026-07-30T09:00:00.000Z')], undefined, undefined, '2026-08')
  const [tenant] = report.properties[0].units[0].tenants

  assert.equal(report.timing, 'past')
  assert.equal(tenant.dueDate, '2026-08-30')
  assert.equal(tenant.status, 'late')
  assert.equal(tenant.overdue, true)
  assert.equal(report.totals.lateCount, 1)
  assert.equal(report.totals.lateAmount, 500000)
})

test('money handed over this month that cleared last month is explained, not counted twice', () => {
  const row = tenantIn(1, unitOf(1, 'A1'), { day: 30, timing: 'arrears', dueDate: '2026-09-30' })
  const payments = [
    paymentFor(1, ['2026-06'], 30, '2026-07-30T09:00:00.000Z'),
    // Handed over on 3 September, but it was August's rent.
    paymentFor(1, ['2026-07'], 30, '2026-09-03T09:00:00.000Z')
  ]
  const [tenant] = tracker([row], payments).properties[0].units[0].tenants

  assert.equal(tenant.paid, 0)
  assert.equal(tenant.status, 'not_yet')
  assert.equal(tenant.receivedInMonth, 500000)
  assert.deepEqual(tenant.appliedToEarlier, [{ month: '2026-08', amount: 500000 }])
  assert.deepEqual(tenant.appliedAhead, [])
  assert.deepEqual(tenant.paidOn, [])
})

test('rent still owed for earlier months is shown on its own', () => {
  const row = tenantIn(1, unitOf(1, 'A1'), { day: 30, timing: 'arrears', dueDate: '2026-08-30' })
  // July is paid; August's rent (due 30 Aug) never came.
  const [tenant] = tracker([row], [paymentFor(1, ['2026-06'], 30, '2026-07-30T09:00:00.000Z')]).properties[0].units[0].tenants

  assert.equal(tenant.earlierOwed, 500000)
  assert.deepEqual(tenant.earlierOwedMonths, [{ month: '2026-08', amount: 500000 }])
  assert.equal(tenant.left, 500000)
})

test('those who pay at the start of the month are paid, part paid, or late after their day', () => {
  const paid = tenantIn(1, unitOf(1, 'A1'), { day: 4, timing: 'advance' })
  const part = tenantIn(2, unitOf(2, 'A2'), { day: 4, timing: 'advance' })
  const none = tenantIn(3, unitOf(3, 'A3'), { day: 4, timing: 'advance' })
  const payments = [
    paymentFor(1, ['2026-06', '2026-07', '2026-08', '2026-09'], 4, '2026-06-04T09:00:00.000Z'),
    paymentFor(2, ['2026-06', '2026-07', '2026-08'], 4, '2026-06-04T09:00:00.000Z'),
    paymentFor(2, ['2026-09'], 4, '2026-09-05T09:00:00.000Z', [200000]),
    paymentFor(3, ['2026-06', '2026-07', '2026-08'], 4, '2026-06-04T09:00:00.000Z')
  ]
  const report = tracker([paid, part, none], payments)
  const byId = new Map(report.properties[0].units.flatMap((unit) => unit.tenants).map((row) => [row.tenantId, row]))

  assert.equal(byId.get(1)?.status, 'paid')
  assert.deepEqual(byId.get(1)?.paidOn, ['2026-06-04'])
  assert.equal(byId.get(2)?.status, 'part_paid')
  assert.equal(byId.get(2)?.overdue, true)
  assert.equal(byId.get(2)?.left, 300000)
  assert.deepEqual(byId.get(2)?.paidOn, ['2026-09-05'])
  assert.equal(byId.get(3)?.status, 'late')

  assert.equal(report.totals.expected, 1500000)
  assert.equal(report.totals.paid, 700000)
  assert.equal(report.totals.left, 800000)
  assert.equal(report.totals.paidCount, 1)
  assert.equal(report.totals.partCount, 1)
  assert.equal(report.totals.notYetCount, 1)
  assert.equal(report.totals.owingCount, 2)
  assert.equal(report.totals.lateCount, 2)
  assert.equal(report.totals.dueBy, '2026-09-04')
})

test('the tracker agrees with the balances every other screen uses', () => {
  const rows = [
    tenantIn(1, unitOf(1, 'A1'), { day: 4, timing: 'advance' }),
    tenantIn(2, unitOf(2, 'A2'), { day: 30, timing: 'arrears', dueDate: '2026-09-30' })
  ]
  const payments = [
    paymentFor(1, ['2026-06', '2026-07', '2026-08'], 4, '2026-06-04T09:00:00.000Z'),
    paymentFor(1, ['2026-09'], 4, '2026-09-02T09:00:00.000Z', [350000]),
    paymentFor(2, ['2026-06', '2026-07', '2026-08'], 30, '2026-09-01T09:00:00.000Z')
  ]
  const trackerRows = tracker(rows, payments).properties[0].units.flatMap((unit) => unit.tenants)
  const balances = buildTenantBalances(rows as any, payments as any, '2026-09', today)

  for (const balance of balances) {
    const row = trackerRows.find((entry) => entry.tenantId === balance.tenant.id)
    assert.equal(row?.paid, balance.amountPaid)
    assert.equal(row?.left, balance.balance)
    assert.equal(row?.daysUntilDue, balance.daysUntilDue)
  }
})

test('tenants are arranged property, unit, tenant - with empty units set aside', () => {
  const a2 = unitOf(2, 'A2')
  const a10 = unitOf(10, 'A10')
  const b1 = unitOf(3, 'B1', court)
  const empty = unitOf(4, 'A3')
  const rows = [
    tenantIn(1, a10, { day: 4, timing: 'advance' }),
    tenantIn(2, a2, { day: 4, timing: 'advance' }),
    tenantIn(3, b1, { day: 30, timing: 'arrears', dueDate: '2026-09-30' })
  ]
  const report = tracker(rows, [], [a2, a10, b1, empty], [plaza, court])

  assert.deepEqual(report.properties.map((property) => property.name), ['Acacia Court', 'Nkrumah Plaza'])
  const [courtRows, plazaRows] = report.properties
  assert.deepEqual(plazaRows.units.map((unit) => unit.unitNumber), ['A2', 'A10'])
  assert.deepEqual(plazaRows.emptyUnits.map((unit) => unit.unitNumber), ['A3'])
  assert.equal(courtRows.totals.tenants, 1)
  assert.equal(plazaRows.totals.tenants, 2)
  assert.equal(courtRows.totals.expected + plazaRows.totals.expected, report.totals.expected)

  // Those who pay at the start of the month come first.
  assert.deepEqual(report.totals.byTiming.map((group) => group.timing), ['advance', 'arrears'])
  assert.equal(report.totals.byTiming[0].tenants, 2)
  assert.equal(report.totals.byTiming[1].lastDue, '2026-09-30')
  assert.deepEqual(
    report.totals.dueDates.map((day) => [day.date, day.timing, day.tenants]),
    [['2026-09-04', 'advance', 2], ['2026-09-30', 'arrears', 1]]
  )
})

test('a payment is shared out by the month its rent is for, adding up to what was paid', () => {
  const moveIn = new Date('2026-06-30T00:00:00.000Z')
  const { payment } = paymentFor(1, ['2026-07', '2026-08'], 30, '2026-09-03T09:00:00.000Z', [500000, 250000])
  const shares = paymentByBillingMonth(payment as any, moveIn)

  assert.deepEqual(Array.from(shares), [['2026-08', 500000], ['2026-09', 250000]])
  assert.equal(Array.from(shares.values()).reduce((total, amount) => total + amount, 0), payment.amountPaid)
})

test('the notes say where money went and what is still owed from before', async () => {
  const { rentTrackerNotes, statusLabel, rentTrackerRowMatches } = await import('../lib/rent-tracker-labels.ts')
  const row = tenantIn(1, unitOf(1, 'A1'), { day: 30, timing: 'arrears', dueDate: '2026-08-30' })
  const payments = [
    paymentFor(1, ['2026-05'], 30, '2026-06-30T09:00:00.000Z'),
    // July's rent, handed over in September; August's never came.
    paymentFor(1, ['2026-06'], 30, '2026-09-03T09:00:00.000Z')
  ]
  const [tenant] = tracker([row], payments).properties[0].units[0].tenants

  assert.deepEqual(rentTrackerNotes(tenant, '2026-09'), [
    'UGX 500,000 handed over in September paid for July.',
    'Also owes UGX 500,000 for August.'
  ])
  assert.equal(statusLabel(tenant), 'Not paid yet')
  assert.equal(rentTrackerRowMatches(tenant, 'owing'), true)
  assert.equal(rentTrackerRowMatches(tenant, 'paid'), false)
  assert.equal(rentTrackerRowMatches(tenant, 'late'), false)
})
