import assert from 'node:assert/strict'
import test from 'node:test'
import {
  allocatedPaymentForPeriod,
  allocatedPaymentForBillingPeriod,
  buildPaymentAllocationPlan,
  calculateDueDate,
  calculateNextRentDueDate,
  calculateOutstandingRentThroughDate,
  calculateTenantPeriodBalance,
  dateKeyInTimeZone,
  daysUntilDate,
  isOutstandingRentStatus,
  paymentCoverageDateForPeriod,
  paymentCoveragePeriods,
  PaymentAllocationError,
  paymentBillingPeriods,
  parseMonth,
  scheduledRentDueDateForPeriod
} from '../lib/rent-cycle.ts'

const baseTenant = {
  id: 1,
  unitId: 1,
  fullName: 'Test Tenant',
  phone: '+256700000000',
  email: null,
  moveInDate: new Date('2026-01-10T00:00:00.000Z'),
  billingStartDate: new Date('2026-01-10T00:00:00.000Z'),
  rentDueDate: new Date('2026-02-10T00:00:00.000Z'),
  paymentTiming: 'advance',
  billingCycleMonths: 1,
  active: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z')
}

const baseUnit = {
  id: 1,
  propertyId: 1,
  unitNumber: 'A1',
  rentAmount: 500000,
  status: 'occupied',
  createdAt: new Date('2026-01-01T00:00:00.000Z')
}

test('calculates due dates from move-in date and paid duration', () => {
  assert.equal(
    calculateDueDate(new Date('2026-01-31T00:00:00.000Z'), 1).toISOString().slice(0, 10),
    '2026-02-28'
  )
  assert.equal(
    calculateDueDate(new Date('2026-01-10T00:00:00.000Z'), 12).toISOString().slice(0, 10),
    '2027-01-10'
  )
})

test('allocates multi-month payments across covered months', () => {
  const payment = {
    amountPaid: 1500000,
    paymentMonth: '2026-01',
    coverageStart: new Date('2026-01-10T00:00:00.000Z'),
    coverageEnd: new Date('2026-04-10T00:00:00.000Z'),
    monthsCovered: 3
  }

  assert.equal(allocatedPaymentForPeriod(payment, parseMonth('2026-01')), 500000)
  assert.equal(allocatedPaymentForPeriod(payment, parseMonth('2026-03')), 500000)
  assert.equal(allocatedPaymentForPeriod(payment, parseMonth('2026-04')), 0)
  assert.equal(allocatedPaymentForPeriod(payment, parseMonth('2026-05')), 0)
})

test('allocates top-up payments to the oldest unpaid balance before future rent', () => {
  const firstPayment = buildPaymentAllocationPlan({
    amountPaid: 250000,
    moveInDate: new Date('2026-07-01T00:00:00.000Z'),
    rentAmount: 500000,
    payments: [],
    preferredStartDate: new Date('2026-07-01T00:00:00.000Z')
  })

  assert.equal(firstPayment.paymentMonth, '2026-07')
  assert.deepEqual(firstPayment.allocations, [{
    month: '2026-07',
    amount: 250000,
    rentAmount: 500000,
    balanceAfterAllocation: 250000
  }])
  assert.equal(firstPayment.balanceAfterPayment, 250000)
  assert.equal(firstPayment.nextRentDueDate.toISOString().slice(0, 10), '2026-07-01')

  const topUp = buildPaymentAllocationPlan({
    amountPaid: 300000,
    moveInDate: new Date('2026-07-01T00:00:00.000Z'),
    rentAmount: 500000,
    payments: [{
      amountPaid: 250000,
      paymentMonth: '2026-07',
      coverageStart: new Date('2026-07-01T00:00:00.000Z'),
      coverageEnd: new Date('2026-08-01T00:00:00.000Z'),
      monthsCovered: 1,
      allocations: firstPayment.allocations
    }],
    preferredStartDate: new Date('2026-08-01T00:00:00.000Z')
  })

  assert.equal(topUp.paymentMonth, '2026-07')
  assert.equal(topUp.monthsCovered, 2)
  assert.deepEqual(topUp.allocations, [
    {
      month: '2026-07',
      amount: 250000,
      rentAmount: 500000,
      balanceAfterAllocation: 0
    },
    {
      month: '2026-08',
      amount: 50000,
      rentAmount: 500000,
      balanceAfterAllocation: 450000
    }
  ])
  const topUpPayment = {
    amountPaid: 300000,
    paymentMonth: topUp.paymentMonth,
    coverageStart: topUp.coverageStart,
    coverageEnd: topUp.coverageEnd,
    monthsCovered: topUp.monthsCovered,
    allocations: topUp.allocations
  }

  assert.equal(allocatedPaymentForPeriod(topUpPayment, parseMonth('2026-07')), 250000)
  assert.equal(allocatedPaymentForPeriod(topUpPayment, parseMonth('2026-08')), 50000)
  assert.equal(topUp.balanceAfterPayment, 0)
  assert.equal(topUp.nextRentDueDate.toISOString().slice(0, 10), '2026-08-01')
  assert.equal(
    calculateNextRentDueDate({
      moveInDate: new Date('2026-07-01T00:00:00.000Z'),
      rentAmount: 500000,
      payments: [
        {
          amountPaid: 250000,
          paymentMonth: '2026-07',
          coverageStart: firstPayment.coverageStart,
          coverageEnd: firstPayment.coverageEnd,
          monthsCovered: firstPayment.monthsCovered,
          allocations: firstPayment.allocations
        },
        {
          amountPaid: 300000,
          paymentMonth: '2026-07',
          coverageStart: topUp.coverageStart,
          coverageEnd: topUp.coverageEnd,
          monthsCovered: topUp.monthsCovered,
          allocations: topUp.allocations
        }
      ]
    }).toISOString().slice(0, 10),
    '2026-08-01'
  )
})

