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

      <div className="form-actions">
        <button
          disabled={isSaving}
          className="btn btn-lg btn-ink px-7"
        >
          {isSaving ? 'Saving…' : initialData ? 'Save Property' : 'Create Property'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-lg btn-outline"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
