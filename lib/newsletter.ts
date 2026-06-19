'use server'

// Server Action invoked from the storefront's newsletter form. Persists the
// email to Supabase if configured; in demo mode it's a no-op success so the
// UI can be tested without a DB.

import { headers } from 'next/headers'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export type NewsletterResult =
  | { ok: true; alreadySubscribed: boolean }
  | { ok: false; error: string }

export async function subscribeToNewsletter(
  rawEmail: string,
): Promise<NewsletterResult> {
  const email = rawEmail.trim().toLowerCase().slice(0, 200)
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: 'Please enter a valid email.' }
  }

  // Demo mode (no Supabase): pretend success so the form can be UI-tested.
  if (!isSupabaseConfigured || !supabase) {
    return { ok: true, alreadySubscribed: false }
  }

  const ua = headers().get('user-agent')?.slice(0, 500) ?? null
  const ip =
    headers().get('x-forwarded-for')?.split(',')[0]?.trim().slice(0, 64) ??
    null

  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email, source: 'footer', user_agent: ua, ip })

  if (error) {
    // 23505 = unique violation → already subscribed
    if (error.code === '23505') {
      return { ok: true, alreadySubscribed: true }
    }
    console.error('Newsletter insert failed:', error)
    return { ok: false, error: 'Something went wrong. Try again in a moment.' }
  }

  return { ok: true, alreadySubscribed: false }
}