test('rejects tiny accidental residual balances instead of saving confusing carry-forward cents', () => {
  const firstPayment = buildPaymentAllocationPlan({
    amountPaid: 250000,
    moveInDate: new Date('2026-07-02T00:00:00.000Z'),
    rentAmount: 350000,
    payments: [],
    preferredStartDate: new Date('2026-07-02T00:00:00.000Z')
  })

  assert.throws(
    () => buildPaymentAllocationPlan({
      amountPaid: 449994,
      moveInDate: new Date('2026-07-02T00:00:00.000Z'),
      rentAmount: 350000,
      payments: [{
        amountPaid: 250000,
        paymentMonth: firstPayment.paymentMonth,
        coverageStart: firstPayment.coverageStart,
        coverageEnd: firstPayment.coverageEnd,
        monthsCovered: firstPayment.monthsCovered,
        allocations: firstPayment.allocations
      }],
      preferredStartDate: firstPayment.nextRentDueDate
    }),
    (error) => error instanceof PaymentAllocationError && /only 6 UGX/.test(error.message)
  )
})

test('lists covered months for multi-month payment calendar views', () => {
  const payment = {
    amountPaid: 1500000,
    paymentMonth: '2026-01',
    coverageStart: new Date('2026-01-31T00:00:00.000Z'),
    coverageEnd: new Date('2026-04-30T00:00:00.000Z'),
    monthsCovered: 3
  }
  const periods = paymentCoveragePeriods(payment)

  assert.deepEqual(periods.map((period) => period.month), ['2026-01', '2026-02', '2026-03'])
  assert.equal(paymentCoverageDateForPeriod(payment, periods[0]).toISOString().slice(0, 10), '2026-01-31')
  assert.equal(paymentCoverageDateForPeriod(payment, periods[1]).toISOString().slice(0, 10), '2026-02-28')
  assert.equal(allocatedPaymentForPeriod(payment, periods[1]), 500000)
  assert.equal(allocatedPaymentForPeriod(payment, parseMonth('2026-04')), 0)
})

test('marks covered tenant as paid and partial tenant as partial', () => {
  const paid = calculateTenantPeriodBalance(
    { tenant: baseTenant, unit: baseUnit },
    [{
      amountPaid: 500000,
      paymentMonth: '2026-01',
      coverageStart: new Date('2026-01-10T00:00:00.000Z'),
      coverageEnd: new Date('2026-02-10T00:00:00.000Z'),
      monthsCovered: 1
    }],
    parseMonth('2026-01'),
    new Date('2026-01-15T00:00:00.000Z')
  )
  const partial = calculateTenantPeriodBalance(
    { tenant: baseTenant, unit: baseUnit },
    [{
      amountPaid: 200000,
      paymentMonth: '2026-01',
      coverageStart: new Date('2026-01-10T00:00:00.000Z'),
      coverageEnd: new Date('2026-02-10T00:00:00.000Z'),
      monthsCovered: 1
    }],
    parseMonth('2026-01'),
    new Date('2026-01-15T00:00:00.000Z')
  )

  assert.equal(paid?.paymentStatus, 'paid')
  assert.equal(paid?.balance, 0)
  assert.equal(partial?.paymentStatus, 'partial')
  assert.equal(partial?.balance, 300000)
})

