import fs from 'node:fs'
import path from 'node:path'
import { Client } from 'pg'

function loadEnvLocal() {
  const filePath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(filePath)) {
    return
  }

  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match) {
      continue
    }

    const key = match[1]
    let value = match[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    process.env[key] ||= value
  }
}

async function countRows(client, table, where, values) {
  const result = await client.query(`select count(*)::int as count from ${table} where ${where}`, values)
  return result.rows[0].count
}

function assertCount(label, count) {
  if (count !== 0) {
    throw new Error(`${label} expected 0 rows after delete, got ${count}`)
  }
}

loadEnvLocal()

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not configured.')
}

const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

await client.connect()

try {
  const duplicateActiveTenants = await client.query(
    `select unit_id, count(*)::int as count
     from tenants
     where active = true
     group by unit_id
     having count(*) > 1`
  )

  if (duplicateActiveTenants.rows.length > 0) {
    throw new Error('Cannot add active-tenant guard while duplicate active tenants already exist.')
  }

  await client.query(
    `create unique index if not exists tenants_one_active_per_unit_idx
     on tenants (unit_id)
     where active = true`
  )

  await client.query('begin')

  const user = await client.query(
    `insert into users (clerk_id, name, email, role, account_status)
     values ($1, $2, $3, 'landlord', 'approved')
     returning id`,
    [`smoke_${suffix}`, 'Smoke Test User', `smoke-${suffix}@example.invalid`]
  )
  const userId = user.rows[0].id

  const property = await client.query(
    `insert into properties (user_id, name, location)
     values ($1, 'Cascade Property', 'Kampala')
     returning id`,
    [userId]
  )
  const propertyId = property.rows[0].id

  const unit = await client.query(
    `insert into units (property_id, unit_number, rent_amount, status)
     values ($1, 'A1', 500000, 'occupied')
     returning id`,
    [propertyId]
  )
  const unitId = unit.rows[0].id

  const tenant = await client.query(
    `insert into tenants (unit_id, full_name, phone, move_in_date, rent_due_date, active)
     values ($1, 'Smoke Tenant', '+256700000000', '2026-07-01', '2026-08-01', true)
     returning id`,
    [unitId]
  )
  const tenantId = tenant.rows[0].id

  await client.query('savepoint duplicate_active_tenant_guard')
  try {
    await client.query(
      `insert into tenants (unit_id, full_name, phone, move_in_date, rent_due_date, active)
       values ($1, 'Duplicate Smoke Tenant', '+256700000099', '2026-07-01', '2026-08-01', true)`,
      [unitId]
    )
    throw new Error('Database allowed a second active tenant in the same unit.')
  } catch (error) {
    await client.query('rollback to savepoint duplicate_active_tenant_guard')
    if (!(typeof error === 'object' && error && 'code' in error && error.code === '23505')) {
      throw error
    }
  }

  await client.query(
    `insert into rent_payments
      (tenant_id, unit_id, amount_paid, balance_after_payment, payment_month, coverage_start, coverage_end, months_covered, payment_method)
     values ($1, $2, 500000, 0, '2026-07', '2026-07-01', '2026-08-01', 1, 'cash')`,
    [tenantId, unitId]
  )
  await client.query(
    `insert into expenses (property_id, unit_id, title, category, amount, expense_date)
     values ($1, $2, 'Smoke Expense', 'maintenance', 10000, '2026-07-01')`,
    [propertyId, unitId]
  )

  await client.query('delete from properties where id = $1', [propertyId])
  assertCount('units by property', await countRows(client, 'units', 'property_id = $1', [propertyId]))
  assertCount('tenants by unit', await countRows(client, 'tenants', 'unit_id = $1', [unitId]))
  assertCount('payments by unit', await countRows(client, 'rent_payments', 'unit_id = $1', [unitId]))
  assertCount('expenses by property', await countRows(client, 'expenses', 'property_id = $1', [propertyId]))

  const propertyTwo = await client.query(
    `insert into properties (user_id, name, location)
     values ($1, 'Unit Cascade Property', 'Kampala')
     returning id`,
    [userId]
  )
  const propertyTwoId = propertyTwo.rows[0].id
  const unitTwo = await client.query(
    `insert into units (property_id, unit_number, rent_amount, status)
     values ($1, 'B1', 600000, 'occupied')
     returning id`,
    [propertyTwoId]
  )
  const unitTwoId = unitTwo.rows[0].id
  const tenantTwo = await client.query(
    `insert into tenants (unit_id, full_name, phone, move_in_date, rent_due_date, active)
     values ($1, 'Smoke Tenant Two', '+256700000001', '2026-07-01', '2026-08-01', true)
     returning id`,
    [unitTwoId]
  )
  const tenantTwoId = tenantTwo.rows[0].id

  await client.query(
    `insert into rent_payments
      (tenant_id, unit_id, amount_paid, balance_after_payment, payment_month, coverage_start, coverage_end, months_covered, payment_method)
     values ($1, $2, 600000, 0, '2026-07', '2026-07-01', '2026-08-01', 1, 'cash')`,
    [tenantTwoId, unitTwoId]
  )
  await client.query(
    `insert into expenses (property_id, unit_id, title, category, amount, expense_date)
     values ($1, $2, 'Smoke Unit Expense', 'maintenance', 15000, '2026-07-01')`,
    [propertyTwoId, unitTwoId]
  )

  await client.query('delete from units where id = $1', [unitTwoId])
  assertCount('tenants by deleted unit', await countRows(client, 'tenants', 'unit_id = $1', [unitTwoId]))
  assertCount('payments by deleted unit', await countRows(client, 'rent_payments', 'unit_id = $1', [unitTwoId]))
  assertCount('expenses by deleted unit', await countRows(client, 'expenses', 'unit_id = $1', [unitTwoId]))

  await client.query('rollback')
  console.log('Neon smoke passed: active-tenant guard and delete cascades verified with rollback.')
} catch (error) {
  await client.query('rollback').catch(() => undefined)
  throw error
} finally {
  await client.end()
}
