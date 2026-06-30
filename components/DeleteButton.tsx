'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteButton({
  endpoint,
  label = 'Delete',
  confirmMessage = 'Delete this record?'
}: {
  endpoint: string
  label?: string
  confirmMessage?: string
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')

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
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => {
          setError('')
          setConfirming(true)
        }}
        disabled={pending}
        className="rounded-md border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Deleting...' : label}
      </button>

      {confirming && (
        <span className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <span className="w-full max-w-sm rounded-xl border bg-white p-5 text-left shadow-xl" style={{ borderColor: '#e2e8f0' }}>
            <span className="block text-base font-bold" style={{ color: '#1a1a2e' }}>
              Confirm delete
            </span>
            <span className="mt-2 block text-sm leading-6 text-slate-600">
              {confirmMessage}
            </span>
            {error && (
              <span className="mt-4 block rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                {error}
              </span>
            )}
            <span className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={pending}
                className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
                style={{ borderColor: '#e2e8f0' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: '#dc2626' }}
              >
                {pending ? 'Deleting...' : 'Delete'}
              </button>
            </span>
          </span>
        </span>
      )}
    </span>
  )
}
