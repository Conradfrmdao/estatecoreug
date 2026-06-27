'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteButton({
  endpoint,
  label = 'Delete'
}: {
  endpoint: string
  label?: string
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleDelete() {
    if (!window.confirm('Delete this record?')) {
      return
    }

    setPending(true)

    const response = await fetch(endpoint, { method: 'DELETE' })

    setPending(false)

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      alert(payload?.error ?? 'Unable to delete this record.')
      return
    }

    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="rounded-md border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Deleting...' : label}
    </button>
  )
}