test('falls back to paymentMonth for legacy payments without coverage', () => {
  const legacyPayment = {
    amountPaid: 500000,
    paymentMonth: '2026-02',
    coverageStart: null,
    coverageEnd: null,
    monthsCovered: 1
  }

  assert.equal(allocatedPaymentForPeriod(legacyPayment, parseMonth('2026-02')), 500000)
  assert.equal(allocatedPaymentForPeriod(legacyPayment, parseMonth('2026-03')), 0)
})

test('marks unpaid tenants as due today, upcoming, or overdue for alerts', () => {
  const dueToday = calculateTenantPeriodBalance(
    { tenant: { ...baseTenant, rentDueDate: new Date('2026-02-10T00:00:00.000Z') }, unit: baseUnit },
    [],
    parseMonth('2026-02'),
    new Date('2026-02-10T00:00:00.000Z')
  )
  const upcoming = calculateTenantPeriodBalance(
    { tenant: { ...baseTenant, rentDueDate: new Date('2026-02-15T00:00:00.000Z') }, unit: baseUnit },
    [],
    parseMonth('2026-02'),
    new Date('2026-02-10T00:00:00.000Z')
  )
  const overdue = calculateTenantPeriodBalance(
    { tenant: { ...baseTenant, rentDueDate: new Date('2026-02-05T00:00:00.000Z') }, unit: baseUnit },
    [],
    parseMonth('2026-02'),
    new Date('2026-02-10T00:00:00.000Z')
  )

  assert.equal(dueToday?.paymentStatus, 'due_today')
  assert.equal(upcoming?.paymentStatus, 'upcoming')
  assert.equal(overdue?.paymentStatus, 'overdue')
})

test('counts days left using the Kampala calendar day', () => {
  const dueDate = new Date('2026-10-01T00:00:00.000Z')
  const julyFirstKampala = new Date('2026-07-01T12:00:00.000Z')
  const julySecondKampala = new Date('2026-07-01T22:30:00.000Z')
  const fourDaysLeftKampala = new Date('2026-09-26T22:30:00.000Z')

  assert.equal(dateKeyInTimeZone(julyFirstKampala), '2026-07-01')
  assert.equal(daysUntilDate(dueDate, julyFirstKampala), 92)
  assert.equal(dateKeyInTimeZone(julySecondKampala), '2026-07-02')
  assert.equal(daysUntilDate(dueDate, julySecondKampala), 91)
  assert.equal(daysUntilDate(dueDate, fourDaysLeftKampala), 4)

  const balance = calculateTenantPeriodBalance(
    {
      tenant: {
        ...baseTenant,
        rentDueDate: dueDate,
        paymentTiming: 'arrears',
        billingCycleMonths: 9
      },
      unit: baseUnit
    },
    [],
    parseMonth('2026-09'),
    julySecondKampala
  )

  assert.equal(balance?.daysUntilDue, 91)
  assert.equal(balance?.paymentStatus, 'not_due')
})

test('keeps end-of-period rent not due until the agreed date', () => {
  const tenant = {
    ...baseTenant,
    moveInDate: new Date('2026-07-01T00:00:00.000Z'),
    billingStartDate: new Date('2026-07-01T00:00:00.000Z'),
    rentDueDate: new Date('2026-08-01T00:00:00.000Z'),
    paymentTiming: 'arrears',
    billingCycleMonths: 1
  }
  const beforeDue = calculateTenantPeriodBalance(
    { tenant, unit: baseUnit },
    [],
    parseMonth('2026-07'),
    new Date('2026-07-16T00:00:00.000Z')
  )
  const dueToday = calculateTenantPeriodBalance(
    { tenant, unit: baseUnit },
    [],
    parseMonth('2026-07'),
    new Date('2026-08-01T00:00:00.000Z')
  )

  assert.equal(beforeDue?.paymentStatus, 'not_due')
  assert.equal(isOutstandingRentStatus(beforeDue?.paymentStatus ?? 'unpaid'), false)
  assert.equal(beforeDue?.dueDate.toISOString().slice(0, 10), '2026-08-01')
  assert.equal(dueToday?.paymentStatus, 'due_today')
  assert.equal(isOutstandingRentStatus(dueToday?.paymentStatus ?? 'not_due'), true)
})

