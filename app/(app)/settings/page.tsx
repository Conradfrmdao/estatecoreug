import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { Check, Globe, Headphones, LockKeyhole, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'

import PageHeader from '@/components/shell/PageHeader'
import { SupportChatTrigger } from '@/components/support/SupportChat'
import { initialsOf } from '@/components/ui/Avatar'
import { requireCurrentAppUser } from '@/lib/auth'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

function SettingRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-tile bg-canvas px-4 py-3.5">
      <p className="text-[11px] font-bold uppercase leading-[15px] tracking-[0.06em] text-muted">{label}</p>
      <p className="truncate text-[15px] font-bold leading-5 text-ink">{value}</p>
    </div>
  )
}

function CardHeading({
  icon,
  title,
  subtitle,
  tone
}: {
  icon: ReactNode
  title: string
  subtitle: string
  tone: 'mint' | 'hi'
}) {
  return (
    <div className="flex items-center gap-3.5">
      <span
        aria-hidden="true"
        className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl ${
          tone === 'mint' ? 'bg-mint text-forest' : 'bg-hi text-ink'
        }`}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <h2 className="text-[17px] font-extrabold leading-[22px] text-ink">{title}</h2>
        <span className="text-[12.5px] font-medium leading-[17px] text-muted">{subtitle}</span>
      </span>
    </div>
  )
}

export default async function SettingsPage() {
  const [dbUser, clerkUser] = await Promise.all([
    requireCurrentAppUser(),
    currentUser()
  ])
  const isAdmin = dbUser.role === 'admin'

  return (
    <div className="stagger space-y-[22px]">
      <PageHeader
        eyebrow="Workspace settings"
        title="Settings"
        subtitle="Account, access, and Ugandan property-management defaults."
        actions={
          isAdmin ? (
            <Link href="/admin" className="btn btn-lg btn-ink max-lg:flex-1">
              <ShieldCheck aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.9} />
              Open Admin Portal
            </Link>
          ) : undefined
        }
        tools={{ locationPill: true, user: 'email' }}
      />

      <section aria-label="Workspace settings" className="grid items-start gap-4 sm:gap-5 xl:grid-cols-3">
        <article className="flex min-w-0 flex-col gap-5 rounded-[24px] bg-white p-5 sm:p-6 lg:rounded-card">
          <div className="flex min-w-0 items-center gap-3.5">
            {clerkUser?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clerkUser.imageUrl}
                alt={dbUser.name}
                className="h-[60px] w-[60px] shrink-0 rounded-[20px] object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[20px] bg-forest text-[20px] font-extrabold text-white"
              >
                {initialsOf(dbUser.name)}
              </span>
            )}
            <span className="flex min-w-0 flex-col gap-1">
              <h2 className="truncate text-[16px] font-extrabold leading-[22px] text-ink">{dbUser.name}</h2>
              <span className="truncate text-[13px] font-medium leading-[18px] text-muted">{dbUser.email}</span>
              {dbUser.phone && <span className="truncate text-[12px] font-medium leading-4 text-muted">{dbUser.phone}</span>}
              <span className="mt-0.5 inline-flex items-center gap-1.5 self-start rounded-full bg-mint px-3 py-[5px] text-[11.5px] font-extrabold uppercase tracking-[0.04em] text-forest">
                <Check aria-hidden="true" className="h-[13px] w-[13px]" strokeWidth={3} />
                {dbUser.accountStatus}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <SettingRow label="Role" value={isAdmin ? 'Platform Admin' : 'Landlord'} />
            <SettingRow label="Last seen" value={formatDate(dbUser.lastSeenAt)} />
            <SettingRow label="Approved" value={formatDate(dbUser.approvedAt)} />
            <SettingRow label="Created" value={formatDate(dbUser.createdAt)} />
          </div>
        </article>

        <article className="flex min-w-0 flex-col gap-5 rounded-[24px] bg-white p-5 sm:p-6 lg:rounded-card">
          <CardHeading
            tone="mint"
            icon={<LockKeyhole className="h-6 w-6" strokeWidth={1.9} />}
            title="Access Control"
            subtitle="Approval and admin routing."
          />
          <div className="flex flex-col gap-2.5">
            <SettingRow label="Admin portal" value={isAdmin ? '/admin enabled' : 'Admin only'} />
            <SettingRow label="Account status" value={dbUser.accountStatus} />
            <SettingRow label="Login provider" value="Clerk authentication" />
          </div>
        </article>

        <article className="flex min-w-0 flex-col gap-5 rounded-[24px] bg-white p-5 sm:p-6 lg:rounded-card">
          <CardHeading
            tone="hi"
            icon={<Globe className="h-6 w-6" strokeWidth={1.9} />}
            title="System Defaults"
            subtitle="Regional app settings."
          />
          <div className="flex flex-col gap-2.5">
            <SettingRow label="Currency" value="Ugandan Shilling (UGX)" />
            <SettingRow label="Date and time" value="Africa/Kampala, en-UG" />
          </div>
        </article>
      </section>

      {!isAdmin && (
        <section
          aria-label="Help"
          className="flex flex-col gap-4 rounded-[24px] bg-night p-5 text-white sm:flex-row sm:items-center sm:gap-5 sm:px-7 sm:py-[26px] lg:rounded-card"
        >
          <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-hi text-ink">
            <Headphones className="h-[26px] w-[26px]" strokeWidth={1.9} />
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            <span className="text-[18px] font-extrabold leading-6">Need help?</span>
            <span className="text-[13.5px] font-medium leading-[19px] text-night-muted">
              Chat with admin about approvals, access or anything in your workspace.
            </span>
          </span>
          <span className="sm:ml-auto">
            <SupportChatTrigger variant="band" />
          </span>
        </section>
      )}
    </div>
  )
}
