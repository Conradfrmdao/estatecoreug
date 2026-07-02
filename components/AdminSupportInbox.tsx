'use client'

import { Headphones, MessageCircle, Send, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type AdminSupportUser = {
  id: number
  name: string
  email: string
}

type SupportConversation = {
  id: number
  status: string
  subject: string
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

export default function AdminSupportInbox({ users }: { users: AdminSupportUser[] }) {
  const [open, setOpen] = useState(false)
  const [conversations, setConversations] = useState<SupportConversation[]>([])
  const [activeConversation, setActiveConversation] = useState<SupportConversation | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [message, setMessage] = useState('')
  const [startUserId, setStartUserId] = useState(users[0]?.id ? String(users[0].id) : '')
  const [startMessage, setStartMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const openCount = useMemo(
    () => conversations.filter((conversation) => conversation.status === 'open').length,
    [conversations]
  )

  async function loadInbox(nextActiveId?: number) {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/support/conversations', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Unable to load support inbox.')
      }
      const nextConversations = payload.conversations ?? []
      setConversations(nextConversations)
      const selected =
        nextConversations.find((item: SupportConversation) => item.id === nextActiveId) ??
        nextConversations.find((item: SupportConversation) => item.id === activeConversation?.id) ??
        nextConversations[0] ??
        null
      setActiveConversation(selected)
      if (selected) {
        await loadMessages(selected.id)
      } else {
        setMessages([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load support inbox.')
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages(conversationId: number) {
    const response = await fetch(`/api/support/conversations/${conversationId}/messages`, { cache: 'no-store' })
    const payload = await response.json()
    if (!response.ok) {
      throw new Error(payload?.error ?? 'Unable to load messages.')
    }
    setMessages(payload.messages ?? [])
  }

  useEffect(() => {
    if (!open) {
      return
    }

    loadInbox()
    const interval = window.setInterval(() => loadInbox(), 20000)
    return () => window.clearInterval(interval)
  }, [open])

  async function sendReply() {
    if (!activeConversation || !message.trim()) {
      return
    }

    setBusy(true)
    setError('')
    try {
      const response = await fetch(`/api/support/conversations/${activeConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Unable to send reply.')
      }
      setMessage('')
      await loadInbox(activeConversation.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reply.')
    } finally {
      setBusy(false)
    }
  }

  async function startChat() {
    if (!startUserId || !startMessage.trim()) {
      return
    }

    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/support/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: Number(startUserId), message: startMessage })
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Unable to start chat.')
      }
      setStartMessage('')
      await loadInbox(payload.conversation?.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start chat.')
    } finally {
      setBusy(false)
    }
  }

  async function endChat() {
    if (!activeConversation) {
      return
    }

    setBusy(true)
    setError('')
    try {
      const response = await fetch(`/api/support/conversations/${activeConversation.id}/end`, {
        method: 'POST'
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Unable to end chat.')
      }
      await loadInbox(activeConversation.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to end chat.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 text-sm font-black text-emerald-700 shadow-sm transition hover:bg-emerald-50"
      >
        <MessageCircle className="h-4 w-4" strokeWidth={2} />
        Messages
        {openCount > 0 && (
          <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-black text-white">{openCount}</span>
        )}
      </button>

      {open && (
        <div className="fixed inset-3 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:inset-auto sm:right-6 sm:top-24 sm:h-[38rem] sm:w-[48rem]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <Headphones className="h-4 w-4" strokeWidth={2} />
              </span>
              <div>
                <p className="text-sm font-black text-slate-950">Support inbox</p>
                <p className="text-xs text-slate-500">Receive chats, reply to landlords, and end resolved conversations.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50"
              aria-label="Close support inbox"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid h-[calc(100%-4rem)] grid-rows-[auto_1fr] sm:grid-cols-[17rem_1fr] sm:grid-rows-1">
            <aside className="border-b border-slate-100 bg-slate-50 p-3 sm:border-b-0 sm:border-r">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Start chat</p>
                <select
                  value={startUserId}
                  onChange={(event) => setStartUserId(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 outline-none"
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
                <textarea
                  value={startMessage}
                  onChange={(event) => setStartMessage(event.target.value)}
                  rows={2}
                  placeholder="Message user..."
                  className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-2 py-2 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={startChat}
                  disabled={busy || !startUserId || !startMessage.trim()}
                  className="mt-2 min-h-9 w-full rounded-lg bg-emerald-600 px-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Start
                </button>
              </div>

              <div className="mt-3 max-h-60 space-y-2 overflow-y-auto sm:max-h-[25rem]">
                {loading && <p className="text-center text-xs font-semibold text-slate-500">Loading...</p>}
                {!loading && conversations.length === 0 && (
                  <p className="rounded-xl bg-white p-3 text-xs font-semibold text-slate-500">No support chats yet.</p>
                )}
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={async () => {
                      setActiveConversation(conversation)
                      await loadMessages(conversation.id)
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      activeConversation?.id === conversation.id
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-black text-slate-900">{conversation.user?.name ?? 'User'}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                        conversation.status === 'open'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {conversation.status}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">{conversation.lastMessage?.body ?? conversation.subject}</p>
                  </button>
                ))}
              </div>
            </aside>

            <section className="flex min-h-0 flex-col">
              {activeConversation ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-950">{activeConversation.user?.name ?? 'User'}</p>
                      <p className="truncate text-xs text-slate-500">{activeConversation.user?.email ?? 'No email'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={endChat}
                      disabled={busy || activeConversation.status !== 'open'}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      End chat
                    </button>
                  </div>
                  <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-slate-50 p-4">
                    {messages.map((item) => {
                      const mine = item.senderRole === 'admin'
                      return (
                        <div key={item.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${
                            mine ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 shadow-sm'
                          }`}>
                            <p>{item.body}</p>
                            <p className={`mt-1 text-[10px] ${mine ? 'text-emerald-50' : 'text-slate-400'}`}>
                              {mine ? 'Admin' : activeConversation.user?.name ?? 'User'}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {error && <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700">{error}</p>}
                  <div className="flex gap-2 border-t border-slate-100 p-3">
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      rows={2}
                      placeholder={activeConversation.status === 'open' ? 'Reply...' : 'Chat ended'}
                      disabled={activeConversation.status !== 'open'}
                      className="min-h-11 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
                    />
                    <button
                      type="button"
                      onClick={sendReply}
                      disabled={busy || activeConversation.status !== 'open' || !message.trim()}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center p-6 text-center">
                  <p className="max-w-sm text-sm font-semibold text-slate-500">Select a conversation or start a chat with a user.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
