'use client'

import Dialog from '@/components/ui/Dialog'
import { Headphones, Send, X } from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

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

type SupportChatValue = {
  unreadCount: number
  openChat: () => void
}

const SupportChatContext = createContext<SupportChatValue | null>(null)

function messageTime(value: string) {
  return new Intl.DateTimeFormat('en-UG', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

/**
 * The landlord's chat with the admin team. One provider owns the polling and
 * the one chat panel; the buttons that open it (rail, settings, phone menu)
 * only read from it, so adding a button never adds a request.
 */
export function SupportChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [conversation, setConversation] = useState<SupportConversation | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const messageEndRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)

  const fetchSummary = useCallback(async () => {
    const response = await fetch('/api/support/conversations', { cache: 'no-store' })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload?.error ?? 'Unable to load support chat.')
    setConversation(payload.activeConversation ?? null)
    setUnreadCount(Number(payload.totalUnread ?? 0))
    return payload
  }, [])

  const loadSummary = useCallback(async () => {
    try {
      await fetchSummary()
    } catch {
      // Keep the navigation quiet when background polling is unavailable.
    }
  }, [fetchSummary])

  const loadChat = useCallback(async () => {
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
  }, [fetchSummary])

  useEffect(() => {
    loadSummary()
    const interval = window.setInterval(loadSummary, 30000)
    return () => window.clearInterval(interval)
  }, [loadSummary])

  useEffect(() => {
    if (!open) return
    loadChat()
    const interval = window.setInterval(loadChat, 15000)
    return () => window.clearInterval(interval)
  }, [open, loadChat])

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

  const openChat = useCallback(() => setOpen(true), [])

  return (
    <SupportChatContext.Provider value={{ unreadCount, openChat }}>
      {children}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        label="Chat with admin"
        variant="sheet-dialog"
        zIndex={100}
        initialFocusRef={composerRef}
        className="flex h-[min(92dvh,40rem)] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-overlay sm:h-[min(88dvh,38rem)] sm:w-[26rem] sm:rounded-[28px]"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 px-5 pb-4 pt-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-hi text-ink">
              <Headphones aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-brand" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-[16px] font-extrabold text-ink">Estate Core support</h2>
              <p className="text-[12.5px] font-semibold text-brand-text">Admin support</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn btn-soft btn-icon"
            aria-label="Close support chat"
          >
            <X aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-canvas px-4 py-4">
          {loading && messages.length === 0 && (
            <div className="space-y-3" aria-hidden="true">
              <span className="skeleton ml-auto block h-12 w-3/5 rounded-[18px]" />
              <span className="skeleton block h-16 w-2/3 rounded-[18px]" />
              <span className="skeleton ml-auto block h-10 w-1/2 rounded-[18px]" />
            </div>
          )}
          {!loading && messages.length === 0 && (
            <div className="mx-auto mt-10 max-w-xs text-center fade-in">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-text">
                <Headphones aria-hidden="true" className="h-6 w-6" strokeWidth={1.9} />
              </span>
              <p className="mt-3 text-[15px] font-extrabold text-ink">How can we help?</p>
              <p className="mt-1 text-[13px] leading-5 text-muted">Send a message to the Estate Core UG admin team.</p>
            </div>
          )}
          <div className="space-y-2.5">
            {messages.map((item) => {
              const mine = item.senderRole !== 'admin'
              return (
                <div key={item.id} className={`flex fade-in ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[78%] px-3.5 py-2.5 text-[14px] leading-5 ${
                      mine
                        ? 'rounded-[20px] rounded-br-md bg-ink text-white'
                        : 'rounded-[20px] rounded-bl-md bg-white text-ink'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{item.body}</p>
                    <p className={`mt-1 text-right text-[10.5px] font-semibold ${mine ? 'text-white/60' : 'text-muted'}`}>
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
          <p className="shrink-0 bg-carried-bg px-5 py-2.5 text-[12.5px] font-semibold text-carried-fg">
            This conversation ended. Your next message starts a new chat.
          </p>
        )}
        {error && (
          <p className="shrink-0 bg-overdue-bg px-5 py-2.5 text-[12.5px] font-semibold text-overdue-fg">{error}</p>
        )}
        <footer className="shrink-0 bg-white px-4 pt-3" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <div className="flex items-end gap-2 rounded-[26px] bg-canvas p-1.5 ring-brand/30 transition focus-within:ring-4">
            <textarea
              ref={composerRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  sendMessage()
                }
              }}
              rows={1}
              aria-label="Message the admin team"
              placeholder="Message..."
              className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] font-medium text-ink outline-none"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={sending || !message.trim()}
              className="btn btn-ink btn-icon shrink-0"
              aria-label="Send support message"
            >
              <Send aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </footer>
      </Dialog>
    </SupportChatContext.Provider>
  )
}

function useSupportChat() {
  return useContext(SupportChatContext)
}

function UnreadBadge({ count, className = '' }: { count: number; className?: string }) {
  if (count <= 0) return null
  return (
    <span
      className={`pop-in flex min-h-5 min-w-5 items-center justify-center rounded-full bg-hi px-1.5 text-[10.5px] font-extrabold text-ink ${className}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

type TriggerVariant = 'rail-icon' | 'rail-card' | 'row' | 'band'

/**
 * A button that opens the chat. Renders nothing for admins, who have no
 * provider - they answer chats from the admin inbox instead.
 */
export function SupportChatTrigger({ variant }: { variant: TriggerVariant }) {
  const chat = useSupportChat()
  if (!chat) return null

  const { unreadCount, openChat } = chat
  const unreadLabel = unreadCount > 0 ? `, ${unreadCount} unread` : ''

  if (variant === 'rail-icon') {
    return (
      <button
        type="button"
        onClick={openChat}
        aria-label={`Chat with admin${unreadLabel}`}
        title="Chat with admin"
        className="rail-foot-button relative flex items-center justify-center rounded-full text-forest-muted transition hover:bg-white/[0.08] hover:text-white"
      >
        <Headphones aria-hidden="true" className="h-[22px] w-[22px]" strokeWidth={1.8} />
        <UnreadBadge count={unreadCount} className="absolute -right-1 -top-1" />
      </button>
    )
  }

  if (variant === 'rail-card') {
    return (
      <button
        type="button"
        onClick={openChat}
        aria-label={`Need help? Chat with admin${unreadLabel}`}
        className="rail-help-card flex w-full items-center gap-3 rounded-[22px] bg-white/[0.08] p-3.5 text-left text-white transition hover:bg-white/[0.13]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hi text-ink">
          <Headphones aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-[14px] font-bold leading-5">Need help?</span>
          <span className="truncate text-[12px] font-semibold leading-4 text-forest-muted">Chat with admin</span>
        </span>
        <UnreadBadge count={unreadCount} />
      </button>
    )
  }

  if (variant === 'band') {
    return (
      <button type="button" onClick={openChat} className="btn btn-lg btn-white relative shrink-0 px-6">
        Chat with admin
        <UnreadBadge count={unreadCount} className="absolute -right-1 -top-1" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={openChat}
      className="flex min-h-14 w-full items-center gap-3 rounded-[20px] bg-canvas px-3.5 py-3 text-left transition active:scale-[0.99]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hi text-ink">
        <Headphones aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold text-ink">Chat with admin</span>
        <span className="block truncate text-[12.5px] font-medium leading-4 text-muted">
          Support - usually replies same day
        </span>
      </span>
      <UnreadBadge count={unreadCount} />
    </button>
  )
}
