'use client'

import { useState, type FormEvent } from 'react'
import { subscribeBackInStock } from '@/lib/back-in-stock'

export function BackInStockForm({
  productId,
  variantKey,
}: {
  productId: string
  variantKey?: string | null
}) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<
    | { kind: 'idle' }
    | { kind: 'success'; alreadyOnList: boolean }
    | { kind: 'error'; msg: string }
  >({ kind: 'idle' })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email || busy) return
    setBusy(true)
    const res = await subscribeBackInStock({ productId, variantKey, email })
    setBusy(false)
    if (res.ok) setStatus({ kind: 'success', alreadyOnList: res.alreadyOnList })
    else setStatus({ kind: 'error', msg: res.error })
  }

  if (status.kind === 'success') {
    return (
      <div className="rounded-md border border-line bg-accent-soft p-4">
        <p className="text-[12px] font-medium uppercase tracking-widest2 text-accent">
          {status.alreadyOnList ? "You're already on the list" : "You're on the list"}
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          We&apos;ll email you the moment this variant is back in stock.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-line bg-surface p-4">
      <p className="text-[12px] font-medium uppercase tracking-widest2 text-ink-soft">
        Sold out — notify me when it&apos;s back
      </p>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          maxLength={200}
          className="min-w-0 flex-1 rounded-md border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-mute focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy}
          className="shrink-0 rounded-md bg-accent px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest2 text-paper transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {busy ? 'Adding…' : 'Notify me'}
        </button>
      </form>
      {status.kind === 'error' && (
        <p className="mt-2 text-[12px] text-accent">{status.msg}</p>
      )}
    </div>
  )
}
