'use client'

import { useState, type FormEvent } from 'react'
import { subscribeToNewsletter } from '@/lib/newsletter'

/**
 * Newsletter capture. Posts to a server action that persists to
 * supabase.newsletter_subscribers. In demo mode (no Supabase env) the form
 * still works visually but doesn't persist.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<
    | { kind: 'idle' }
    | { kind: 'success'; already: boolean }
    | { kind: 'error'; msg: string }
  >({ kind: 'idle' })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email || busy) return
    setBusy(true)
    const res = await subscribeToNewsletter(email)
    setBusy(false)
    if (res.ok) {
      setStatus({ kind: 'success', already: res.alreadySubscribed })
    } else {
      setStatus({ kind: 'error', msg: res.error })
    }
  }

  if (status.kind === 'success') {
    return (
      <p className="text-[12px] font-medium uppercase tracking-widest2 text-lime">
        ● {status.already
          ? "You're already on the list."
          : "You're on the list. Look out for a note soon."}
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
    >
      <input
        type="email"
        required
        value={email}
        maxLength={200}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="min-w-0 flex-1 rounded-md border border-line bg-paper px-4 py-3 text-[14px] text-ink placeholder:text-ink-mute focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        disabled={busy}
        className="shrink-0 rounded-md bg-accent px-5 py-3 text-[12px] font-bold uppercase tracking-widest2 text-paper transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {busy ? 'Joining…' : 'Subscribe'}
      </button>
      {status.kind === 'error' && (
        <p className="basis-full text-[12px] text-accent">{status.msg}</p>
      )}
    </form>
  )
}
