import AppShell from '@/components/AppShell'
import { requireCurrentAppUser } from '@/lib/auth'
import type { Viewport } from 'next'
import type { ReactNode } from 'react'

/**
 * The dashboard paints an aurora header behind the status bar, so the browser
 * chrome and the notch/safe area must match it rather than fall back to white.
 */
export const viewport: Viewport = {
  themeColor: '#0a4b3a'
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireCurrentAppUser()
  return <AppShell isAdmin={user.role === 'admin'}>{children}</AppShell>
}
