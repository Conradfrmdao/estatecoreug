import AppShell from '@/components/AppShell'
import { requireAdminUser } from '@/lib/auth'
import type { ReactNode } from 'react'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminUser()
  return <AppShell isAdmin>{children}</AppShell>
}
