'use server'

// Server actions for the customer-facing "Apply code" form. The cart
// passes the current subtotal so we can check minimum-spend rules and
// return the actual discount amount the client should apply locally.

import { validateDiscountCode } from './discounts'

export async function applyCodeAction(
  rawCode: string,
  subtotalCents: number,
): Promise<
  | { ok: true; code: string; discountCents: number }
  | { ok: false; reason: string }
> {
  const v = await validateDiscountCode(rawCode, subtotalCents)
  if (!v.ok) return v
  return { ok: true, code: v.code.code, discountCents: v.discountCents }
}
