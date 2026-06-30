'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AuthBackButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back()
        } else {
          router.push('/')
        }
      }}
      className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      style={{ borderColor: '#e2e8f0' }}
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  )
}
