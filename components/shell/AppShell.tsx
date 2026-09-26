'use client'

import NotificationBell from '@/components/NotificationBell'
import { SupportChatProvider } from '@/components/support/SupportChat'
import { UserButton, useClerk } from '@clerk/nextjs'
import { ChevronRight, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { LogoMark } from '@/components/brand/Logo'
import MoreSheet from './MoreSheet'
import NavigationProgress from './NavigationProgress'
import Rail from './Rail'
import { ShellContext, initialsFrom, type ShellUser, type ShellValue } from './ShellContext'
import { adminNavItem, baseNavItems, isActivePath, mobileNavItems, moreRoutes } from './nav'
import { RAIL_COOKIE, RAIL_WIDTH } from './rail-state'

const RAIL_ID = 'app-rail'

function MobileTopBar() {
  return (
    <header className="sticky top-0 z-30 shrink-0 bg-canvas/90 px-4 pb-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur-md lg:hidden">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5" aria-label="EstateCore UG dashboard">
          <LogoMark tone="forest" size={40} />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[15px] font-extrabold tracking-[-0.01em] text-ink">EstateCore UG</span>
            <span className="block truncate text-[11.5px] font-semibold text-muted">Property management</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <NotificationBell size="md" />
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <UserButton />
          </span>
        </div>
      </div>
    </header>
  )
}

export default function AppShell({
  children,
  user,
  initialRailExpanded = true
}: {
  children: ReactNode
  user: ShellUser
  initialRailExpanded?: boolean
}) {
  const pathname = usePathname()
  const clerk = useClerk()
  const [railExpanded, setRailExpanded] = useState(initialRailExpanded)
  const [moreOpen, setMoreOpen] = useState(false)
  /* The tab moves on the click, not when the next page has finished loading. */
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => {
    setPendingHref(null)
  }, [pathname])

  const isAdmin = user.role === 'admin'
  const navItems = useMemo(() => (isAdmin ? [adminNavItem, ...baseNavItems] : baseNavItems), [isAdmin])
  const currentPath = pendingHref ?? pathname
  const activeIndex = navItems.findIndex((item) => isActivePath(currentPath, item.href))

  /* The phone dashboard paints its own full-bleed forest header. */
  const immersive = pathname === '/dashboard'
  const moreActive = moreRoutes.some((route) => isActivePath(currentPath, route))

  const shell: ShellValue = useMemo(() => {
    const displayName = user.name?.trim() || user.email
    return {
      user,
      displayName,
      initials: initialsFrom(displayName),
      roleLabel: isAdmin ? 'Admin' : 'Landlord',
      isAdmin,
      railExpanded
    }
  }, [user, isAdmin, railExpanded])

  const toggleRail = useCallback(() => {
    setRailExpanded((open) => {
      const next = !open
      document.cookie = `${RAIL_COOKIE}=${next ? 'expanded' : 'collapsed'}; path=/; max-age=31536000; samesite=lax`
      return next
    })
  }, [])

  const openProfile = useCallback(() => clerk.openUserProfile(), [clerk])
  const signOut = useCallback(() => {
    void clerk.signOut({ redirectUrl: '/' })
  }, [clerk])

  const railWidth = railExpanded ? RAIL_WIDTH.expanded : RAIL_WIDTH.collapsed

  const frame = (
    <div className="h-screen h-dvh w-full max-lg:bg-canvas lg:app-backdrop lg:p-5">
      <a
        href="#main"
        className="sr-only z-[200] rounded-full bg-ink px-4 py-2 text-[13px] font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <div
        className="relative flex h-full w-full overflow-hidden bg-canvas lg:rounded-[36px] lg:shadow-[0_34px_80px_-34px_rgba(4,30,18,0.65)] lg:ring-1 lg:ring-white/[0.06]"
        style={{ '--rail-w': `${railWidth}px` } as React.CSSProperties}
      >
        <div className="hidden h-full lg:flex">
          <Rail
            id={RAIL_ID}
            items={navItems}
            activeIndex={activeIndex}
            expanded={railExpanded}
            width={railWidth}
            initials={shell.initials}
            displayName={shell.displayName}
            roleLabel={shell.roleLabel}
            onNavigate={setPendingHref}
            onOpenProfile={openProfile}
            onSignOut={signOut}
          />
        </div>

        <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          {!immersive && <MobileTopBar />}

          <main
            id="main"
            tabIndex={-1}
            className={`app-shell-main relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden outline-none ${
              immersive ? 'is-flush dashboard-scroller' : ''
            }`}
          >
            <div
              className={`mx-auto w-full max-w-[1520px] lg:px-8 lg:pt-[26px] ${
                immersive ? 'lg:h-full' : 'px-4 pt-3 sm:px-5 lg:pb-8'
              }`}
            >
              {children}
            </div>
          </main>
        </div>

        <button
          type="button"
          onClick={toggleRail}
          aria-label={railExpanded ? 'Collapse menu' : 'Expand menu'}
          aria-expanded={railExpanded}
          aria-controls={RAIL_ID}
          className="group absolute top-7 z-20 hidden h-11 w-11 items-center justify-center transition-[left] duration-[400ms] ease-rail lg:flex"
          style={{ left: railWidth - 20 }}
        >
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-line-strong bg-white text-ink shadow-pop transition group-hover:scale-110">
            <ChevronRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-[400ms] ease-rail"
              strokeWidth={2.4}
              style={{ transform: `rotate(${railExpanded ? 180 : 0}deg)` }}
            />
          </span>
        </button>

        <nav
          className="mobile-bottom-nav fixed left-3 right-3 z-40 mx-auto max-w-[430px] rounded-[26px] bg-night p-1.5 shadow-float lg:hidden"
          aria-label="Primary"
        >
          <div className="flex items-stretch gap-1">
            {mobileNavItems.map((item) => {
              const active = isActivePath(currentPath, item.href) && !moreOpen
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setPendingHref(item.href)}
                  className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[20px] px-1 py-2 transition-colors duration-300 ${
                    active ? 'bg-hi text-ink' : 'text-night-muted active:bg-white/10'
                  }`}
                >
                  <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
                  <span className={`block max-w-full truncate text-[10.5px] leading-none ${active ? 'font-bold' : 'font-semibold'}`}>
                    {item.label}
                  </span>
                </Link>
              )
            })}

            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[20px] px-1 py-2 transition-colors duration-300 ${
                moreOpen || moreActive ? 'bg-hi text-ink' : 'text-night-muted active:bg-white/10'
              }`}
            >
              <MoreHorizontal aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
              <span className={`block max-w-full truncate text-[10.5px] leading-none ${moreOpen || moreActive ? 'font-bold' : 'font-semibold'}`}>
                More
              </span>
            </button>
          </div>
        </nav>

        <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} isAdmin={isAdmin} onSignOut={signOut} />
      </div>
    </div>
  )

  return (
    <ShellContext.Provider value={shell}>
      {isAdmin ? frame : <SupportChatProvider>{frame}</SupportChatProvider>}
    </ShellContext.Provider>
  )
}
