import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/** The empty state inside a card: a quiet icon, a line, a way forward. */
export default function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  children,
  className = ''
}: {
  icon: LucideIcon
  title: string
  body?: string
  action?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={`fade-in flex flex-1 flex-col items-center justify-center gap-3 px-4 py-12 text-center ${className}`}>
      <span aria-hidden="true" className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-canvas text-brand-text">
        <Icon className="h-[38px] w-[38px]" strokeWidth={1.8} />
      </span>
      <h2 className="mt-1 text-[22px] font-extrabold leading-7 tracking-[-0.01em] text-ink">{title}</h2>
      {body && <p className="max-w-sm text-[14px] font-medium leading-5 text-muted">{body}</p>}
      {action && <div className="mt-1.5">{action}</div>}
      {children}
    </div>
  )
}
