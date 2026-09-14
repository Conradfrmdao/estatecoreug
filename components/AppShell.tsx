'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import {
  BarChart3,
  Building2,
  CalendarDays,
  ChevronRight,
  Grid3X3,
  LayoutDashboard,
  MapPin,
  MoreHorizontal,
  ReceiptText,
  Settings,
  ShieldCheck,
  UsersRound,
  WalletCards,
  type LucideIcon
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'

import Image from 'next/image'
import MoreSheet from '@/components/MoreSheet'
import NotificationBell from '@/components/NotificationBell'
import SupportChatWidget from '@/components/SupportChatWidget'

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  children?: NavItem[]
}

const baseNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    href: '/properties',
    label: 'Properties',
    icon: Building2,
    children: [
      { href: '/units', label: 'Units', icon: Grid3X3 },
      { href: '/tenants', label: 'Tenants', icon: UsersRound }
    ]
  },
  { href: '/payments', label: 'Payments', icon: WalletCards },
  { href: '/expenses', label: 'Expenses', icon: ReceiptText },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings }
]

/* The bottom bar carries five destinations; everything else lives in More. */
const mobileNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/tenants', label: 'Tenants', icon: UsersRound },
  { href: '/payments', label: 'Payments', icon: WalletCards },
  { href: '/properties', label: 'Property', icon: Building2 }
]

const moreRoutes = ['/units', '/expenses', '/calendar', '/reports', '/settings']

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function currentPageTitle(pathname: string, navItems: NavItem[]) {
  for (const item of navItems) {
    for (const child of item.children ?? []) {
      if (isActivePath(pathname, child.href)) return child.label
    }
    if (isActivePath(pathname, item.href)) return item.label
  }

  return 'Dashboard'
}

function SidebarLink({
  item,
  pathname,
  nested = false
}: {
  item: NavItem
  pathname: string
  nested?: boolean
}) {
  const active = isActivePath(pathname, item.href)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-[42px] items-center gap-3 rounded-[10px] px-3 text-[14px] transition-colors duration-150 ${
        nested ? 'ml-3 pl-4' : ''
      } ${
        active
          ? 'bg-[#0a6b4f] font-semibold text-white shadow-[0_6px_16px_rgba(0,0,0,0.18)]'
          : 'font-medium text-emerald-50/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon
        aria-hidden="true"
        className={`shrink-0 ${nested ? 'h-[18px] w-[18px]' : 'h-5 w-5'}`}
        strokeWidth={1.75}
      />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.children && !nested && (
        <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 opacity-45" strokeWidth={1.75} />
      )}
    </Link>
  )
}

