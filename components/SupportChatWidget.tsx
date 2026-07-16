'use client'

import { Headphones, Send, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type SupportConversation = {
  id: number
  status: string
  subject: string
  unreadCount?: number
}

type SupportMessage = {
  id: number
  senderRole: string
  body: string
  createdAt: string
}

function messageTime(value: string) {
  return new Intl.DateTimeFormat('en-UG', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

export default function SupportChatWidget({
  variant = 'sidebar'
}: {
  variant?: 'sidebar' | 'icon'
}) {
  const [open, setOpen] = useState(false)
  const [conversation, setConversation] = useState<SupportConversation | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const messageEndRef = useRef<HTMLDivElement>(null)

  async function fetchSummary() {
    const response = await fetch('/api/support/conversations', { cache: 'no-store' })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload?.error ?? 'Unable to load support chat.')
    setConversation(payload.activeConversation ?? null)
    setUnreadCount(Number(payload.totalUnread ?? 0))
    return payload
  }

  async function loadSummary() {
    try {
      await fetchSummary()
    } catch {
      // Keep the navigation quiet when background polling is unavailable.
    }
  }

  async function loadChat() {
    setLoading(true)
    setError('')
    try {
      const payload = await fetchSummary()
      const active = payload.activeConversation as SupportConversation | null
      if (!active) {
        setMessages([])
        return
      }

      const response = await fetch(`/api/support/conversations/${active.id}/messages`, { cache: 'no-store' })
      const messagePayload = await response.json()
      if (!response.ok) throw new Error(messagePayload?.error ?? 'Unable to load messages.')
      setMessages(messagePayload.messages ?? [])
      await fetchSummary()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load support chat.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSummary()
    const interval = window.setInterval(loadSummary, 30000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!open) return
    loadChat()
    const interval = window.setInterval(loadChat, 15000)
    return () => window.clearInterval(interval)
  }, [open])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  useEffect(() => {
    if (open) messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function sendMessage() {
    const body = message.trim()
    if (!body) return

    setSending(true)
    setError('')
    try {
      const response = await fetch(
        conversation?.status === 'open'
          ? `/api/support/conversations/${conversation.id}/messages`
          : '/api/support/conversations',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: body })
        }
      )
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error ?? 'Unable to send message.')
      setMessage('')
      await loadChat()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message.')
    } finally {
      setSending(false)
    }
  }

  const badge = unreadCount > 99 ? '99+' : String(unreadCount)

  return (
    <div className="relative">
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open support messages"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <Headphones className="h-[18px] w-[18px]" strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-white">
              {badge}
            </span>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative flex w-full items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-left text-sm font-black text-white transition hover:bg-white/15"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-300/15 text-emerald-100">
            <Headphones className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate">Need help?</span>
            <span className="block truncate text-xs font-semibold text-emerald-100/70">Chat with admin</span>
          </span>
          {unreadCount > 0 && (
            <span className="flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white">
              {badge}
            </span>
          )}
        </button>
      )}

      {open && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-950/40 sm:bg-slate-950/20" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false)
        }}>
          <section className="absolute inset-0 flex min-h-0 flex-col bg-white sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[36rem] sm:w-[25rem] sm:overflow-hidden sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-2xl lg:left-[17.5rem] lg:right-auto">
            <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Headphones className="h-5 w-5" strokeWidth={2} />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black text-slate-950">Estate Core support</h2>
                  <p className="text-xs font-medium text-emerald-700">Admin support</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
                aria-label="Close support chat"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50 px-3 py-4 sm:px-4">
              {loading && messages.length === 0 && (
                <p className="py-8 text-center text-xs font-semibold text-slate-500">Loading messages...</p>
              )}
              {!loading && messages.length === 0 && (
                <div className="mx-auto mt-10 max-w-xs text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Headphones className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <p className="mt-3 text-sm font-black text-slate-800">How can we help?</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Send a message to the Estate Core UG admin team.</p>
                </div>
              )}
              <div className="space-y-2.5">
                {messages.map((item) => {
                  const mine = item.senderRole !== 'admin'
                  return (
                    <div key={item.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[78%] px-3 py-2 text-sm leading-5 ${
                        mine
                          ? 'rounded-2xl rounded-br-md bg-emerald-600 text-white'
                          : 'rounded-2xl rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm'
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{item.body}</p>
                        <p className={`mt-1 text-right text-[10px] ${mine ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {messageTime(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messageEndRef} />
              </div>
            </div>

            {conversation?.status === 'closed' && (
              <p className="shrink-0 border-t border-amber-100 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700">
                This conversation ended. Your next message starts a new chat.
              </p>
            )}
            {error && (
              <p className="shrink-0 border-t border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700">{error}</p>
            )}
            <footer className="shrink-0 border-t border-slate-200 bg-white px-3 pt-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
              <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      sendMessage()
                    }
                  }}
                  rows={1}
                  placeholder="Message..."
                  className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={sending || !message.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send support message"
                >
                  <Send className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </footer>
          </section>
        </div>,
        document.body
      )}
    </div>
  )
}
