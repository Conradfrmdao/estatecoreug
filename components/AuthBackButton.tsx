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
      className="btn btn-sm btn-white"
    >
      <ArrowLeft aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
      Back
    </button>
  )
}
