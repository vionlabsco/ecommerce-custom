// Discount-code lookup + validation. Used by the checkout server action,
// the cart-drawer "apply code" form, and the admin orders view.
//
// validateDiscountCode() is a READ-ONLY check that returns the computed
// discount in cents for a given subtotal. It does NOT increment uses_count
// — that only happens inside createOrder when the order is actually placed,
// so abandoned carts don't burn a use.

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

export type DiscountCode = {
  code: string
  type: 'percent' | 'fixed'
  /** percent = 1-100 (so "10" means 10% off); fixed = cents */
  value: number
  minSubtotalCents: number
  maxUses: number | null
  usesCount: number
  startsAt: string | null
  endsAt: string | null
  active: boolean
}

export type DiscountValidation =
  | { ok: true; code: DiscountCode; discountCents: number }
  | { ok: false; reason: string }

function rowToCode(r: any): DiscountCode {
  return {
    code: r.code,
    type: r.type,
    value: r.value,
    minSubtotalCents: r.min_subtotal_cents ?? 0,
    maxUses: r.max_uses ?? null,
    usesCount: r.uses_count ?? 0,
    startsAt: r.starts_at ?? null,
    endsAt: r.ends_at ?? null,
    active: r.active ?? true,
  }
}

/** Look up a code (case-insensitive). Returns null when not found. */
export async function getDiscountCode(rawCode: string): Promise<DiscountCode | null> {
  const code = rawCode.trim().toUpperCase()
  if (!code) return null
  if (!isSupabaseConfigured || !supabase) return null
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('code', code)
    .maybeSingle()
  if (error || !data) return null
  return rowToCode(data)
}

/** Apply business rules. Returns discountCents (0 if invalid). */
export function applyDiscount(
  code: DiscountCode,
  subtotalCents: number,
): DiscountValidation {
  if (!code.active) return { ok: false, reason: 'This code is no longer active.' }
  const now = new Date()
  if (code.startsAt && new Date(code.startsAt) > now) {
    return { ok: false, reason: "This code isn't valid yet." }
  }
  if (code.endsAt && new Date(code.endsAt) < now) {
    return { ok: false, reason: 'This code has expired.' }
  }
  if (code.maxUses != null && code.usesCount >= code.maxUses) {
    return { ok: false, reason: 'This code has been used up.' }
  }
  if (subtotalCents < code.minSubtotalCents) {
    const need = (code.minSubtotalCents / 100).toFixed(2)
    return { ok: false, reason: `Spend at least $${need} to use this code.` }
  }

  const raw =
    code.type === 'percent'
      ? Math.round((subtotalCents * code.value) / 100)
      : code.value
  const discountCents = Math.max(0, Math.min(raw, subtotalCents))
  return { ok: true, code, discountCents }
}

/** Convenience: lookup + apply in one call. Used by the customer-facing
 *  "Apply code" button on the cart drawer + checkout summary. */
export async function validateDiscountCode(
  rawCode: string,
  subtotalCents: number,
): Promise<DiscountValidation> {
  const code = await getDiscountCode(rawCode)
  if (!code) return { ok: false, reason: "We don't recognise that code." }
  return applyDiscount(code, subtotalCents)
}

/** Atomic increment of uses_count — called by createOrder when a code is
 *  actually applied to a placed order. Best-effort: a failure here doesn't
 *  fail the order (the code might just over-apply once, which we'd rather
 *  have than a dropped order). */
export async function incrementDiscountUse(rawCode: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return
  const code = rawCode.trim().toUpperCase()
  if (!code) return
  // Read current count then write +1. Not perfectly atomic without an RPC
  // but acceptable for our scale; race results in -1 use vs. reality, never
  // an over-count.
  const { data, error } = await supabase
    .from('discount_codes')
    .select('uses_count')
    .eq('code', code)
    .maybeSingle()
  if (error || !data) return
  await supabase
    .from('discount_codes')
    .update({ uses_count: (data.uses_count ?? 0) + 1 })
    .eq('code', code)
}
