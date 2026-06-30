'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import FormNotice from '@/components/FormNotice'

type PropertyFormProps = {
  initialData?: {
    id: number
    name: string
    location: string
  }
}

export default function PropertyForm({ initialData }: PropertyFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialData?.name ?? '')
  const [location, setLocation] = useState(initialData?.location ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    const res = await fetch(initialData ? `/api/properties/${initialData.id}` : '/api/properties', {
      method: initialData ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, location }),
    })

    setIsSaving(false)

    if (res.ok) {
      router.push('/properties')
      router.refresh()
    } else {
      const payload = await res.json().catch(() => null)
      setError(payload?.error ?? 'Failed to save property')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <FormNotice message={error} />

      <div>
        <label className="field-label">Property name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="field-input"
          placeholder="Kampala Heights"
        />
      </div>

      <div>
        <label className="field-label">Location</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          className="field-input"
          placeholder="Ntinda, Kampala"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          disabled={isSaving}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: '#00A550', boxShadow: '0 4px 14px rgba(0,165,80,0.3)' }}
        >
          {isSaving ? 'Saving…' : initialData ? 'Save Property' : 'Create Property'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl px-4 py-2.5 text-sm font-medium transition"
          style={{ border: '1.5px solid #e2e8f0', color: '#64748b' }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
