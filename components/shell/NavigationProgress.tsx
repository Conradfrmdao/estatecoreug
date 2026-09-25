'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type Phase = 'idle' | 'loading' | 'done'

function isPlainLeftClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

function targetUrl(href: string) {
  try {
    return new URL(href, window.location.href)
  } catch {
    return null
  }
}

function isSameDocument(url: URL) {
  return url.pathname === window.location.pathname && url.search === window.location.search
}

/**
 * A hairline across the top of the page while the next one is on its way.
 * Moving between sections already shows a skeleton; this covers the moves
 * that stay on one page - a filter, a month, a property - where nothing else
 * would say that anything is happening.
 */
export default function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [phase, setPhase] = useState<Phase>('idle')
  const timers = useRef<number[]>([])

  function clearTimers() {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
  }

  useEffect(() => {
    function start() {
      clearTimers()
      setPhase('loading')
      /* A navigation that never lands (an error, a download) must not leave the bar up. */
      timers.current.push(window.setTimeout(() => setPhase('idle'), 12000))
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || !isPlainLeftClick(event)) return
      const anchor = (event.target as Element | null)?.closest?.('a')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const url = targetUrl(anchor.getAttribute('href') ?? '')
      if (!url || url.origin !== window.location.origin || url.pathname.startsWith('/api/')) return
      if (isSameDocument(url)) return
      start()
    }

    function onSubmit(event: SubmitEvent) {
      const form = event.target as HTMLFormElement | null
      /* Only forms that navigate - search and filter bars. The create and edit
         forms save with fetch and carry no action, and may stay put on an error. */
      const actionAttribute = form?.getAttribute('action')
      if (!form || !actionAttribute || form.method.toLowerCase() !== 'get') return
      const action = targetUrl(actionAttribute)
      if (!action || action.origin !== window.location.origin) return
      start()
    }

    document.addEventListener('click', onClick, true)
    document.addEventListener('submit', onSubmit, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('submit', onSubmit, true)
      clearTimers()
    }
  }, [])

  useEffect(() => {
    setPhase((current) => {
      if (current !== 'loading') return current
      clearTimers()
      timers.current.push(window.setTimeout(() => setPhase('idle'), 420))
      return 'done'
    })
  }, [pathname, searchParams])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-50 h-[3px] overflow-hidden"
    >
      <div
        className="h-full origin-left rounded-r-full bg-brand"
        style={{
          transform: phase === 'idle' ? 'scaleX(0)' : phase === 'loading' ? 'scaleX(0.82)' : 'scaleX(1)',
          opacity: phase === 'idle' ? 0 : 1,
          transition:
            phase === 'loading'
              ? 'transform 8s cubic-bezier(0.08, 0.8, 0.2, 1), opacity 0.15s ease'
              : phase === 'done'
                ? 'transform 0.25s ease-out, opacity 0.3s ease 0.15s'
                : 'none'
        }}
      />
    </div>
  )
}
