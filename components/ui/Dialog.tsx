'use client'

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'

type DialogVariant = 'dialog' | 'sheet' | 'sheet-dialog'

/**
 * One modal for the whole app: portalled, scroll-locked, closes on Escape
 * and on a click outside, hands focus back to whatever opened it, and
 * animates out as well as in. `sheet-dialog` is a bottom sheet on a phone
 * and a centred dialog from `sm` up.
 */
export default function Dialog({
  open,
  onClose,
  children,
  label,
  labelledBy,
  variant = 'sheet-dialog',
  className = '',
  zIndex = 90,
  initialFocusRef
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  label?: string
  labelledBy?: string
  variant?: DialogVariant
  className?: string
  zIndex?: number
  initialFocusRef?: RefObject<HTMLElement | null>
}) {
  const [mounted, setMounted] = useState(open)
  const [closing, setClosing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null
      setMounted(true)
      setClosing(false)
    } else if (mounted) {
      setClosing(true)
      /* The exit animation normally ends the unmount; this is the backstop
         for reduced motion, where no animationend may fire. */
      const timer = window.setTimeout(() => {
        setMounted(false)
        setClosing(false)
      }, 260)
      return () => window.clearTimeout(timer)
    }
  }, [open, mounted])

  useEffect(() => {
    if (!mounted) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted || closing) return
    const target = initialFocusRef?.current ?? panelRef.current
    target?.focus({ preventScroll: true })
  }, [mounted, closing, initialFocusRef])

  useEffect(() => {
    if (mounted) return
    const target = returnFocusRef.current
    returnFocusRef.current = null
    if (target && document.contains(target)) {
      target.focus({ preventScroll: true })
    }
  }, [mounted])

  if (!mounted || typeof document === 'undefined') return null

  const placement =
    variant === 'dialog'
      ? 'items-center justify-center p-4'
      : variant === 'sheet'
        ? 'items-end justify-center'
        : 'items-end justify-center sm:items-center sm:p-5'

  const motion =
    variant === 'dialog'
      ? closing
        ? 'dialog-exit'
        : 'dialog-enter'
      : variant === 'sheet'
        ? closing
          ? 'sheet-exit'
          : 'sheet-enter'
        : closing
          ? 'sheet-exit sm-dialog'
          : 'sheet-enter sm-dialog'

  return createPortal(
    <div
      className={`fixed inset-0 flex bg-ink/45 backdrop-blur-[2px] ${placement} ${
        closing ? 'overlay-exit' : 'overlay-enter'
      }`}
      style={{ zIndex }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={labelledBy ? undefined : label}
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`outline-none ${motion} ${className}`}
        onAnimationEnd={(event) => {
          if (closing && event.target === event.currentTarget) {
            setMounted(false)
            setClosing(false)
          }
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}
