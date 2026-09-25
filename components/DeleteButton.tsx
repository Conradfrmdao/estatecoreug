'use client'

import Dialog from '@/components/ui/Dialog'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useId, useRef, useState } from 'react'

export default function DeleteButton({
  endpoint,
  label = 'Delete',
  confirmMessage = 'Delete this record?',
  className = 'btn btn-danger'
}: {
  endpoint: string
  label?: string
  confirmMessage?: string
  className?: string
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const titleId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)

  async function handleDelete() {
    setError('')
    setPending(true)

    const response = await fetch(endpoint, { method: 'DELETE' })

    setPending(false)

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      setError(payload?.error ?? 'Unable to delete this record.')
      return
    }

    setConfirming(false)
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError('')
          setConfirming(true)
        }}
        disabled={pending}
        className={className}
      >
        {pending ? 'Deleting...' : label}
      </button>

      <Dialog
        open={confirming}
        onClose={() => {
          if (!pending) setConfirming(false)
        }}
        labelledBy={titleId}
        variant="dialog"
        zIndex={110}
        initialFocusRef={cancelRef}
        className="w-full max-w-sm rounded-[28px] bg-white p-6 text-left shadow-overlay"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
          <Trash2 aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <h2 id={titleId} className="mt-4 text-[18px] font-extrabold text-ink">
          Confirm delete
        </h2>
        <p className="mt-1.5 text-[14px] font-medium leading-6 text-muted">{confirmMessage}</p>
        {error && (
          <p className="mt-4 rounded-2xl bg-overdue-bg px-4 py-2.5 text-[13.5px] font-semibold text-overdue-fg">{error}</p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => setConfirming(false)}
            disabled={pending}
            className="btn btn-outline w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="btn btn-danger-solid w-full sm:w-auto"
          >
            {pending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Dialog>
    </>
  )
}