test('accumulates every unpaid advance period whose due date has passed', () => {
  const tenant = {
    ...baseTenant,
    moveInDate: new Date('2026-01-30T00:00:00.000Z'),
    billingStartDate: new Date('2026-01-30T00:00:00.000Z'),
    rentDueDate: new Date('2026-01-30T00:00:00.000Z'),
    paymentTiming: 'advance'
  }
  const outstanding = calculateOutstandingRentThroughDate(
    { tenant, unit: { ...baseUnit, rentAmount: 200000 } },
    [],
    new Date('2026-07-17T12:00:00.000Z')
  )

  assert.equal(outstanding.periods, 6)
  assert.equal(outstanding.balance, 1200000)
  assert.equal(outstanding.oldestDueDate?.toISOString().slice(0, 10), '2026-01-30')
})

test('keeps a future schedule date while move-in rent remains outstanding', () => {
  const tenant = {
    ...baseTenant,
    moveInDate: new Date('2026-06-30T00:00:00.000Z'),
    billingStartDate: new Date('2026-06-30T00:00:00.000Z'),
    rentDueDate: new Date('2026-07-30T00:00:00.000Z'),
    paymentTiming: 'advance'
  }
  const outstanding = calculateOutstandingRentThroughDate(
    { tenant, unit: { ...baseUnit, rentAmount: 850000 } },
    [],
    new Date('2026-07-17T12:00:00.000Z')
  )

  assert.equal(outstanding.periods, 1)
  assert.equal(outstanding.balance, 850000)
  assert.equal(outstanding.oldestDueDate?.toISOString().slice(0, 10), '2026-06-30')
  assert.equal(tenant.rentDueDate.toISOString().slice(0, 10), '2026-07-30')
})

test('labels a June 30 to July 30 rent cycle as July without shifting coverage', () => {
  const moveInDate = new Date('2026-06-30T00:00:00.000Z')
  const billingStartDate = moveInDate
  const tenant = {
    ...baseTenant,
    moveInDate,
    billingStartDate,
    rentDueDate: new Date('2026-07-30T00:00:00.000Z'),
    paymentTiming: 'advance'
  }
  const balance = calculateTenantPeriodBalance(
    { tenant, unit: { ...baseUnit, rentAmount: 850000 } },
    [],
    parseMonth('2026-06'),
    new Date('2026-07-18T12:00:00.000Z')
  )
  const outstanding = calculateOutstandingRentThroughDate(
    { tenant, unit: { ...baseUnit, rentAmount: 850000 } },
    [],
    new Date('2026-07-18T12:00:00.000Z')
  )
  const payment = buildPaymentAllocationPlan({
    amountPaid: 850000,
    moveInDate,
    billingStartDate,
    rentAmount: 850000,
    payments: [],
    preferredStartDate: tenant.rentDueDate
  })
  const recordedPayment = { ...payment, amountPaid: 850000 }

  assert.equal(balance?.paymentStatus, 'overdue')
  assert.equal(balance?.dueDate.toISOString().slice(0, 10), '2026-06-30')
  assert.equal(outstanding.periods, 1)
  assert.equal(outstanding.balance, 850000)
  assert.equal(outstanding.oldestDueDate?.toISOString().slice(0, 10), '2026-06-30')
  assert.equal(payment.paymentMonth, '2026-07')
  assert.equal(payment.coverageStart.toISOString().slice(0, 10), '2026-06-30')
  assert.equal(payment.nextRentDueDate.toISOString().slice(0, 10), '2026-07-30')
  assert.equal(allocatedPaymentForPeriod(recordedPayment, parseMonth('2026-06')), 850000)
  assert.equal(allocatedPaymentForBillingPeriod(recordedPayment, parseMonth('2026-07')), 850000)
  assert.equal(allocatedPaymentForBillingPeriod(recordedPayment, parseMonth('2026-06')), 0)
  assert.deepEqual(paymentBillingPeriods(recordedPayment).map((period) => period.month), ['2026-07'])
})

