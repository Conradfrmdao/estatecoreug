'use client'

import { useRouter } from 'next/navigation'
import { useId, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import FormNotice from '@/components/FormNotice'
import Dialog from '@/components/ui/Dialog'

type Props = {
  userId: number
  status: string
  currentUserId: number
}

export default function AdminUserActions({ userId, status, currentUserId }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isSelf = userId === currentUserId
  const titleId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)

  async function run(action: string, method = 'PATCH') {
    setError('')
    setBusy(action)
    const response = await fetch(`/api/admin/users/${userId}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'DELETE' ? undefined : JSON.stringify({ action })
    })
    setBusy(null)

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      setError(payload?.error ?? 'Admin action failed')
      return
    }

    setConfirmDelete(false)
    router.refresh()
  }

  return (
    <div className="flex flex-wrap justify-start gap-2 sm:justify-end">
      {error && !confirmDelete && (
        <div className="basis-full">
          <FormNotice message={error} />
        </div>
      )}
      {status !== 'approved' && (
        <button type="button" disabled={busy !== null} onClick={() => run('approve')} className="btn btn-xs btn-ink">
          {busy === 'approve' ? '...' : 'Approve'}
        </button>
      )}
      {status !== 'rejected' && !isSelf && (
        <button type="button" disabled={busy !== null} onClick={() => run('reject')} className="btn btn-xs btn-outline">
          Reject
        </button>
      )}
      {status !== 'suspended' && !isSelf && (
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => run('suspend')}
          className="btn btn-xs bg-carried-bg text-carried-fg hover:bg-carried-bg/70"
        >
          Suspend
        </button>
      )}
      {status === 'suspended' && (
        <button type="button" disabled={busy !== null} onClick={() => run('activate')} className="btn btn-xs btn-mint">
          Activate
        </button>
      )}
      {!isSelf && (
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => {
            setError('')
            setConfirmDelete(true)
          }}
          className="btn btn-xs btn-danger"
        >
          Delete data
        </button>
      )}

      <Dialog
        open={confirmDelete}
        onClose={() => {
          if (busy === null) setConfirmDelete(false)
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
          Delete local user data?
        </h2>
        <p className="mt-1.5 text-[14px] font-medium leading-6 text-muted">
          This deletes the local app user and linked properties, units, tenants, payments, and expenses. Clerk login is left untouched.
        </p>
        {error && (
          <p className="mt-4 rounded-2xl bg-overdue-bg px-4 py-2.5 text-[13.5px] font-semibold text-overdue-fg">{error}</p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => setConfirmDelete(false)}
            disabled={busy !== null}
            className="btn btn-outline w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => run('delete', 'DELETE')}
            disabled={busy !== null}
            className="btn btn-danger-solid w-full sm:w-auto"
          >
            {busy === 'delete' ? 'Deleting...' : 'Delete data'}
          </button>
        </div>
      </Dialog>
    </div>
  )
}
