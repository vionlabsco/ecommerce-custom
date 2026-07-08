'use server'

// Server actions for the customer-facing "Apply code" form. The cart
// passes the current subtotal so we can check minimum-spend rules and
// return the actual discount amount the client should apply locally.
//
// Two hardenings (security audit M1):
//   1. Failure reasons are collapsed to a single generic message unless the
//      failure is minimum-spend (which is UX-useful and can't be abused as
//      an oracle any worse than knowing the code exists in the first place).
//   2. Per-IP rate limit — 10 attempts per minute — blunts brute-force
//      enumeration of the code space.

import { headers } from 'next/headers'
import { validateDiscountCode } from './discounts'
import { rateLimit, requestKey } from './rate-limit'

const GENERIC_INVALID = 'This code is invalid or expired.'

export async function applyCodeAction(
  rawCode: string,
  subtotalCents: number,
): Promise<
  | { ok: true; code: string; discountCents: number }
  | { ok: false; reason: string }
> {
  // Rate-limit per IP. Ten attempts per minute is generous for a real
  // customer typing a code and forgiving fat-finger typos, but caps a bot
  // to at most 14,400 tries per day per IP — infeasible to enumerate a
  // reasonable 6-character alphanumeric code space.
  const rl = rateLimit(requestKey(headers(), 'applyCode'), 10, 60_000)
  if (!rl.ok) {
    return { ok: false, reason: 'Too many attempts. Try again in a minute.' }
  }

  const v = await validateDiscountCode(rawCode, subtotalCents)
  if (v.ok) return { ok: true, code: v.code.code, discountCents: v.discountCents }

  // Minimum-spend is the one non-generic reason we keep — it's a UX call
  // (customer needs to know to add items) and not usefully enumerable.
  if (/Spend at least/.test(v.reason)) return { ok: false, reason: v.reason }
  return { ok: false, reason: GENERIC_INVALID }
}
