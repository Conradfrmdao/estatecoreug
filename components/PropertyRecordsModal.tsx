'use client'

import { Download, Eye, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type PropertyRecordsModalProps = {
  buttonLabel: string
  title: string
  description: string
  downloadHref: string
  children: ReactNode
}

export default function PropertyRecordsModal({
  buttonLabel,
  title,
  description,
  downloadHref,
  children
}: PropertyRecordsModalProps) {
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      triggerRef.current?.focus()
    }
  }, [open])

  const modal = open ? (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-[1px] sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false)
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[88vh] sm:max-w-6xl sm:rounded-2xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <header className="flex items-start gap-3 border-b border-slate-200 px-4 py-3 sm:items-center sm:px-5 sm:py-4">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="truncate text-base font-black text-slate-950 sm:text-lg">
              {title}
            </h2>
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 sm:text-sm">{description}</p>
          </div>
          <a
            href={downloadHref}
            download
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white transition hover:bg-emerald-700 sm:px-4"
          >
            <Download aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
            <span className="hidden min-[390px]:inline">Report</span>
          </a>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            title="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <X aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </section>
    </div>
  ) : null

  return (
    <>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
        >
          <Eye aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={1.9} />
          <span className="truncate">{buttonLabel}</span>
        </button>
        <a
          href={downloadHref}
          download
          aria-label={`Download ${title} report`}
          title="Download property report"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
        >
          <Download aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
        </a>
      </div>
      {typeof document !== 'undefined' && modal ? createPortal(modal, document.body) : null}
    </>
  )
}
