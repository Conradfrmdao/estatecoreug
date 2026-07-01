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
    <div className="space-y-4 animate-in sm:space-y-6">
      <section className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#00A550' }}>Platform owner</p>
        <h1 className="text-xl font-black tracking-tight sm:text-3xl" style={{ color: '#1a1a2e' }}>Admin Panel</h1>
        <p className="text-sm text-slate-500">Approve accounts, monitor usage, and protect tenant data boundaries.</p>
      </section>

      <section className="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-4">
        <div className="rounded-xl border bg-white p-3 text-center shadow-sm sm:p-5" style={{ borderColor: '#e2e8f0' }}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">Users</p>
          <p className="mt-1 text-2xl font-black sm:mt-2 sm:text-3xl" style={{ color: '#1a1a2e' }}>{totals.users}</p>
        </div>
        <div className="rounded-xl border bg-white p-3 text-center shadow-sm sm:p-5" style={{ borderColor: '#e2e8f0' }}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">Properties</p>
          <p className="mt-1 text-2xl font-black sm:mt-2 sm:text-3xl" style={{ color: '#1a1a2e' }}>{totals.properties}</p>
        </div>
        <div className="rounded-xl border bg-white p-3 text-center shadow-sm sm:p-5" style={{ borderColor: '#e2e8f0' }}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">Tenants</p>
          <p className="mt-1 text-2xl font-black sm:mt-2 sm:text-3xl" style={{ color: '#1a1a2e' }}>{totals.tenants}</p>
        </div>
        <div className="rounded-xl border bg-white p-3 text-center shadow-sm sm:p-5" style={{ borderColor: '#e2e8f0' }}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">Payments</p>
          <p className="mt-1 text-base font-black [overflow-wrap:anywhere] sm:mt-2 sm:text-2xl" style={{ color: '#00A550' }}>{currency(totals.payments)}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm" style={{ borderColor: '#e2e8f0' }}>
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
                  <td data-label="User">
                    <div>
                      <span className="block font-semibold" style={{ color: '#1a1a2e' }}>{user.name}</span>
                      <span className="block text-xs text-slate-500">{user.email}</span>
                      {user.phone && <span className="block text-xs text-slate-400">{user.phone}</span>}
                    </div>
                  </td>
                  <td data-label="Status">
                    {statusBadge(user.accountStatus)}
                    <span className="ml-2 text-xs uppercase text-slate-400">{user.role}</span>
                  </td>
                  <td data-label="Created" className="text-sm text-slate-500">{formatDate(user.createdAt)}</td>
                  <td data-label="Last seen" className="text-sm text-slate-500">{formatDate(user.lastSeenAt)}</td>
                  <td data-label="Portfolio" className="text-sm text-slate-600">
                    {stats.properties} properties, {stats.tenants} tenants
                  </td>
                  <td data-label="Financials" className="text-sm text-slate-600">
                    {currency(stats.paymentTotal)} paid, {currency(stats.expenseTotal)} expenses
                  </td>
                  <td data-label="Actions">
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
