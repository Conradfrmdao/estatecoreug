import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Client } from 'pg'

const tables = [
  'users',
  'properties',
  'units',
  'tenants',
  'rent_payments',
  'expenses',
  'support_conversations',
  'support_messages'
]

const mode = process.argv[2]
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) throw new Error('DATABASE_URL is required.')
if (!['backup', 'migrate'].includes(mode)) throw new Error('Use backup or migrate mode.')

const backupDirectory = path.join(process.cwd(), 'backups')
const migrationPath = path.join(process.cwd(), 'drizzle', 'migrations', '0007_tenant_payment_terms.sql')

function quoteIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`
}

function fingerprint(rows) {
  return createHash('sha256').update(JSON.stringify(rows)).digest('hex')
}

async function tableColumns(client, table) {
  const result = await client.query(
    `SELECT column_name
       FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position`,
    [table]
  )
  return result.rows.map((row) => row.column_name)
}

async function snapshot(client, selectedColumns) {
  const result = {}
  for (const table of tables) {
    const columns = selectedColumns?.[table] ?? await tableColumns(client, table)
    const selectList = columns.map(quoteIdentifier).join(', ')
    const rows = (await client.query(
      `SELECT ${selectList} FROM ${quoteIdentifier(table)} ORDER BY id`
    )).rows
    result[table] = {
      columns,
      count: rows.length,
      fingerprint: fingerprint(rows),
      rows
    }
  }
  return result
}

function auditOnly(snapshotData) {
  return Object.fromEntries(
    Object.entries(snapshotData).map(([table, data]) => [table, {
      columns: data.columns,
      count: data.count,
      fingerprint: data.fingerprint
    }])
  )
}

async function latestBackupPath() {
  const files = (await readdir(backupDirectory))
    .filter((file) => file.startsWith('estatecore-before-') && file.endsWith('.json'))
    .sort()
  const latest = files.at(-1)
  if (!latest) throw new Error('No database backup was found.')
  return path.join(backupDirectory, latest)
}

const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
await client.connect()

try {
  await mkdir(backupDirectory, { recursive: true })

  if (mode === 'backup') {
    const capturedAt = new Date().toISOString()
    const data = await snapshot(client)
    const stamp = capturedAt.replaceAll(':', '-').replaceAll('.', '-')
    const backupPath = path.join(backupDirectory, `estatecore-before-${stamp}.json`)
    const payload = {
      format: 'estatecore-database-backup-v1',
      capturedAt,
      tables: data
    }
    await writeFile(backupPath, JSON.stringify(payload, null, 2), { flag: 'wx' })
    console.log(JSON.stringify({ backupPath, capturedAt, audit: auditOnly(data) }, null, 2))
  } else {
    const backupPath = await latestBackupPath()
    const backup = JSON.parse(await readFile(backupPath, 'utf8'))
    const baselineColumns = Object.fromEntries(
      Object.entries(backup.tables).map(([table, data]) => [table, data.columns])
    )
    const immediatelyBefore = await snapshot(client, baselineColumns)

    for (const table of tables) {
      const baseline = backup.tables[table]
      const current = immediatelyBefore[table]
      if (baseline.count !== current.count || baseline.fingerprint !== current.fingerprint) {
        throw new Error(`Database changed after backup in ${table}; create a fresh backup before migrating.`)
      }
    }

    const migrationSql = await readFile(migrationPath, 'utf8')
    await client.query('BEGIN')
    try {
      await client.query(migrationSql)
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }

    const after = await snapshot(client, baselineColumns)
    const comparisons = {}
    for (const table of tables) {
      const baseline = backup.tables[table]
      comparisons[table] = {
        countBefore: baseline.count,
        countAfter: after[table].count,
        originalColumnsUnchanged: baseline.fingerprint === after[table].fingerprint
      }
    }

    const columns = await client.query(
      `SELECT table_name, column_name, is_nullable, column_default
         FROM information_schema.columns
        WHERE table_schema = 'public'
          AND (
            (table_name = 'tenants' AND column_name IN ('payment_timing', 'billing_cycle_months')) OR
            (table_name = 'support_conversations' AND column_name IN ('landlord_read_at', 'admin_read_at'))
          )
        ORDER BY table_name, column_name`
    )
    const paymentTerms = await client.query(
      `SELECT payment_timing, billing_cycle_months, count(*)::integer AS tenants
         FROM tenants
        GROUP BY payment_timing, billing_cycle_months
        ORDER BY payment_timing, billing_cycle_months`
    )

    const report = {
      backupPath,
      migratedAt: new Date().toISOString(),
      comparisons,
      addedColumns: columns.rows,
      tenantPaymentTerms: paymentTerms.rows
    }
    const reportPath = path.join(backupDirectory, 'latest-migration-audit.json')
    await writeFile(reportPath, JSON.stringify(report, null, 2))
    console.log(JSON.stringify({ reportPath, ...report }, null, 2))
  }
} finally {
  await client.end()
}
