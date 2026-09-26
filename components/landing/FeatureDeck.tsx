'use client'

import Image, { type StaticImageData } from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent
} from 'react'

export type DeckFeature = {
  title: string
  body: string
  image: StaticImageData
  alt: string
  /* A photograph needs a dark gradient under its title. A picture of the app
     already ends in solid green, and shading it only greys out the app. */
  shade?: boolean
}

/* How long a card stays on top before the next is dealt, how long a card
   spends in the air, and how far a finger has to drag one to throw it. */
const HOLD_MS = 5200
const FLY_MS = 460
const SWIPE_PX = 80
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

/* A loose, hand-held stack: each card further down sits a little off true.
   Cards below the fourth wait out of sight behind it. */
const STACK = [
  { x: 0, y: 0, r: 0, s: 1 },
  { x: -22, y: 14, r: -6, s: 0.97 },
  { x: 24, y: 24, r: 5, s: 0.94 },
  { x: -6, y: 34, r: -2, s: 0.91 }
]
/* Pointing at the deck spreads it, the way you would fan a hand of cards. */
const FAN = [
  { x: 0, y: -6, r: 0, s: 1.01 },
  { x: -64, y: 18, r: -10, s: 0.96 },
  { x: 66, y: 26, r: 9, s: 0.93 },
  { x: -18, y: 44, r: -3, s: 0.9 }
]

function place(depth: number, fanned: boolean) {
  const table = fanned ? FAN : STACK
  const p = table[Math.min(depth, table.length - 1)]
  return `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.r}deg) scale(${p.s})`
}

function offDeck(dir: 1 | -1) {
  return `translate3d(${dir * 118}%, -6%, 0) rotate(${dir * 16}deg) scale(0.98)`
}

type Deal = 'idle' | 'waiting' | 'dealing' | 'dealt'

