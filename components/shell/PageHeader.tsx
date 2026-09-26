import type { ReactNode } from 'react'
import HeaderTools, { type HeaderToolsConfig } from './HeaderTools'

const kampalaDate = new Intl.DateTimeFormat('en-UG', {
  timeZone: 'Africa/Kampala',
  day: 'numeric',
  month: 'short',
  year: 'numeric'
})

const kampalaWeekday = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Kampala',
  weekday: 'long'
})

/**
 * The one page header: an optional eyebrow, the title and a line under it on
 * the left; the page's own actions and then the shared tools on the right.
 */
export default function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  tools = { date: true, user: 'full' },
  className = ''
}: {
  title: ReactNode
  subtitle?: ReactNode
  eyebrow?: string
  actions?: ReactNode
  /** false leaves the right-hand tools out, for the narrow form pages. */
  tools?: HeaderToolsConfig | false
  className?: string
}) {
  const now = new Date()

  return (
    /* Raised above the cards that follow, so the notifications popover and
       anything else that drops out of the header opens over them. */
    <header
      className={`relative z-30 flex flex-col gap-4 lg:min-h-16 lg:flex-row lg:items-center lg:justify-between lg:gap-6 ${className}`}
    >
      <div className={`flex min-w-0 flex-col ${eyebrow ? 'gap-0.5' : 'gap-1'}`}>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="text-[26px] font-extrabold leading-[32px] tracking-[-0.02em] text-ink lg:text-[28px] lg:leading-[34px]">
          {title}
        </h1>
        {subtitle && (
          <p className={`font-medium text-muted ${eyebrow ? 'text-[13px] leading-[18px]' : 'text-[14px] leading-5'}`}>
            {subtitle}
          </p>
        )}
      </div>

      {(actions || tools) && (
        <div
          className={`shrink-0 flex-wrap items-center gap-2.5 lg:flex lg:flex-nowrap ${actions ? 'flex' : 'hidden'}`}
        >
          {actions}
          {tools && (
            <HeaderTools
              {...tools}
              dateLabel={kampalaDate.format(now)}
              weekdayLabel={kampalaWeekday.format(now)}
            />
          )}
        </div>
      )}
    </header>
  )
}
