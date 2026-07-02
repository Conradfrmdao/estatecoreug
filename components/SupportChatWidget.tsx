'use client'

import { Headphones, Send, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type SupportConversation = {
  id: number
  status: string
  subject: string
}

type SupportMessage = {
  id: number
  senderRole: string
  body: string
  createdAt: string
}

export default function SupportChatWidget() {
  const [open, setOpen] = useState(false)
  const [conversation, setConversation] = useState<SupportConversation | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function loadChat() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/support/conversations', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Unable to load support chat.')
      }
      setConversation(payload.activeConversation ?? null)
      setMessages(payload.messages ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load support chat.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open) {
      return
    }

    loadChat()
    const interval = window.setInterval(loadChat, 20000)
    return () => window.clearInterval(interval)
  }, [open])

  async function sendMessage() {
    const body = message.trim()
    if (!body) {
      return
    }

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
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Unable to send message.')
      }
      setMessage('')
      await loadChat()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-left text-sm font-black text-emerald-800 transition hover:bg-emerald-100"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
          <Headphones className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="min-w-0">
          <span className="block truncate">Need help?</span>
          <span className="block truncate text-xs font-semibold text-emerald-700/80">Chat with admin</span>
        </span>
      </button>

      {open && (
        <div className="absolute bottom-[4.75rem] left-0 z-50 w-[22rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-black text-slate-950">Estate Core support</p>
              <p className="text-xs text-slate-500">Send a message and wait for admin.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50"
              aria-label="Close support chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-72 space-y-2 overflow-y-auto bg-slate-50 px-3 py-3">
            {loading && <p className="text-center text-xs font-semibold text-slate-500">Loading chat...</p>}
            {!loading && messages.length === 0 && (
              <div className="rounded-xl bg-white p-3 text-sm text-slate-600 shadow-sm">
                Tell admin what you need help with. They will reply here when available.
              </div>
            )}
            {messages.map((item) => {
              const mine = item.senderRole !== 'admin'
              return (
                <div key={item.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${
                    mine
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-700 shadow-sm'
                  }`}>
                    <p>{item.body}</p>
                    <p className={`mt-1 text-[10px] ${mine ? 'text-emerald-50' : 'text-slate-400'}`}>
                      {item.senderRole === 'admin' ? 'Admin' : 'You'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {conversation?.status === 'closed' && (
            <div className="border-t border-slate-100 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700">
              This chat has ended. Send a new message to start another chat.
            </div>
          )}
          {error && (
            <div className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}
          <div className="flex gap-2 border-t border-slate-100 p-3">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={2}
              placeholder="Type your message..."
              className="min-h-11 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={sending || !message.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send support message"
            >
              <Send className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
