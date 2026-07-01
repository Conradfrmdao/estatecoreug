import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { BadgeCheck, CalendarDays, CircleDollarSign, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react'

import { requireCurrentAppUser } from '@/lib/auth'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}

export default async function SettingsPage() {
  const [dbUser, clerkUser] = await Promise.all([
    requireCurrentAppUser(),
    currentUser()
  ])
  const initials = dbUser.name.slice(0, 1).toUpperCase()

  return (
    <div className="mx-auto max-w-7xl animate-in">
      <section className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#00A550' }}>Workspace settings</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Account, access, and Ugandan property-management defaults.</p>
        </div>
        {dbUser.role === 'admin' && (
          <Link
            href="/admin"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold text-white sm:h-10 sm:min-h-0 sm:w-auto"
            style={{ backgroundColor: '#00A550' }}
          >
            <ShieldCheck className="h-4 w-4" strokeWidth={1.9} />
            Open Admin Portal
          </Link>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.9fr_0.85fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3 sm:items-center sm:gap-4">
            {clerkUser?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clerkUser.imageUrl}
                alt={dbUser.name}
                className="h-16 w-16 rounded-2xl border-2 object-cover"
                style={{ borderColor: '#00A550' }}
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-black text-white" style={{ backgroundColor: '#00A550' }}>
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-black text-slate-950 sm:text-xl">{dbUser.name}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                  <BadgeCheck className="h-3 w-3" />
                  {dbUser.accountStatus}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-slate-500">{dbUser.email}</p>
              {dbUser.phone && <p className="mt-0.5 truncate text-xs text-slate-400">{dbUser.phone}</p>}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SettingRow label="Role" value={dbUser.role === 'admin' ? 'Platform Admin' : 'Landlord'} />
            <SettingRow label="Last seen" value={formatDate(dbUser.lastSeenAt)} />
            <SettingRow label="Approved" value={formatDate(dbUser.approvedAt)} />
            <SettingRow label="Created" value={formatDate(dbUser.createdAt)} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <LockKeyhole className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <div>
              <h2 className="text-base font-black text-slate-950">Access Control</h2>
              <p className="text-xs text-slate-500">Approval and admin routing.</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <SettingRow label="Admin portal" value={dbUser.role === 'admin' ? '/admin enabled' : 'Admin only'} />
            <SettingRow label="Account status" value={dbUser.accountStatus} />
            <SettingRow label="Login provider" value="Clerk authentication" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <UserRound className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <div>
              <h2 className="text-base font-black text-slate-950">System Defaults</h2>
              <p className="text-xs text-slate-500">Regional app settings.</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <CircleDollarSign className="mt-0.5 h-4 w-4 text-emerald-700" strokeWidth={1.9} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Currency</p>
                <p className="text-sm font-semibold text-slate-900">Ugandan Shilling (UGX)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <CalendarDays className="mt-0.5 h-4 w-4 text-emerald-700" strokeWidth={1.9} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Date and time</p>
                <p className="text-sm font-semibold text-slate-900">Africa/Kampala, en-UG</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
