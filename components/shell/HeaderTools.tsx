'use client'

import NotificationBell from '@/components/NotificationBell'
import { useClerk } from '@clerk/nextjs'
import { MapPin } from 'lucide-react'
import { useShell } from './ShellContext'

export type HeaderToolsConfig = {
  /** The 52px date pill - "21 Sept 2026". */
  date?: boolean
  /** Weekday over "Kampala, Uganda", as on the dashboard. */
  weekday?: boolean
  /** A white "Kampala, Uganda" pill, as on Settings. */
  locationPill?: boolean
  /** full: avatar, name and role. email: avatar, email and role. avatar: the circle alone. */
  user?: 'full' | 'email' | 'avatar' | false
}

/**
 * The right-hand end of every desktop page header: notifications, the date
 * and who is signed in. Phones get these from the top bar instead.
 */
export default function HeaderTools({
  date = false,
  weekday = false,
  locationPill = false,
  user = 'full',
  dateLabel,
  weekdayLabel
}: HeaderToolsConfig & { dateLabel: string; weekdayLabel: string }) {
  const shell = useShell()
  const clerk = useClerk()

  return (
    <div className="hidden items-center gap-2.5 lg:flex">
      {locationPill && (
        <span className="hidden h-[52px] items-center gap-2 whitespace-nowrap rounded-full bg-white px-[18px] text-[13px] font-semibold text-ink-soft xl:flex">
          <MapPin aria-hidden="true" className="h-[17px] w-[17px]" strokeWidth={1.9} />
          Kampala, Uganda
        </span>
      )}

      <NotificationBell size="lg" />

      {date && (
        <span
          suppressHydrationWarning
          className="hidden h-[52px] items-center whitespace-nowrap rounded-full bg-white px-[18px] text-[13.5px] font-bold tabular-nums text-ink xl:flex"
        >
          {dateLabel}
        </span>
      )}

      {weekday && (
        <span className="hidden flex-col items-end gap-0.5 pl-1 xl:flex">
          <span suppressHydrationWarning className="text-[12px] font-medium leading-4 text-muted">
            {weekdayLabel}
          </span>
          <span className="flex items-center gap-1 whitespace-nowrap text-[14px] font-bold leading-[18px] text-ink">
            <MapPin aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.2} />
            Kampala, Uganda
          </span>
        </span>
      )}

      {shell && user === 'avatar' && (
        <button
          type="button"
          onClick={() => clerk.openUserProfile()}
          aria-label={`Your profile, ${shell.displayName}`}
          className="h-[52px] w-[52px] rounded-full bg-hi text-[14px] font-extrabold text-ink transition hover:scale-105"
        >
          {shell.initials}
        </button>
      )}

      {shell && (user === 'full' || user === 'email') && (
        <button
          type="button"
          onClick={() => clerk.openUserProfile()}
          aria-label={`Your profile, ${shell.displayName}`}
          className="group flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 text-left transition hover:bg-white"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-hi text-[14px] font-extrabold text-ink transition group-hover:scale-105">
            {shell.initials}
          </span>
          <span className="hidden min-w-0 flex-col xl:flex">
            <span className="max-w-[180px] truncate text-[13px] font-bold leading-[18px] text-ink">
              {user === 'email' ? shell.user.email : shell.displayName}
            </span>
            <span className="text-[12px] font-medium leading-4 text-muted">{shell.roleLabel}</span>
          </span>
        </button>
      )}
    </div>
  )
}
