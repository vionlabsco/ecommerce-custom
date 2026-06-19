'use client'

import { useState, type FormEvent } from 'react'
import { useCart } from './CartProvider'
import { applyCodeAction } from '@/lib/discount-actions'
import { formatPrice } from '@/lib/format'

// Drop-in coupon input. Used by the cart drawer + the checkout summary card.
// When a code is already applied it renders as a chip showing the discount
// and an X to remove; otherwise it renders the input form.
export function CouponInput({ compact = false }: { compact?: boolean }) {
  const { subtotalCents, coupon, discountCents, applyCoupon, removeCoupon } = useCart()
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!code.trim() || busy) return
    setBusy(true)
    setError(null)
    const res = await applyCodeAction(code.trim(), subtotalCents)
    setBusy(false)
    if (res.ok) {
      applyCoupon({ code: res.code, discountCents: res.discountCents })
      setCode('')
    } else {
      setError(res.reason)
    }
  }

  if (coupon && discountCents > 0) {
    return (
      <div className="flex items-center justify-between rounded-md border border-accent/30 bg-accent-soft px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10.5px] font-semibold uppercase tracking-widest2 text-accent">
            {coupon.code}
          </span>
          <span className="text-[11px] text-ink-soft">
            −{formatPrice(discountCents)}
          </span>
        </div>
        <button
          type="button"
          onClick={removeCoupon}
          aria-label="Remove discount"
          className="rounded p-1 text-ink-soft transition-colors hover:bg-paper hover:text-ink"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase())
            setError(null)
          }}
          placeholder="Discount code"
          maxLength={64}
          autoCapitalize="characters"
          autoCorrect="off"
          className={`min-w-0 flex-1 rounded-md border border-line bg-paper px-3 py-2 text-[13px] uppercase tracking-widest2 text-ink placeholder:normal-case placeholder:tracking-normal placeholder:text-ink-mute focus:border-accent focus:outline-none ${
            compact ? 'py-2' : ''
          }`}
        />
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="shrink-0 rounded-md border border-line bg-paper px-3 py-2 text-[11px] font-medium uppercase tracking-widest2 text-ink-soft transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? '…' : 'Apply'}
        </button>
      </div>
      {error && <p className="text-[11.5px] text-accent">{error}</p>}
    </form>
  )
}
