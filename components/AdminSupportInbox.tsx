'use client'

import { ArrowLeft, Headphones, MessageCircle, Plus, Search, Send, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

type AdminSupportUser = {
  id: number
  name: string
  email: string
}

type SupportConversation = {
  id: number
  status: string
  subject: string
  unreadCount?: number
  user?: AdminSupportUser | null
  lastMessage?: {
    body: string
    senderRole: string
    createdAt: string
  } | null
  lastMessageAt: string
}

type SupportMessage = {
  id: number
  senderRole: string
  body: string
  createdAt: string
}

function shortTime(value: string) {
  const date = new Date(value)
  const today = new Date()
  if (date.toDateString() === today.toDateString()) {
    return new Intl.DateTimeFormat('en-UG', { hour: '2-digit', minute: '2-digit' }).format(date)
  }
  return new Intl.DateTimeFormat('en-UG', { day: 'numeric', month: 'short' }).format(date)
}

function initials(name?: string | null) {
  return (name ?? 'User')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export default function AdminSupportInbox({ users }: { users: AdminSupportUser[] }) {
  const [open, setOpen] = useState(false)
  const [conversations, setConversations] = useState<SupportConversation[]>([])
  const [activeConversation, setActiveConversation] = useState<SupportConversation | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [startOpen, setStartOpen] = useState(false)
  const [startUserId, setStartUserId] = useState(users[0]?.id ? String(users[0].id) : '')
  const [startMessage, setStartMessage] = useState('')
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const messageEndRef = useRef<HTMLDivElement>(null)

  const visibleConversations = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return conversations
    return conversations.filter((conversation) => [
      conversation.user?.name ?? '',
      conversation.user?.email ?? '',
      conversation.lastMessage?.body ?? '',
      conversation.subject
    ].some((value) => value.toLowerCase().includes(query)))
  }, [conversations, search])

  async function fetchInbox() {
    const response = await fetch('/api/support/conversations', { cache: 'no-store' })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload?.error ?? 'Unable to load support inbox.')
    const nextConversations = payload.conversations ?? []
    setConversations(nextConversations)
    setUnreadCount(Number(payload.totalUnread ?? 0))
    setActiveConversation((current) =>
      nextConversations.find((item: SupportConversation) => item.id === current?.id) ?? current
    )
    return nextConversations as SupportConversation[]
  }

  async function refreshInbox(showLoading = false) {
    if (showLoading) setLoading(true)
    try {
      await fetchInbox()
    } catch (err) {
      if (showLoading) setError(err instanceof Error ? err.message : 'Unable to load support inbox.')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  async function loadMessages(conversationId: number) {
    const response = await fetch(`/api/support/conversations/${conversationId}/messages`, { cache: 'no-store' })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload?.error ?? 'Unable to load messages.')
    setMessages(payload.messages ?? [])
    await fetchInbox()
  }

  async function selectConversation(conversation: SupportConversation) {
    setActiveConversation(conversation)
    setMobileThreadOpen(true)
    setError('')
    try {
      await loadMessages(conversation.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load messages.')
    }
  }

  useEffect(() => {
    refreshInbox()
    const interval = window.setInterval(() => refreshInbox(), 30000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!open) return
    refreshInbox(true)
    const interval = window.setInterval(() => refreshInbox(), 15000)
    return () => window.clearInterval(interval)
  }, [open])

  useEffect(() => {
    if (!open || !activeConversation || !mobileThreadOpen) return
    const interval = window.setInterval(() => {
      loadMessages(activeConversation.id).catch(() => undefined)
    }, 15000)
    return () => window.clearInterval(interval)
  }, [activeConversation?.id, mobileThreadOpen, open])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendReply() {
    if (!activeConversation || !message.trim()) return

    setBusy(true)
    setError('')
    try {
      const response = await fetch(`/api/support/conversations/${activeConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() })
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error ?? 'Unable to send reply.')
      setMessage('')
      await loadMessages(activeConversation.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reply.')
    } finally {
      setBusy(false)
    }
  }

  async function startChat() {
    if (!startUserId || !startMessage.trim()) return

    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/support/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: Number(startUserId), message: startMessage.trim() })
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.error ?? 'Unable to start chat.')
      setStartMessage('')
      setStartOpen(false)
      const conversation = payload.conversation as SupportConversation
      setActiveConversation(conversation)
      setMobileThreadOpen(true)
      await loadMessages(conversation.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start chat.')
    } finally {
      setBusy(false)
    }
  }

  async function endChat() {
    if (!activeConversation) return

    setBusy(true)
    setError('')
    try {
      const response = await fetch(`/api/support/conversations/${activeConversation.id}/end`, { method: 'POST' })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error ?? 'Unable to end chat.')
      await fetchInbox()
      setActiveConversation((current) => current ? { ...current, status: 'closed' } : current)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to end chat.')
    } finally {
      setBusy(false)
    }
  }

  const badge = unreadCount > 99 ? '99+' : String(unreadCount)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen(true)
          setMobileThreadOpen(false)
        }}
        className="relative inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 text-sm font-black text-emerald-700 shadow-sm transition hover:bg-emerald-50"
      >
        <MessageCircle className="h-4 w-4" strokeWidth={2} />
        Messages
        {unreadCount > 0 && (
          <span className="flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex min-h-0 flex-col bg-white sm:inset-5 sm:overflow-hidden sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-2xl lg:inset-auto lg:right-6 lg:top-20 lg:h-[min(44rem,calc(100dvh-6rem))] lg:w-[58rem]">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Headphones className="h-5 w-5" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-base font-black text-slate-950">Support inbox</h2>
                <p className="truncate text-xs text-slate-500">{unreadCount > 0 ? `${unreadCount} unread message${unreadCount === 1 ? '' : 's'}` : 'All messages read'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
              aria-label="Close support inbox"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="grid min-h-0 flex-1 sm:grid-cols-[19rem_minmax(0,1fr)]">
            <aside className={`${mobileThreadOpen ? 'hidden' : 'flex'} min-h-0 flex-col border-r border-slate-200 bg-white sm:flex`}>
              <div className="shrink-0 space-y-3 border-b border-slate-100 p-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black text-slate-950">Messages</h3>
                  <button
                    type="button"
                    onClick={() => setStartOpen((value) => !value)}
                    aria-label="Start new conversation"
                    title="New conversation"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.9} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search conversations"
                    className="h-10 w-full rounded-xl bg-slate-100 pl-9 pr-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                {startOpen && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <select
                      value={startUserId}
                      onChange={(event) => setStartUserId(event.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none"
                    >
                      {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </select>
                    <textarea
                      value={startMessage}
                      onChange={(event) => setStartMessage(event.target.value)}
                      rows={2}
                      placeholder="Write a message..."
                      className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={startChat}
                      disabled={busy || !startUserId || !startMessage.trim()}
                      className="mt-2 min-h-9 w-full rounded-lg bg-emerald-600 px-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Send message
                    </button>
                  </div>
                )}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {loading && conversations.length === 0 && <p className="p-6 text-center text-xs font-semibold text-slate-500">Loading messages...</p>}
                {!loading && visibleConversations.length === 0 && <p className="p-6 text-center text-xs font-semibold text-slate-500">No conversations found.</p>}
                {visibleConversations.map((conversation) => {
                  const unread = Number(conversation.unreadCount ?? 0)
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => selectConversation(conversation)}
                      className={`flex w-full items-center gap-3 border-b border-slate-100 px-3 py-3 text-left transition hover:bg-slate-50 ${
                        activeConversation?.id === conversation.id ? 'bg-emerald-50/70' : ''
                      }`}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700">
                        {initials(conversation.user?.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className={`truncate text-sm ${unread > 0 ? 'font-black text-slate-950' : 'font-bold text-slate-800'}`}>
                            {conversation.user?.name ?? 'User'}
                          </span>
                          <span className={`shrink-0 text-[10px] ${unread > 0 ? 'font-bold text-emerald-700' : 'text-slate-400'}`}>
                            {shortTime(conversation.lastMessageAt)}
                          </span>
                        </span>
                        <span className="mt-0.5 flex items-center gap-2">
                          <span className={`min-w-0 flex-1 truncate text-xs ${unread > 0 ? 'font-bold text-slate-700' : 'text-slate-500'}`}>
                            {conversation.lastMessage?.body ?? conversation.subject}
                          </span>
                          {unread > 0 && (
                            <span className="flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-black text-white">
                              {unread > 9 ? '9+' : unread}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </aside>

            <section className={`${mobileThreadOpen ? 'flex' : 'hidden'} min-h-0 flex-col bg-slate-50 sm:flex`}>
              {activeConversation ? (
                <>
                  <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-4">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setMobileThreadOpen(false)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 sm:hidden"
                        aria-label="Back to conversations"
                      >
                        <ArrowLeft className="h-5 w-5" strokeWidth={2} />
                      </button>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700">
                        {initials(activeConversation.user?.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-950">{activeConversation.user?.name ?? 'User'}</p>
                        <p className="truncate text-xs text-slate-500">{activeConversation.status === 'open' ? 'Active conversation' : 'Conversation ended'}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={endChat}
                      disabled={busy || activeConversation.status !== 'open'}
                      className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      End chat
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5">
                    <div className="space-y-2.5">
                      {messages.map((item) => {
                        const mine = item.senderRole === 'admin'
                        return (
                          <div key={item.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[78%] px-3 py-2 text-sm leading-5 ${
                              mine
                                ? 'rounded-2xl rounded-br-md bg-emerald-600 text-white'
                                : 'rounded-2xl rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm'
                            }`}>
                              <p className="whitespace-pre-wrap break-words">{item.body}</p>
                              <p className={`mt-1 text-right text-[10px] ${mine ? 'text-emerald-100' : 'text-slate-400'}`}>{shortTime(item.createdAt)}</p>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messageEndRef} />
                    </div>
                  </div>

                  {error && <p className="shrink-0 border-t border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700">{error}</p>}
                  <div className="shrink-0 border-t border-slate-200 bg-white px-3 pt-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
                    <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100">
                      <textarea
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault()
                            sendReply()
                          }
                        }}
                        rows={1}
                        placeholder={activeConversation.status === 'open' ? 'Message...' : 'Conversation ended'}
                        disabled={activeConversation.status !== 'open'}
                        className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-900 outline-none disabled:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={sendReply}
                        disabled={busy || activeConversation.status !== 'open' || !message.trim()}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Send reply"
                      >
                        <Send className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center p-8 text-center">
                  <div>
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                      <MessageCircle className="h-6 w-6" strokeWidth={1.8} />
                    </span>
                    <p className="mt-4 text-sm font-black text-slate-700">Your messages</p>
                    <p className="mt-1 text-xs text-slate-500">Select a conversation to start replying.</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
