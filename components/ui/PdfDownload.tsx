'use client'

import { Download, X } from 'lucide-react'
import { useState, type AnchorHTMLAttributes, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'

/*
 * A link to one of our PDFs - a receipt or a report.
 *
 * Every PDF is served as an attachment, which a computer or an Android phone
 * saves straight to its downloads. An iPhone or iPad does not: Safari opens the
 * PDF in a viewer instead, and an app added to the home screen cannot download
 * at all. So there the link fetches the file and hands it to the share sheet,
 * where "Save to Files" is how iOS keeps a download - and where WhatsApp, Mail
 * and Print are, for sending a receipt on to the tenant.
 */

function sharesFilesHere() {
  if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') return false
  const agent = navigator.userAgent
  /* iPadOS asks for desktop pages and calls itself a Mac; the touch screen gives it away. */
  return /iPad|iPhone|iPod/.test(agent) || (/Macintosh/.test(agent) && navigator.maxTouchPoints > 1)
}

function fileNameOf(response: Response) {
  const header = response.headers.get('Content-Disposition') ?? ''
  return /filename="([^"]+)"/i.exec(header)?.[1] ?? 'estatecore.pdf'
}

export default function PdfDownload({ href, className, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const [busy, setBusy] = useState(false)
  /* A PDF that arrived after the tap had gone stale, waiting for a second one. */
  const [ready, setReady] = useState<File | null>(null)

  async function share(file: File) {
    try {
      await navigator.share({ files: [file], title: file.name })
      setReady(null)
    } catch (error) {
      const name = error instanceof DOMException ? error.name : ''
      if (name === 'AbortError') {
        /* The share sheet was closed without choosing anything. */
        setReady(null)
      } else if (name === 'NotAllowedError') {
        /* Safari only opens the sheet within a few seconds of a tap, and a slow
           PDF can outlast that. The file is here now; one more tap opens it. */
        setReady(file)
      } else {
        throw error
      }
    }
  }

  async function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!sharesFilesHere()) return
    event.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      const response = await fetch(href, { credentials: 'same-origin' })
      if (!response.ok) throw new Error(`The PDF could not be made (${response.status}).`)
      const file = new File([await response.blob()], fileNameOf(response), { type: 'application/pdf' })
      if (!navigator.canShare({ files: [file] })) throw new Error('This browser cannot share files.')
      await share(file)
    } catch {
      /* Whatever went wrong, the plain link still works: Safari shows the PDF. */
      window.location.assign(href)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <a
        {...rest}
        href={href}
        download
        onClick={onClick}
        aria-busy={busy || undefined}
        className={`${className ?? ''} aria-busy:pointer-events-none aria-busy:opacity-60`}
      >
        {children}
      </a>
      {ready &&
        createPortal(
          <div
            role="status"
            className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+5.75rem)] z-[95] mx-auto flex max-w-sm items-center gap-2 rounded-[22px] bg-night py-2 pl-4 pr-2 text-white shadow-overlay lg:bottom-6"
          >
            <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">Your PDF is ready</span>
            <button
              type="button"
              onClick={() => void share(ready).catch(() => window.location.assign(href))}
              className="btn btn-sm btn-hi"
            >
              <Download aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
              Save
            </button>
            <button
              type="button"
              onClick={() => setReady(null)}
              aria-label="Dismiss"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>,
          document.body
        )}
    </>
  )
}
