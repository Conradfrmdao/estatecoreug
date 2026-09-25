import AdminUserActions from '@/components/AdminUserActions'
import AdminSupportInbox from '@/components/AdminSupportInbox'
import PageHeader from '@/components/shell/PageHeader'
import Avatar, { initialsOf, toneFor } from '@/components/ui/Avatar'
import { requireAdminUser } from '@/lib/auth'
import { listUsersWithStats } from '@/lib/data'
import { currency, formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

function statusBadge(status: string) {
  const tone = {
    approved: 'bg-mint text-forest',
    pending: 'bg-carried-bg text-carried-fg',
    rejected: 'bg-overdue-bg text-overdue-fg',
    suspended: 'bg-overdue-bg text-overdue-fg'
  }[status] ?? 'bg-overdue-bg text-overdue-fg'

  return <span className={`pill capitalize ${tone}`}>{status}</span>
}

function TotalCard({ label, value, tone = 'plain' }: { label: string; value: string | number; tone?: 'plain' | 'night' }) {
  const night = tone === 'night'
  return (
    <article
      className={`relative flex min-h-[112px] min-w-0 flex-col justify-between gap-3 overflow-hidden rounded-[24px] p-4 sm:min-h-[132px] sm:px-[22px] sm:py-5 lg:rounded-card ${
        night ? 'bg-night text-white' : 'bg-white text-ink'
      }`}
    >
      {night && (
        <svg aria-hidden="true" width="130" height="120" viewBox="0 0 130 120" className="absolute -right-2 -top-2 text-hi">
          <path d="M130 0H50c-4 20 10 30 24 36c18 8 28 26 32 44c4 16 14 28 24 32Z" fill="currentColor" opacity="0.18" />
        </svg>
      )}
      <span className={`relative text-[10.5px] font-bold uppercase leading-4 tracking-[0.08em] sm:text-[11.5px] ${night ? 'text-night-muted' : 'text-muted'}`}>
        {label}
      </span>
      <span className="relative text-[22px] font-extrabold leading-tight tracking-[-0.02em] tabular-nums [overflow-wrap:anywhere] sm:text-[28px]">
        {value}
      </span>
    </article>
  )
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
    <div className="stagger space-y-5">
      <PageHeader
        eyebrow="Platform owner"
        title="Admin Panel"
        subtitle="Approve accounts, monitor usage, and protect tenant data boundaries."
        actions={<AdminSupportInbox users={users.map(({ user }) => ({ id: user.id, name: user.name, email: user.email }))} />}
        tools={{ user: 'avatar' }}
      />

      <section aria-label="Platform totals" className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        <TotalCard label="Users" value={totals.users} />
        <TotalCard label="Properties" value={totals.properties} />
        <TotalCard label="Tenants" value={totals.tenants} />
        <TotalCard label="Payments" value={currency(totals.payments)} tone="night" />
      </section>

      <section aria-labelledby="admin-users-title" className="rounded-[24px] bg-white p-4 sm:px-7 sm:py-6 lg:rounded-card">
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 pb-3">
          <h2 id="admin-users-title" className="text-[18px] font-extrabold leading-6 text-ink">Accounts</h2>
          <span className="pill bg-canvas text-ink-soft">
            {users.length} user{users.length === 1 ? '' : 's'}
          </span>
        </div>
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
                    <div className="flex items-center gap-3">
                      <Avatar initials={initialsOf(user.name)} tone={toneFor(user.id)} />
                      <div className="min-w-0">
                        <span className="block font-bold text-ink">{user.name}</span>
                        <span className="block truncate text-[12px] font-medium text-muted">{user.email}</span>
                        {user.phone && <span className="block text-[12px] font-medium text-faint">{user.phone}</span>}
                      </div>
                    </div>
                  </td>
                  <td data-label="Status">
                    <span className="flex flex-wrap items-center gap-2">
                      {statusBadge(user.accountStatus)}
                      <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted">{user.role}</span>
                    </span>
                  </td>
                  <td data-label="Created" className="whitespace-nowrap font-medium text-ink-soft">{formatDate(user.createdAt)}</td>
                  <td data-label="Last seen" className="whitespace-nowrap font-medium text-ink-soft">{formatDate(user.lastSeenAt)}</td>
                  <td data-label="Portfolio" className="font-medium text-ink-soft">
                    {stats.properties} properties, {stats.tenants} tenants
                  </td>
                  <td data-label="Financials" className="font-medium text-ink-soft">
                    <span className="block whitespace-nowrap font-bold text-brand-text">{currency(stats.paymentTotal)} paid</span>
                    <span className="block whitespace-nowrap">{currency(stats.expenseTotal)} expenses</span>
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