test('does not count a genuine arrears cycle before its end date', () => {
  const tenant = {
    ...baseTenant,
    moveInDate: new Date('2026-05-30T00:00:00.000Z'),
    billingStartDate: new Date('2026-05-30T00:00:00.000Z'),
    rentDueDate: new Date('2026-07-30T00:00:00.000Z'),
    paymentTiming: 'arrears',
    billingCycleMonths: 2
  }
  const beforeDue = calculateOutstandingRentThroughDate(
    { tenant, unit: { ...baseUnit, rentAmount: 300000 } },
    [],
    new Date('2026-07-17T12:00:00.000Z')
  )
  const afterDue = calculateOutstandingRentThroughDate(
    { tenant, unit: { ...baseUnit, rentAmount: 300000 } },
    [],
    new Date('2026-07-30T12:00:00.000Z')
  )

  assert.equal(beforeDue.balance, 0)
  assert.equal(beforeDue.periods, 0)
  assert.equal(afterDue.balance, 600000)
  assert.equal(afterDue.periods, 2)
})

test('only exposes currently payable rent statuses to the payment picker', () => {
  assert.equal(isOutstandingRentStatus('paid'), false)
  assert.equal(isOutstandingRentStatus('not_due'), false)
  assert.equal(isOutstandingRentStatus('upcoming'), false)
  assert.equal(isOutstandingRentStatus('partial'), true)
  assert.equal(isOutstandingRentStatus('unpaid'), true)
  assert.equal(isOutstandingRentStatus('due_today'), true)
  assert.equal(isOutstandingRentStatus('overdue'), true)
})

test('does not classify the next scheduled rent as outstanding after a full payment', () => {
  const moveInDate = new Date('2026-06-30T00:00:00.000Z')
  const payment = buildPaymentAllocationPlan({
    amountPaid: 4200000,
    moveInDate,
    rentAmount: 4200000,
    payments: [],
    preferredStartDate: moveInDate
  })
  const balance = calculateTenantPeriodBalance(
    {
      tenant: {
        ...baseTenant,
        moveInDate,
        billingStartDate: moveInDate,
        rentDueDate: payment.nextRentDueDate
      },
      unit: { ...baseUnit, rentAmount: 4200000 }
    },
    [{
      amountPaid: 4200000,
      paymentMonth: payment.paymentMonth,
      coverageStart: payment.coverageStart,
      coverageEnd: payment.coverageEnd,
      monthsCovered: payment.monthsCovered,
      allocations: payment.allocations
    }],
    parseMonth('2026-07'),
    new Date('2026-07-17T12:00:00.000Z')
  )

  assert.equal(payment.balanceAfterPayment, 0)
  assert.equal(payment.nextRentDueDate.toISOString().slice(0, 10), '2026-07-30')
  assert.equal(balance?.balance, 4200000)
  assert.equal(balance?.paymentStatus, 'not_due')
  assert.equal(isOutstandingRentStatus(balance?.paymentStatus ?? 'unpaid'), false)
})

test('preserves a three-month arrears due date after partial and complete payments', () => {
  const moveInDate = new Date('2026-07-01T00:00:00.000Z')
  const terms = { paymentTiming: 'arrears' as const, billingCycleMonths: 3 }
  const partial = buildPaymentAllocationPlan({
    amountPaid: 500000,
    moveInDate,
    rentAmount: 500000,
    payments: []
  })
  const complete = buildPaymentAllocationPlan({
    amountPaid: 1500000,
    moveInDate,
    rentAmount: 500000,
    payments: []
  })

  assert.equal(
    scheduledRentDueDateForPeriod(
      moveInDate,
      parseMonth(partial.nextRentDueDate.toISOString().slice(0, 7)),
      terms
    ).toISOString().slice(0, 10),
    '2026-10-01'
  )
  assert.equal(
    scheduledRentDueDateForPeriod(
      moveInDate,
      parseMonth(complete.nextRentDueDate.toISOString().slice(0, 7)),
      terms
    ).toISOString().slice(0, 10),
    '2027-01-01'
  )
})