export default function AppShell({ children, isAdmin = false }: { children: ReactNode; isAdmin?: boolean }) {
  const pathname = usePathname()
  const { user } = useUser()
  const [moreOpen, setMoreOpen] = useState(false)

  const navItems = isAdmin
    ? [{ href: '/admin', label: 'Admin', icon: ShieldCheck }, ...baseNavItems]
    : baseNavItems
  const pageTitle = currentPageTitle(pathname, navItems)

  /* The dashboard paints its own full-bleed aurora header on mobile. */
  const immersive = pathname === '/dashboard'
  const moreActive = moreRoutes.some((route) => isActivePath(pathname, route))

  return (
    <div className="flex h-screen h-dvh w-full overflow-hidden bg-[var(--surface-sunken)]">
      <aside className="relative isolate hidden h-full w-[264px] flex-shrink-0 overflow-hidden text-white shadow-[8px_0_32px_rgba(2,44,37,0.10)] lg:flex lg:flex-col">
        <div className="absolute inset-0 -z-30 overflow-hidden" aria-hidden="true">
          <Image
            src="/estatecore-sidebar-bg.png"
            alt=""
            fill
            sizes="264px"
            className="object-cover object-bottom"
          />
        </div>
        <div className="absolute inset-0 -z-20 bg-[#04302a]/25" aria-hidden="true" />
        <div
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(4,40,34,0.82)_0%,rgba(6,63,53,0.72)_58%,rgba(4,48,42,0.58)_100%)]"
          aria-hidden="true"
        />

        <div className="shrink-0 px-5 py-5">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[var(--brand-ink)] ring-1 ring-white/10">
              <Image
                src="/estatecore-mark.png"
                alt="EstateCore UG"
                width={88}
                height={88}
                className="h-11 w-11 object-contain"
                priority
              />
            </span>
            <span className="min-w-0">
              <span className="t-section block truncate text-white">EstateCore UG</span>
              <span className="t-label mt-0.5 block truncate text-emerald-100/55">Property management</span>
            </span>
          </Link>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-3">
          {navItems.map((item) => (
            <div key={item.href} className="space-y-1">
              <SidebarLink item={item} pathname={pathname} />
              {item.children?.map((child) => (
                <SidebarLink key={child.href} item={child} pathname={pathname} nested />
              ))}
            </div>
          ))}
        </nav>

        {!isAdmin && (
          <div className="shrink-0 border-t border-white/10 p-3">
            <SupportChatWidget />
          </div>
        )}
      </aside>

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        {!immersive && (
          <header className="sticky top-0 z-30 flex-shrink-0 border-b border-[var(--line)] bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <Link
                href="/dashboard"
                className="flex min-w-0 items-center gap-2.5"
                aria-label="EstateCore UG dashboard"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[var(--brand-ink)] ring-1 ring-black/5">
                  <Image
                    src="/estatecore-mark.png"
                    alt=""
                    width={72}
                    height={72}
                    className="h-9 w-9 object-contain"
                    priority
                  />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="t-section block truncate text-[var(--text-ink)]">{pageTitle}</span>
                  <span className="block truncate text-[12px] text-[var(--text-muted)]">EstateCore UG</span>
                </span>
              </Link>

              <div className="flex shrink-0 items-center gap-1.5">
                <NotificationBell />
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-white">
                  <UserButton />
                </div>
              </div>
            </div>
          </header>
        )}

        <header className="hidden flex-shrink-0 border-b border-[var(--line)] bg-white px-6 py-3 lg:block">
          <div className="flex items-center justify-between gap-4">
            <div className="t-small flex items-center gap-2 text-[var(--text-muted)]">
              <MapPin aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
              Kampala, Uganda
            </div>
            <div className="ml-auto flex items-center gap-3">
              <NotificationBell />
              <div className="flex items-center gap-2.5">
                <UserButton />
                <div className="hidden leading-tight sm:block">
                  <p className="max-w-[160px] truncate text-[14px] font-semibold text-[var(--text-ink)]">
                    {user?.fullName || user?.primaryEmailAddress?.emailAddress || 'My account'}
                  </p>
                  <p className="text-[12px] text-[var(--text-muted)]">{isAdmin ? 'Admin' : 'Landlord'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main
          className={`app-shell-main flex-1 overflow-y-auto overflow-x-hidden ${
            immersive ? 'px-0 py-0 lg:px-6 lg:py-5' : 'px-4 py-4 sm:px-5 lg:px-6 lg:py-5'
          }`}
        >
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>

        <nav
          className="mobile-bottom-nav fixed left-3 right-3 z-40 mx-auto max-w-[430px] rounded-[18px] border border-[var(--line)] bg-white/97 px-1.5 py-1.5 shadow-[0_16px_40px_rgba(6,63,53,0.18)] backdrop-blur-xl lg:hidden"
          aria-label="Primary"
        >
          <div className="flex items-stretch gap-0.5">
            {mobileNavItems.map((item) => {
              const active = isActivePath(pathname, item.href) && !moreOpen
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[12px] px-1 py-1.5"
                >
                  <span
                    className={`flex h-9 w-full max-w-[52px] items-center justify-center rounded-[11px] transition-colors ${
                      active ? 'bg-[var(--brand)] text-white' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span
                    className={`block max-w-full truncate text-[10px] leading-none ${
                      active ? 'font-semibold text-[var(--brand-text)]' : 'font-medium text-[var(--text-muted)]'
                    }`}
                  >
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
              className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[12px] px-1 py-1.5"
            >
              <span
                className={`flex h-9 w-full max-w-[52px] items-center justify-center rounded-[11px] transition-colors ${
                  moreOpen || moreActive ? 'bg-[var(--brand)] text-white' : 'text-[var(--text-muted)]'
                }`}
              >
                <MoreHorizontal aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span
                className={`block max-w-full truncate text-[10px] leading-none ${
                  moreOpen || moreActive
                    ? 'font-semibold text-[var(--brand-text)]'
                    : 'font-medium text-[var(--text-muted)]'
                }`}
              >
                More
              </span>
            </button>
          </div>
        </nav>

        <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} isAdmin={isAdmin} />
      </div>
    </div>
  )
}
