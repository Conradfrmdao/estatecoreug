'use client'

import SidebarCollection from '@/components/SidebarCollection'
import { SupportChatTrigger } from '@/components/support/SupportChat'
import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { LogoMark } from '@/components/brand/Logo'
import type { NavItem } from './nav'

/* Rail geometry, from the design: items are 44px tall on a 54px pitch and the
   first sits 132px from the top (88px header + 44px of headroom for the notch). */
const PITCH = 54
const LIST_PAD = 44

export default function Rail({
  id,
  items,
  activeIndex,
  expanded,
  width,
  initials,
  displayName,
  roleLabel,
  onNavigate,
  onOpenProfile,
  onSignOut
}: {
  id: string
  items: NavItem[]
  activeIndex: number
  expanded: boolean
  width: number
  initials: string
  displayName: string
  roleLabel: string
  onNavigate: (href: string) => void
  onOpenProfile: () => void
  onSignOut: () => void
}) {
  const hasActive = activeIndex >= 0
  const index = Math.max(activeIndex, 0)

  return (
    <nav
      id={id}
      aria-label="Main menu"
      className="relative flex h-full shrink-0 flex-col overflow-hidden bg-forest transition-[width] duration-[400ms] ease-rail"
      style={{ width }}
    >
      <div className="relative h-[88px] shrink-0">
        <Link
          href="/dashboard"
          aria-label="EstateCore UG home"
          onClick={() => onNavigate('/dashboard')}
          className="absolute left-[18px] top-[18px] flex h-[52px] w-[52px] items-center justify-center rounded-2xl transition-[background-color,transform] duration-300 ease-out-soft hover:scale-[1.04] hover:bg-white/[0.06]"
        >
          <LogoMark tone="white" size={46} />
        </Link>
        <div
          className="absolute left-[82px] top-[30px] flex flex-col gap-0.5 whitespace-nowrap transition-[opacity,visibility] duration-[250ms]"
          style={{ opacity: expanded ? 1 : 0, visibility: expanded ? 'visible' : 'hidden' }}
        >
          <span className="text-[16px] font-extrabold leading-[22px] tracking-[-0.01em] text-white">EstateCore UG</span>
          <span className="text-[11px] font-semibold leading-4 text-forest-muted">Property management</span>
        </div>
      </div>

      <div className="no-scrollbar relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="relative" style={{ paddingTop: LIST_PAD, paddingBottom: LIST_PAD }}>
          {/* Collapsed: the canvas bulges into the rail around the active icon. */}
          <svg
            aria-hidden="true"
            width="63"
            height="128"
            viewBox="0 0 63 128"
            className="pointer-events-none absolute right-0 transition-[top,opacity] duration-[550ms] ease-rail"
            style={{
              top: LIST_PAD + index * PITCH - 42,
              opacity: hasActive && !expanded ? 1 : 0,
              transitionDuration: '550ms, 250ms'
            }}
          >
            <path d="M63 0C63 24 51 31 39 36C25 42 1 44 1 64C1 84 25 86 39 92C51 97 63 104 63 128Z" fill="rgb(var(--c-canvas))" />
          </svg>

          {/* Expanded: a tab that runs from the item into the page. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-4 right-0 h-12 transition-[top,opacity] ease-rail"
            style={{
              top: LIST_PAD + index * PITCH - 2,
              opacity: hasActive && expanded ? 1 : 0,
              transitionDuration: '550ms, 250ms'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" className="absolute -top-6 right-0">
              <path d="M0 24H24V0A24 24 0 0 1 0 24Z" fill="rgb(var(--c-canvas))" />
            </svg>
            <div className="absolute inset-0 rounded-l-[24px] bg-canvas" />
            <svg width="24" height="24" viewBox="0 0 24 24" className="absolute -bottom-6 right-0">
              <path d="M0 0H24V24A24 24 0 0 0 0 0Z" fill="rgb(var(--c-canvas))" />
            </svg>
          </div>

          <ul className="relative flex flex-col gap-2.5 pl-[22px]">
            {items.map((item, itemIndex) => {
              const active = itemIndex === activeIndex
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    title={expanded ? undefined : item.label}
                    onClick={(event) => {
                      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
                      onNavigate(item.href)
                    }}
                    className={`flex h-11 items-center gap-4 overflow-hidden whitespace-nowrap rounded-full pl-[11px] text-[14px] leading-5 transition-[width,color,background-color] duration-[400ms] ease-rail ${
                      active
                        ? 'font-bold text-ink'
                        : 'font-semibold text-forest-muted hover:bg-white/[0.07] hover:text-white'
                    }`}
                    style={{ width: expanded ? 210 : 44 }}
                  >
                    <Icon aria-hidden="true" className="h-[22px] w-[22px] shrink-0" strokeWidth={1.8} />
                    <span
                      className="transition-opacity duration-[250ms]"
                      style={{ opacity: expanded ? 1 : 0 }}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Both footers share one cell and cross-fade, so the rail never reflows. */}
      <div className="grid shrink-0 pb-6 pt-3 [grid-template-areas:'stack']">
        <div
          className="flex w-[88px] flex-col items-center gap-3 self-end transition-[opacity,visibility] duration-[250ms] [grid-area:stack]"
          style={{ opacity: expanded ? 0 : 1, visibility: expanded ? 'hidden' : 'visible' }}
        >
          <SupportChatTrigger variant="rail-icon" />
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Your profile"
            title={displayName}
            className="h-11 w-11 rounded-full bg-white text-[14px] font-extrabold text-ink transition hover:scale-105"
          >
            {initials}
          </button>
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Log out"
            title="Log out"
            className="flex h-11 w-11 items-center justify-center rounded-full text-forest-muted transition hover:bg-white/[0.08] hover:text-white"
          >
            <LogOut aria-hidden="true" className="h-[22px] w-[22px]" strokeWidth={1.8} />
          </button>
        </div>

        <div
          className="ml-[14px] flex w-[220px] flex-col gap-3 self-end transition-[opacity,visibility] duration-[250ms] [grid-area:stack]"
          style={{ opacity: expanded ? 1 : 0, visibility: expanded ? 'visible' : 'hidden' }}
        >
          <div className="hidden [@media(min-height:860px)]:block">
            <SidebarCollection />
          </div>
          <SupportChatTrigger variant="rail-card" />
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenProfile}
              aria-label="Your profile"
              className="h-11 w-11 shrink-0 rounded-full bg-white text-[14px] font-extrabold text-ink transition hover:scale-105"
            >
              {initials}
            </button>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[14px] font-bold leading-5 text-white">{displayName}</span>
              <span className="text-[12px] font-medium leading-4 text-forest-muted">{roleLabel}</span>
            </span>
            <button
              type="button"
              onClick={onSignOut}
              aria-label="Log out"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-forest-muted transition hover:bg-white/[0.08] hover:text-white"
            >
              <LogOut aria-hidden="true" className="h-[22px] w-[22px]" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
