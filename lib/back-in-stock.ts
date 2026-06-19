'use server'

// Server action invoked by the "Notify when back in stock" form on a PDP.
// Persists (product_id, variant_key, email) to Supabase. When the admin
// later restocks (sets product.stock > 0 or removes variant from soldOut),
// a background task can email everyone whose notified_at is null. The
// background task isn't wired yet — this just captures the signups.

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export type SignupResult =
  | { ok: true; alreadyOnList: boolean }
  | { ok: false; error: string }

export async function subscribeBackInStock(input: {
  productId: string
  variantKey?: string | null
  email: string
}): Promise<SignupResult> {
  const productId = String(input.productId ?? '').slice(0, 64)
  const variantKey = (input.variantKey ?? '').toString().slice(0, 64) || null
  const email = String(input.email ?? '').trim().toLowerCase().slice(0, 200)

  if (!productId) return { ok: false, error: 'Missing product.' }
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Please enter a valid email.' }

  if (!isSupabaseConfigured || !supabase) {
    // Demo mode: pretend success so UI can be tested without a DB
    return { ok: true, alreadyOnList: false }
  }

  const { error } = await supabase
    .from('back_in_stock_signups')
    .insert({ product_id: productId, variant_key: variantKey, email })

  if (error) {
    if (error.code === '23505') return { ok: true, alreadyOnList: true } // unique violation
    console.error('[back-in-stock] insert failed:', error)
    return { ok: false, error: 'Something went wrong. Try again in a moment.' }
  }

  return { ok: true, alreadyOnList: false }
}
