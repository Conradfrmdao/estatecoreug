import AdminUserActions from '@/components/AdminUserActions'
import { requireAdminUser } from '@/lib/auth'
import { listUsersWithStats } from '@/lib/data'
import { currency, formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

function statusBadge(status: string) {
  const colors = {
    approved: 'badge-green',
    pending: 'badge-amber',
    rejected: '',
    suspended: ''
  }[status] ?? ''

  if (colors) {
    return <span className={`badge ${colors}`}>{status}</span>
  }

  return <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>{status}</span>
}

export default async function AdminPage() {
  const admin = await requireAdminUser()
  const users = await listUsersWithStats()
  const totals = users.reduce(
    (acc, row) => ({
      users: acc.users + 1,
      properties: acc.properties + row.stats.properties,
      tenants: acc.tenants + row.stats.tenants,
      payments: acc.payments + row.stats.paymentTotal
    }),
    { users: 0, properties: 0, tenants: 0, payments: 0 }
  )

  return (
    <div className="space-y-6 animate-in">
      <section className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#00A550' }}>Platform owner</p>
        <h1 className="text-3xl font-bold" style={{ color: '#1a1a2e' }}>Admin Panel</h1>
        <p className="text-sm text-slate-500">Approve accounts, monitor usage, and protect tenant data boundaries.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 text-center" style={{ borderColor: '#e2e8f0' }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Users</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: '#1a1a2e' }}>{totals.users}</p>
        </div>
        <div className="rounded-xl border bg-white p-5 text-center" style={{ borderColor: '#e2e8f0' }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Properties</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: '#1a1a2e' }}>{totals.properties}</p>
        </div>
        <div className="rounded-xl border bg-white p-5 text-center" style={{ borderColor: '#e2e8f0' }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tenants</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: '#1a1a2e' }}>{totals.tenants}</p>
        </div>
        <div className="rounded-xl border bg-white p-5 text-center" style={{ borderColor: '#e2e8f0' }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Payments</p>
          <p className="mt-2 text-2xl font-bold" style={{ color: '#00A550' }}>{currency(totals.payments)}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: '#e2e8f0' }}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Created</th>
                <th>Last seen</th>
                <th>Portfolio</th>
                <th>Financials</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(({ user, stats }) => (
                <tr key={user.id}>
                  <td>
                    <div>
                      <span className="block font-semibold" style={{ color: '#1a1a2e' }}>{user.name}</span>
                      <span className="block text-xs text-slate-500">{user.email}</span>
                      {user.phone && <span className="block text-xs text-slate-400">{user.phone}</span>}
                    </div>
                  </td>
                  <td>
                    {statusBadge(user.accountStatus)}
                    <span className="ml-2 text-xs uppercase text-slate-400">{user.role}</span>
                  </td>
                  <td className="text-sm text-slate-500">{formatDate(user.createdAt)}</td>
                  <td className="text-sm text-slate-500">{formatDate(user.lastSeenAt)}</td>
                  <td className="text-sm text-slate-600">
                    {stats.properties} properties, {stats.tenants} tenants
                  </td>
                  <td className="text-sm text-slate-600">
                    {currency(stats.paymentTotal)} paid, {currency(stats.expenseTotal)} expenses
                  </td>
                  <td>
                    <AdminUserActions userId={user.id} status={user.accountStatus} currentUserId={admin.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
