'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import FormNotice from '@/components/FormNotice'

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
      {error && (
        <div className="basis-full">
          <FormNotice message={error} />
        </div>
      )}
      {status !== 'approved' && (
        <button disabled={busy !== null} onClick={() => run('approve')} className="min-h-10 rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: '#00A550' }}>
          {busy === 'approve' ? '...' : 'Approve'}
        </button>
      )}
      {status !== 'rejected' && !isSelf && (
        <button disabled={busy !== null} onClick={() => run('reject')} className="min-h-10 rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-700" style={{ borderColor: '#e2e8f0' }}>
          Reject
        </button>
      )}
      {status !== 'suspended' && !isSelf && (
        <button disabled={busy !== null} onClick={() => run('suspend')} className="min-h-10 rounded-lg border px-3 py-1.5 text-xs font-semibold text-amber-700" style={{ borderColor: '#fde68a', backgroundColor: '#fffbeb' }}>
          Suspend
        </button>
      )}
      {status === 'suspended' && (
        <button disabled={busy !== null} onClick={() => run('activate')} className="min-h-10 rounded-lg border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: '#bbf7d0', color: '#007038' }}>
          Activate
        </button>
      )}
      {!isSelf && (
        <button disabled={busy !== null} onClick={() => setConfirmDelete(true)} className="min-h-10 rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: '#dc2626' }}>
          Delete data
        </button>
      )}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/35 px-4 py-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="w-full max-w-sm rounded-xl border bg-white p-5 text-left shadow-xl" style={{ borderColor: '#e2e8f0' }}>
            <p className="text-base font-bold" style={{ color: '#1a1a2e' }}>Delete local user data?</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This deletes the local app user and linked properties, units, tenants, payments, and expenses. Clerk login is left untouched.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={busy !== null}
                className="min-h-11 w-full rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700 sm:w-auto"
                style={{ borderColor: '#e2e8f0' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => run('delete', 'DELETE')}
                disabled={busy !== null}
                className="min-h-11 w-full rounded-lg px-4 py-2 text-sm font-semibold text-white sm:w-auto"
                style={{ backgroundColor: '#dc2626' }}
              >
                {busy === 'delete' ? 'Deleting...' : 'Delete data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
