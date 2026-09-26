'use client'

import RentTrackerDialog from '@/components/rent-tracker/RentTrackerDialog'
import { useState, type ReactNode } from 'react'

/**
 * Whatever it wraps becomes the way into the rent tracker: the dashboard card
 * on a computer, the tile on a phone. The face is drawn by the page; this only
 * opens the tracker at the month and property the page is showing.
 */
export default function RentTrackerLauncher({
  month,
  propertyId,
  className,
  children
}: {
  month: string
  propertyId: number | null
  className: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className={className}>
        {children}
      </button>
      <RentTrackerDialog
        open={open}
        onClose={() => setOpen(false)}
        initialMonth={month}
        initialPropertyId={propertyId}
      />
    </>
  )
}
