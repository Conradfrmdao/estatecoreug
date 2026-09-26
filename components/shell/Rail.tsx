'use client'

import SidebarCollection from '@/components/SidebarCollection'
import { SupportChatTrigger } from '@/components/support/SupportChat'
import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { LogoMark } from '@/components/brand/Logo'
import type { NavItem } from './nav'

/* Rail geometry comes from CSS variables on .rail (app/globals.css). On a
   tall screen it is the design's: 44px items on a 54px pitch, the first 132px
   from the top. On a shorter one every measure steps down, so all the links
   fit at 100% zoom instead of the last ones scrolling out of sight. */
const PITCH = 'calc(var(--rail-item) + var(--rail-gap))'

function railTop(index: number, offset: string) {
  return `calc(var(--rail-pad) + ${index} * ${PITCH} + ${offset})`
}

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
      className="rail relative flex h-full shrink-0 flex-col overflow-hidden bg-forest transition-[width] duration-[400ms] ease-rail"
      style={{ width }}
    >
      <div className="relative shrink-0" style={{ height: 'var(--rail-head)' }}>
        <Link
          href="/dashboard"
          aria-label="EstateCore UG home"
          onClick={() => onNavigate('/dashboard')}
          className="absolute left-[18px] flex h-[52px] w-[52px] items-center justify-center rounded-2xl transition-[background-color,transform] duration-300 ease-out-soft hover:scale-[1.04] hover:bg-white/[0.06]"
          style={{ top: 'calc((var(--rail-head) - 52px) / 2)' }}
        >
          <LogoMark tone="white" size={46} />
        </Link>
        <div
          className="absolute left-[82px] flex flex-col gap-0.5 whitespace-nowrap transition-[opacity,visibility] duration-[250ms]"
          style={{
            top: 'calc((var(--rail-head) - 40px) / 2)',
            opacity: expanded ? 1 : 0,
            visibility: expanded ? 'visible' : 'hidden'
          }}
        >
          <span className="text-[16px] font-extrabold leading-[22px] tracking-[-0.01em] text-white">EstateCore UG</span>
          <span className="text-[11px] font-semibold leading-4 text-forest-muted">Property management</span>
        </div>
      </div>

      <div className="rail-list relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="relative" style={{ paddingTop: 'var(--rail-pad)', paddingBottom: 'var(--rail-pad)' }}>
          {/* Collapsed: the canvas bulges into the rail around the active icon. */}
          <svg
            aria-hidden="true"
            width="63"
            height="128"
            viewBox="0 0 63 128"
            className="pointer-events-none absolute right-0 transition-[top,opacity] duration-[550ms] ease-rail"
            style={{
              top: railTop(index, 'var(--rail-item) / 2 - 64px'),
              opacity: hasActive && !expanded ? 1 : 0,
              transitionDuration: '550ms, 250ms'
            }}
          >
            <path d="M63 0C63 24 51 31 39 36C25 42 1 44 1 64C1 84 25 86 39 92C51 97 63 104 63 128Z" fill="rgb(var(--c-canvas))" />
          </svg>

          {/* Expanded: a tab that runs from the item into the page. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-4 right-0 transition-[top,opacity] ease-rail"
            style={{
              top: railTop(index, '-2px'),
              height: 'calc(var(--rail-item) + 4px)',
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

          <ul className="relative flex flex-col pl-[22px]" style={{ gap: 'var(--rail-gap)' }}>
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
                    className={`flex items-center gap-4 overflow-hidden whitespace-nowrap rounded-full pl-[11px] text-[14px] leading-5 transition-[width,color,background-color] duration-[400ms] ease-rail ${
                      active
                        ? 'font-bold text-ink'
                        : 'font-semibold text-forest-muted hover:bg-white/[0.07] hover:text-white'
                    }`}
                    style={{ width: expanded ? 210 : 44, height: 'var(--rail-item)' }}
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
      <div
        className="grid shrink-0 [grid-template-areas:'stack']"
        style={{ paddingTop: 'var(--rail-foot-top)', paddingBottom: 'var(--rail-foot-bottom)' }}
      >
        <div
          className="flex w-[88px] flex-col items-center self-end transition-[opacity,visibility] duration-[250ms] [grid-area:stack]"
          style={{ gap: 'var(--rail-foot-gap)', opacity: expanded ? 0 : 1, visibility: expanded ? 'hidden' : 'visible' }}
        >
          <SupportChatTrigger variant="rail-icon" />
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Your profile"
            title={displayName}
            className="rail-foot-button rounded-full bg-white text-[14px] font-extrabold text-ink transition hover:scale-105"
          >
            {initials}
          </button>
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Log out"
            title="Log out"
            className="rail-foot-button flex items-center justify-center rounded-full text-forest-muted transition hover:bg-white/[0.08] hover:text-white"
          >
            <LogOut aria-hidden="true" className="h-[22px] w-[22px]" strokeWidth={1.8} />
          </button>
        </div>

        <div
          className="ml-[14px] flex w-[220px] flex-col self-end transition-[opacity,visibility] duration-[250ms] [grid-area:stack]"
          style={{ gap: 'var(--rail-foot-gap)', opacity: expanded ? 1 : 0, visibility: expanded ? 'visible' : 'hidden' }}
        >
          {/* Only where there is room for it and every link as well. */}
          <div className="hidden [@media(min-height:960px)]:block">
            <SidebarCollection />
          </div>
          <SupportChatTrigger variant="rail-card" />
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenProfile}
              aria-label="Your profile"
              className="rail-foot-button shrink-0 rounded-full bg-white text-[14px] font-extrabold text-ink transition hover:scale-105"
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
              className="rail-foot-button flex shrink-0 items-center justify-center rounded-full text-forest-muted transition hover:bg-white/[0.08] hover:text-white"
            >
              <LogOut aria-hidden="true" className="h-[22px] w-[22px]" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
