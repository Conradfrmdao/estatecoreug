'use client'

import { Bell, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type NotificationItem = {
  id: string
  title: string
  body: string
  tone: 'success' | 'warning' | 'danger' | 'info'
  href: string
}

type NotificationResponse = {
  count: number
  notifications: NotificationItem[]
}

const toneDot = {
  success: 'bg-brand',
  warning: 'bg-carried-bar',
  danger: 'bg-overdue-fg',
  info: 'bg-advance-fg'
}

/* The dot on the bell takes the colour of the most urgent alert behind it. */
function indicatorTone(items: NotificationItem[]) {
  if (items.some((item) => item.tone === 'danger')) return 'bg-overdue-fg'
  if (items.some((item) => item.tone === 'warning')) return 'bg-carried-bar'
  return 'bg-brand'
}

export default function NotificationBell({
  size = 'lg',
  tone = 'light'
}: {
  /** lg is the 52px desktop header button; md is the 40px phone header one. */
  size?: 'lg' | 'md'
  /** dark sits on the forest header of the phone dashboard. */
  tone?: 'light' | 'dark'
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<NotificationResponse>({ count: 0, notifications: [] })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let alive = true

    fetch('/api/notifications')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to load notifications'))))
      .then((payload: NotificationResponse) => {
        if (alive) setData(payload)
      })
      .catch(() => {
        if (alive) setData({ count: 0, notifications: [] })
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!open) return

    function closeOnOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const dimension = size === 'lg' ? 'h-[52px] w-[52px]' : 'h-10 w-10'
  const surface =
    tone === 'dark'
      ? 'bg-white/10 text-white hover:bg-white/15'
      : 'bg-white text-ink hover:bg-white/80 hover:shadow-pop'
  const ring = tone === 'dark' ? 'shadow-[0_0_0_2px_rgb(var(--c-forest))]' : 'shadow-[0_0_0_2px_#ffffff]'
  const label = data.count > 0 ? `Notifications, ${data.count} new` : 'Notifications'

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`relative flex items-center justify-center rounded-full transition ${dimension} ${surface}`}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell aria-hidden="true" className={size === 'lg' ? 'h-5 w-5' : 'h-[18px] w-[18px]'} strokeWidth={1.9} />
        {data.count > 0 && (
          <span
            aria-hidden="true"
            className={`pop-in absolute rounded-full ${ring} ${indicatorTone(data.notifications)} ${
              size === 'lg' ? 'right-[15px] top-[14px] h-[9px] w-[9px]' : 'right-[10px] top-[9px] h-2 w-2'
            }`}
          />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="popover-enter fixed right-3 top-[4.5rem] z-50 w-[calc(100vw-1.5rem)] max-w-[23rem] overflow-hidden rounded-[24px] bg-white shadow-overlay sm:absolute sm:right-0 sm:top-[calc(100%+10px)] sm:w-[23rem]"
        >
          <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
            <div className="min-w-0">
              <p className="text-[15px] font-extrabold text-ink">Notifications</p>
              <p className="text-[12.5px] font-medium text-muted">Rent due dates and payment coverage alerts.</p>
            </div>
            <Link
              href="/calendar"
              onClick={() => setOpen(false)}
              className="shrink-0 pt-0.5 text-[13px] font-bold text-brand-text hover:text-ink"
            >
              Calendar
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto px-2 pb-2">
            {loading && (
              <div className="space-y-2 px-3 py-2" aria-hidden="true">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="flex gap-3 py-1.5">
                    <span className="skeleton mt-1 h-2.5 w-2.5 shrink-0 rounded-full" />
                    <span className="flex-1 space-y-1.5">
                      <span className="skeleton block h-3.5 w-2/3" />
                      <span className="skeleton block h-3 w-full" />
                    </span>
                  </div>
                ))}
              </div>
            )}
            {!loading && data.notifications.length === 0 && (
              <p className="mx-2 mb-2 rounded-[18px] bg-mint px-4 py-4 text-[13.5px] font-semibold text-forest">
                No urgent rent alerts right now.
              </p>
            )}
            {!loading &&
              data.notifications.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex gap-3 rounded-[18px] px-3 py-3 transition hover:bg-canvas"
                >
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${toneDot[item.tone]}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-bold text-ink">{item.title}</span>
                    <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-5 text-muted">{item.body}</span>
                  </span>
                  <ChevronRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-faint" strokeWidth={2} />
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