export default function FeatureDeck({
  features,
  eyebrow,
  title,
  titleId
}: {
  features: DeckFeature[]
  eyebrow: string
  title: string
  titleId: string
}) {
  const count = features.length
  const [active, setActive] = useState(0)
  /* The card thrown off the top, and the card being thrown back onto it. */
  const [flying, setFlying] = useState<{ index: number; dir: 1 | -1 } | null>(null)
  const [entering, setEntering] = useState<number | null>(null)
  const [dragX, setDragX] = useState<number | null>(null)
  const [deal, setDeal] = useState<Deal>('idle')
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [inView, setInView] = useState(false)
  const [takenOver, setTakenOver] = useState(false)
  const [reduced, setReduced] = useState(false)

  const deckRef = useRef<HTMLDivElement>(null)
  const busy = useRef(false)
  const timers = useRef<number[]>([])
  const pointer = useRef<{ id: number; x: number; y: number; dx: number; moved: boolean } | null>(null)
  const swallowClick = useRef(false)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const baseId = useId()

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((timer) => window.clearTimeout(timer))
  }, [])

  function later(run: () => void, ms: number) {
    timers.current.push(window.setTimeout(run, ms))
  }

  /* The deck is drawn stacked on the server, so it is there without script.
     Once the page is live, a deck still below the fold is gathered up and
     dealt out when it scrolls into view. */
  useEffect(() => {
    const element = deckRef.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.intersectionRatio >= 0.35
        setInView(visible)
        setDeal((current) => {
          if (current === 'idle') return visible ? 'dealt' : 'waiting'
          if (current === 'waiting' && visible) return 'dealing'
          return current
        })
      },
      { threshold: [0, 0.35] }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (deal !== 'dealing') return
    const timer = window.setTimeout(() => setDeal('dealt'), 90 * count + 700)
    return () => window.clearTimeout(timer)
  }, [deal, count])

  /* Forward: the top card is thrown off towards `dir` and slides back in
     underneath, and `target` comes up to the top. One card is in the air at
     a time; a tab or a button pressed meanwhile still moves the deck, just
     without throwing another. */
  function advance(target: number, dir: 1 | -1 = 1, insist = false) {
    if (target === active || (busy.current && !insist)) return
    setActive(target)
    if (reduced || busy.current) return
    busy.current = true
    setFlying({ index: active, dir })
    later(() => {
      setFlying(null)
      busy.current = false
    }, FLY_MS)
  }

  /* Back: `target` is thrown back onto the top of the deck from the left.
     It is placed off the deck without a transition first, then released on
     the next frame so it has somewhere to travel from. */
  function retreat(target: number, insist = false) {
    if (target === active || (busy.current && !insist)) return
    setActive(target)
    if (reduced || busy.current) return
    busy.current = true
    setEntering(target)
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => {
        setEntering(null)
        later(() => {
          busy.current = false
        }, FLY_MS)
      })
    )
  }

  const next = () => advance((active + 1) % count, 1, true)
  const previous = () => retreat((active - 1 + count) % count, true)

  /* Anybody reaching for the deck is in charge of it from then on. */
  function takeOver() {
    setTakenOver(true)
    setDeal('dealt')
  }

  function choose(index: number) {
    takeOver()
    if (index > active) advance(index, 1, true)
    else retreat(index, true)
  }

  const running = !reduced && !takenOver && inView && deal === 'dealt' && !hovered && !focused && dragX === null

  useEffect(() => {
    if (!running) return
    const timer = window.setTimeout(() => advance((active + 1) % count, 1), HOLD_MS)
    return () => window.clearTimeout(timer)
  }, [running, active, count])

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    swallowClick.current = false
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, moved: false }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = pointer.current
    if (!start || start.id !== event.pointerId) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (!start.moved) {
      /* A mostly vertical gesture is somebody scrolling the page. */
      if (Math.abs(dx) < 8 || Math.abs(dy) > Math.abs(dx)) return
      start.moved = true
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    start.dx = dx
    setDragX(dx)
  }

  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    const start = pointer.current
    if (!start || start.id !== event.pointerId) return
    pointer.current = null
    if (!start.moved) return
    /* The click that follows a drag is not a tap on the card. */
    swallowClick.current = true
    setDragX(null)
    if (event.type === 'pointerup' && Math.abs(start.dx) > SWIPE_PX) {
      takeOver()
      advance((active + 1) % count, start.dx > 0 ? 1 : -1)
    }
  }

  function onTopCardClick() {
    if (swallowClick.current) {
      swallowClick.current = false
      return
    }
    takeOver()
    advance((active + 1) % count, 1)
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let target = -1
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') target = (index + 1) % count
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') target = (index - 1 + count) % count
    else if (event.key === 'Home') target = 0
    else if (event.key === 'End') target = count - 1
    if (target < 0) return
    event.preventDefault()
    tabRefs.current[target]?.focus()
    choose(target)
  }

  const fanned = hovered && dragX === null && !reduced
  const current = features[active]

  return (
    <div
      className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16"
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false)
      }}
    >
      <div className="flex flex-col gap-8">
        <div className="max-w-xl">
          <p className="eyebrow">{eyebrow}</p>
          <h2
            id={titleId}
            className="mt-2 text-[30px] font-extrabold leading-9 tracking-[-0.025em] text-ink sm:text-[36px] sm:leading-[44px]"
          >
            {title}
          </h2>
        </div>
        <div
          role="tablist"
          aria-label="What EstateCore UG keeps track of"
          aria-orientation="vertical"
          className="hidden flex-col gap-1 lg:flex"
        >
          {features.map((feature, index) => {
            const selected = index === active
            return (
              <button
                key={feature.title}
                ref={(element) => {
                  tabRefs.current[index] = element
                }}
                id={`${baseId}-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${baseId}-deck`}
                tabIndex={selected ? 0 : -1}
                onClick={() => choose(index)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                className={`group relative overflow-hidden rounded-[20px] px-5 py-3.5 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  selected ? 'bg-canvas' : 'hover:bg-canvas/60'
                }`}
              >
                <span className="flex items-baseline gap-4">
                  <span
                    className={`w-6 shrink-0 text-[13px] font-extrabold tabular-nums transition-colors duration-300 ${
                      selected ? 'text-brand-text' : 'text-faint group-hover:text-muted'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-[17px] font-extrabold leading-6 tracking-[-0.01em] transition-colors duration-300 ${
                        selected ? 'text-ink' : 'text-ink-soft group-hover:text-ink'
                      }`}
                    >
                      {feature.title}
                    </span>
                    <span
                      className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out-soft ${
                        selected ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <span className="overflow-hidden">
                        <span className="block pt-1.5 text-[14.5px] font-medium leading-6 text-ink-soft">{feature.body}</span>
                      </span>
                    </span>
                  </span>
                </span>
                {selected && running && (
                  <span
                    key={`${active}-run`}
                    aria-hidden="true"
                    className="deck-progress absolute bottom-0 left-5 right-5 h-[3px] rounded-full bg-brand"
                    style={{ animationDuration: `${HOLD_MS}ms` }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div
          ref={deckRef}
          id={`${baseId}-deck`}
          role="tabpanel"
          tabIndex={0}
          aria-labelledby={`${baseId}-tab-${active}`}
          aria-roledescription="card deck"
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') setHovered(true)
          }}
          onPointerLeave={() => setHovered(false)}
          className="relative mb-6 aspect-[4/5] w-[78%] max-w-[300px] rounded-[28px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-brand sm:max-w-[340px] lg:mb-8 lg:w-full lg:max-w-[380px] xl:max-w-[400px]"
        >
          {features.map((feature, index) => {
            const depth = (index - active + count) % count
            const isTop = depth === 0
            const isFlying = flying?.index === index
            const isEntering = entering === index
            const dragging = isTop && dragX !== null

            let transform = place(depth, fanned)
            let zIndex = 30 - depth
            let opacity = 1
            let transition = `transform 0.64s ${EASE}, opacity 0.35s ease`
            if (deal === 'waiting') {
              transform = `translate3d(0, 110px, 0) rotate(${index % 2 ? -9 : 9}deg) scale(0.9)`
              opacity = 0
            } else if (deal === 'dealing') {
              /* Bottom card first, the way a pile is dealt. */
              const delay = (count - 1 - depth) * 90
              transition = `transform 0.7s ${EASE} ${delay}ms, opacity 0.3s ease ${delay}ms`
            }
            if (isEntering) {
              transform = offDeck(-1)
              zIndex = 40
              transition = 'none'
            } else if (isFlying) {
              transform = offDeck(flying.dir)
              zIndex = 40
            } else if (dragging) {
              transform = `translate3d(${dragX}px, 0, 0) rotate(${dragX * 0.05}deg)`
              zIndex = 35
              transition = 'none'
            }
            if (reduced) transition = 'none'

            return (
              <div
                key={feature.title}
                aria-hidden={!isTop}
                onClick={isTop ? onTopCardClick : undefined}
                onPointerDown={isTop ? onPointerDown : undefined}
                onPointerMove={isTop ? onPointerMove : undefined}
                onPointerUp={isTop ? onPointerEnd : undefined}
                onPointerCancel={isTop ? onPointerEnd : undefined}
                className={`absolute inset-0 select-none overflow-hidden rounded-[28px] bg-night ring-1 ring-black/5 ${
                  isTop || isFlying
                    ? 'shadow-[0_28px_50px_-26px_rgba(4,30,18,0.5)]'
                    : depth <= 3
                      ? 'shadow-[0_16px_32px_-22px_rgba(4,30,18,0.35)]'
                      : ''
                } ${isTop ? 'cursor-grab touch-pan-y active:cursor-grabbing' : ''}`}
                style={{ transform, zIndex, opacity, transition }}
              >
                <Image
                  src={feature.image}
                  alt={isTop ? feature.alt : ''}
                  fill
                  sizes="(min-width: 1280px) 400px, (min-width: 1024px) 380px, (min-width: 640px) 340px, 300px"
                  placeholder="blur"
                  draggable={false}
                  className="pointer-events-none object-cover"
                />
                {feature.shade !== false && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-night/85 via-night/40 to-transparent"
                  />
                )}
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-extrabold tabular-nums text-ink">
                  {String(index + 1).padStart(2, '0')}
                  <span className="font-bold text-muted"> / {String(count).padStart(2, '0')}</span>
                </span>
                {/* Only the card in play is captioned; the ones beneath show their corners. */}
                <p
                  className={`absolute inset-x-0 bottom-0 p-6 text-[22px] font-extrabold leading-7 tracking-[-0.015em] text-white transition-opacity duration-300 ${
                    isTop || isFlying ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {feature.title}
                </p>
              </div>
            )
          })}
        </div>

        <div className="flex w-full max-w-[360px] flex-col items-center gap-5 lg:hidden">
          <p
            aria-live={running ? 'off' : 'polite'}
            className="min-h-[72px] text-center text-[15px] font-medium leading-6 text-ink-soft"
          >
            <span className="sr-only">{current.title}. </span>
            {current.body}
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                takeOver()
                previous()
              }}
              aria-label="Previous card"
              className="btn btn-outline btn-icon"
            >
              <ChevronLeft aria-hidden="true" className="h-5 w-5" strokeWidth={2.2} />
            </button>
            <span className="flex items-center gap-1.5" aria-hidden="true">
              {features.map((feature, index) => (
                <span
                  key={feature.title}
                  className={`h-1.5 rounded-full transition-all duration-300 ${index === active ? 'w-6 bg-ink' : 'w-1.5 bg-line-strong'}`}
                />
              ))}
            </span>
            <button
              type="button"
              onClick={() => {
                takeOver()
                next()
              }}
              aria-label="Next card"
              className="btn btn-outline btn-icon"
            >
              <ChevronRight aria-hidden="true" className="h-5 w-5" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
