import AppShell from '@/components/shell/AppShell'
import { RAIL_COOKIE } from '@/components/shell/rail-state'
import { requireCurrentAppUser } from '@/lib/auth'
import type { Viewport } from 'next'
import { cookies } from 'next/headers'
import type { ReactNode } from 'react'

/* Every signed-in section shares this one shell, so moving between them keeps
   the rail, its state and its open requests instead of rebuilding them. */
export const viewport: Viewport = {
  themeColor: '#F5F7F4'
}

export default async function SignedInLayout({ children }: { children: ReactNode }) {
  const [user, cookieStore] = await Promise.all([requireCurrentAppUser(), cookies()])

  return (
    <AppShell
      user={{
        name: user.name,
        email: user.email,
        role: user.role === 'admin' ? 'admin' : 'landlord'
      }}
      initialRailExpanded={cookieStore.get(RAIL_COOKIE)?.value !== 'collapsed'}
    >
      {children}
    </AppShell>
  )
}
