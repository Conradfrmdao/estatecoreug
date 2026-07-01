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

const toneClasses = {
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700'
}

export default function NotificationBell() {
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
    function closeOnOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 sm:h-10 sm:w-10 sm:border-slate-100 sm:shadow-none"
        aria-label="Open notifications"
      >
        <Bell aria-hidden="true" className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.9} />
        {data.count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
            {data.count > 9 ? '9+' : data.count}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed right-3 top-[4.25rem] z-50 w-[calc(100vw-1.5rem)] max-w-[22rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:absolute sm:right-0 sm:top-12 sm:w-[22rem]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-black text-slate-950">Notifications</p>
              <p className="text-xs text-slate-500">Rent due dates and payment coverage alerts.</p>
            </div>
            <Link href="/calendar" onClick={() => setOpen(false)} className="text-xs font-bold text-emerald-700">
              Calendar
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {loading && (
              <p className="px-3 py-6 text-center text-sm font-semibold text-slate-500">Loading alerts...</p>
            )}
            {!loading && data.notifications.length === 0 && (
              <p className="rounded-xl bg-emerald-50 px-3 py-4 text-sm font-semibold text-emerald-700">
                No urgent rent alerts right now.
              </p>
            )}
            {!loading && data.notifications.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
              >
                <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${toneClasses[item.tone]}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black text-slate-800">{item.title}</span>
                  <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-slate-500">{item.body}</span>
                </span>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" strokeWidth={1.8} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
