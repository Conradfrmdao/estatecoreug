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
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useState } from 'react'

import Image from 'next/image'
import NotificationBell from '@/components/NotificationBell'

const baseNavItems = [
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

function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#071a0f] shadow-sm ring-1 ring-black/5">
        <Image
          src="/estatecore-mark.png"
          alt="EstateCore UG mark"
          width={96}
          height={96}
          className="h-12 w-12 object-cover"
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

export default function AppShell({ children, isAdmin = false }: { children: ReactNode; isAdmin?: boolean }) {
  const pathname = usePathname()
  const { user } = useUser()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navItems = isAdmin
    ? [
        { href: '/admin', label: 'Admin', icon: ShieldCheck },
        ...baseNavItems
      ]
    : baseNavItems

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafb]">
      {/* Sidebar */}
      <aside className="hidden w-[236px] border-r bg-white lg:flex lg:flex-col h-full flex-shrink-0"
        style={{ borderColor: 'var(--border)', boxShadow: '1px 0 0 #f1f5f9' }}>
        {/* Logo */}
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <Link href="/dashboard" className="flex items-center gap-3">
            <BrandLockup />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
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

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col"
            style={{ boxShadow: 'var(--shadow-lg)' }}>
            <div className="px-5 py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                <BrandLockup />
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg" style={{ color: 'var(--muted)' }}>
                <X aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150`}
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
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b px-4 py-3 sm:px-6 flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between gap-4">
            <button
              className="lg:hidden p-2 rounded-lg transition"
              style={{ color: 'var(--muted)' }}
              onClick={() => setMobileOpen(true)}
            >
              <Menu aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
            </button>
            <Link href="/dashboard" className="font-bold text-sm lg:hidden animate-fade-in" style={{ color: 'var(--foreground)' }}>
              <BrandLockup compact />
            </Link>
            <div className="hidden lg:flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
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

        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 lg:px-6">
          <div className="mx-auto w-full max-w-[1440px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
