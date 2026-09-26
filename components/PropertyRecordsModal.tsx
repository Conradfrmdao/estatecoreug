'use client'

import Dialog from '@/components/ui/Dialog'
import PdfDownload from '@/components/ui/PdfDownload'
import { Download, Eye, X } from 'lucide-react'
import { useId, useRef, useState, type ReactNode } from 'react'

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
  const closeRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <div className="mt-auto flex items-center gap-2.5">
        <button type="button" onClick={() => setOpen(true)} className="btn h-12 min-w-0 flex-1 btn-outline">
          <Eye aria-hidden="true" className="h-[18px] w-[18px] shrink-0" strokeWidth={1.9} />
          <span className="truncate">{buttonLabel}</span>
        </button>
        <PdfDownload
          href={downloadHref}
          aria-label={`Download ${title} report`}
          title="Download property report"
          className="btn btn-outline btn-icon h-12 w-12 shrink-0"
        >
          <Download aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.9} />
        </PdfDownload>
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        labelledBy={titleId}
        variant="sheet-dialog"
        zIndex={80}
        initialFocusRef={closeRef}
        className="flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-overlay sm:max-h-[88vh] sm:max-w-6xl sm:rounded-[28px]"
      >
        <header className="flex items-start gap-3 px-5 pb-4 pt-5 sm:items-center sm:px-6">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="truncate text-[18px] font-extrabold leading-6 text-ink sm:text-[20px]">
              {title}
            </h2>
            <p className="mt-0.5 line-clamp-2 text-[13px] font-medium text-muted">{description}</p>
          </div>
          <PdfDownload href={downloadHref} className="btn btn-sm btn-hi shrink-0">
            <Download aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
            <span className="hidden min-[390px]:inline">Report</span>
          </PdfDownload>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            title="Close"
            className="btn btn-soft btn-icon btn-sm shrink-0"
          >
            <X aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
          </button>
        </header>
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-line"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {children}
        </div>
      </Dialog>
    </>
  )
}
