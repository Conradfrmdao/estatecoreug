import AppShell from '@/components/AppShell'
import { requireCurrentAppUser } from '@/lib/auth'
import type { ReactNode } from 'react'

export default async function ExpensesLayout({ children }: { children: ReactNode }) {
  const user = await requireCurrentAppUser()
  return <AppShell isAdmin={user.role === 'admin'}>{children}</AppShell>
}
