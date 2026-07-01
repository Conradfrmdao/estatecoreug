'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import {
  BarChart3,
  Building2,
  CalendarDays,
  ChevronDown,
  Grid3X3,
  LayoutDashboard,
  MapPin,
  Menu,
  ReceiptText,
  Settings,
  ShieldCheck,
  UsersRound,
  WalletCards,
  type LucideIcon
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import Image from 'next/image'
import NotificationBell from '@/components/NotificationBell'

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

const baseNavItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    href: '/properties',
    label: 'Properties',
    icon: Building2
  },
  {
    href: '/units',
    label: 'Units',
    icon: Grid3X3
  },
  {
    href: '/tenants',
    label: 'Tenants',
    icon: UsersRound
  },
  {
    href: '/payments',
    label: 'Payments',
    icon: WalletCards
  },
  {
    href: '/expenses',
    label: 'Expenses',
    icon: ReceiptText
  },
  {
    href: '/calendar',
    label: 'Calendar',
    icon: CalendarDays
  },
  {
    href: '/reports',
    label: 'Reports',
    icon: BarChart3
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings
  }
]

const mobileNavItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    href: '/properties',
    label: 'Properties',
    icon: Building2
  },
  {
    href: '/units',
    label: 'Units',
    icon: Grid3X3
  },
  {
    href: '/tenants',
    label: 'Tenants',
    icon: UsersRound
  },
  {
    href: '/payments',
    label: 'Payments',
    icon: WalletCards
  },
  {
    href: '/expenses',
    label: 'Expenses',
    icon: ReceiptText
  }
]

const secondaryNavItems: NavItem[] = [
  {
    href: '/calendar',
    label: 'Calendar',
    icon: CalendarDays
  },
  {
    href: '/reports',
    label: 'Reports',
    icon: BarChart3
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings
  }
]

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function currentPageTitle(pathname: string, navItems: NavItem[]) {
  return navItems.find((item) => isActivePath(pathname, item.href))?.label ?? 'Dashboard'
}

function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#071a0f] shadow-sm ring-1 ring-black/5">
        <Image
          src="/estatecore-mark.png"
          alt="EstateCore UG mark"
          width={96}
          height={96}
          className="h-12 w-12 object-contain"
          priority
        />
      </span>
      {!compact && (
        <span className="min-w-0 leading-none">
          <span className="block text-[16px] font-extrabold" style={{ color: 'var(--foreground)' }}>
            EstateCore UG
          </span>
          <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>
            Property Management
          </span>
        </span>
      )}
    </div>
  )
}

function SecondaryMobileMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasActiveSecondaryRoute = secondaryNavItems.some((item) => isActivePath(pathname, item.href))

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  return (
    <div ref={containerRef} className="relative lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Open secondary navigation"
        className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition ${
          hasActiveSecondaryRoute
            ? 'border-transparent bg-emerald-600 text-white'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
        }`}
      >
        <Menu aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
          {secondaryNavItems.map((item) => {
            const active = isActivePath(pathname, item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${
                  active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.9} />
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AppShell({ children, isAdmin = false }: { children: ReactNode; isAdmin?: boolean }) {
  const pathname = usePathname()
  const { user } = useUser()
  const navItems = isAdmin
    ? [
        { href: '/admin', label: 'Admin', icon: ShieldCheck },
        ...baseNavItems
      ]
    : baseNavItems
  const pageTitle = currentPageTitle(pathname, navItems)

  return (
    <div className="flex h-screen h-dvh w-full overflow-hidden bg-[#f8fafb]">
      <aside className="hidden h-full w-[236px] flex-shrink-0 border-r bg-white lg:flex lg:flex-col"
        style={{ borderColor: 'var(--border)', boxShadow: '1px 0 0 #f1f5f9' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <Link href="/dashboard" className="flex items-center gap-3">
            <BrandLockup />
          </Link>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  active
                    ? 'text-white shadow-sm'
                    : 'hover:bg-slate-50'
                }`}
                style={active ? {
                  backgroundColor: 'var(--brand)',
                  color: '#fff'
                } : {
                  color: 'var(--muted)'
                }}
              >
                <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.9} />
                {item.label}
              </Link>
            )
          })}
        </nav>

      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="sticky top-0 z-30 flex-shrink-0 border-b bg-white/95 px-3 py-2.5 backdrop-blur lg:hidden"
          style={{ borderColor: 'var(--border)' }}>
          <div className="flex min-w-0 items-center justify-between gap-2">
            <Link href="/dashboard" className="flex min-w-0 items-center gap-2" aria-label="Estate Core UG dashboard">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#071a0f] ring-1 ring-black/5">
                <Image
                  src="/estatecore-mark.png"
                  alt="EstateCore UG mark"
                  width={72}
                  height={72}
                  className="h-9 w-9 object-contain"
                  priority
                />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-black text-slate-950">Estate Core UG</span>
                <span className="block truncate text-xs font-semibold text-slate-500">{pageTitle}</span>
              </span>
            </Link>

            <div className="flex shrink-0 items-center gap-1.5">
              <SecondaryMobileMenu pathname={pathname} />
              <NotificationBell />
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                <UserButton />
              </div>
            </div>
          </div>
        </header>

        <header className="hidden flex-shrink-0 border-b bg-white px-6 py-3 lg:block"
          style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
              <MapPin aria-hidden="true" className="h-4 w-4" strokeWidth={1.9} />
              Kampala, Uganda
            </div>
            <div className="ml-auto flex items-center gap-3">
              <NotificationBell />
              <div className="flex items-center gap-3">
                <UserButton />
                <div className="hidden leading-tight sm:block">
                  <p className="max-w-[140px] truncate text-sm font-bold text-slate-900">
                    {user?.fullName || user?.primaryEmailAddress?.emailAddress || 'My Account'}
                  </p>
                  <p className="text-xs text-slate-500">{isAdmin ? 'Admin' : 'Landlord'}</p>
                </div>
                <ChevronDown aria-hidden="true" className="hidden h-4 w-4 text-slate-400 sm:block" strokeWidth={1.9} />
              </div>
            </div>
          </div>
        </header>

        <main className="app-shell-main flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-5 lg:px-6">
          <div className="mx-auto w-full max-w-[1440px]">
            {children}
          </div>
        </main>

        <nav className="mobile-bottom-nav fixed left-2 right-2 z-40 mx-auto max-w-[430px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-[0_18px_48px_rgba(15,23,42,0.22)] backdrop-blur-xl lg:hidden" aria-label="Primary mobile navigation">
          <div className="mobile-bottom-nav-scroll flex gap-1 overflow-x-auto overscroll-x-contain">
            {mobileNavItems.map((item) => {
              const active = isActivePath(pathname, item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-w-[3.65rem] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-[9.5px] font-black leading-none transition min-[390px]:min-w-[3.9rem] ${
                    active
                      ? 'text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  style={active ? { backgroundColor: 'var(--brand)' } : undefined}
                >
                  <Icon aria-hidden="true" className="h-[17px] w-[17px] shrink-0" strokeWidth={1.9} />
                  <span className="block max-w-full truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
