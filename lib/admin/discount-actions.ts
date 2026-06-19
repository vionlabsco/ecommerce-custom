'use server'

// Admin-only mutators for discount_codes. Customer-facing apply lives in
// lib/discount-actions.ts — separate file to keep the auth boundary clear.

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/admin'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

function clip(v: FormDataEntryValue | null, max: number): string {
  return String(v ?? '').trim().slice(0, max)
}

function intOrNull(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? '').trim()
  if (!s) return null
  const n = parseInt(s, 10)
  return Number.isFinite(n) ? n : null
}

function dateOrNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? '').trim()
  if (!s) return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export async function createDiscountAction(fd: FormData) {
  requireAdmin()
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase not configured — discount codes require a real database.')
  }

  const code = clip(fd.get('code'), 64).toUpperCase()
  const type = clip(fd.get('type'), 16)
  const valueRaw = String(fd.get('value') ?? '').trim()
  const value = parseInt(valueRaw, 10)
  const minDollars = parseFloat(String(fd.get('minSubtotal') ?? '0').trim() || '0')

  if (!code || code.length < 3) throw new Error('Code must be at least 3 characters.')
  if (type !== 'percent' && type !== 'fixed') throw new Error('Invalid discount type.')
  if (!Number.isFinite(value) || value <= 0) throw new Error('Value must be a positive number.')
  if (type === 'percent' && value > 100) throw new Error('Percent value cannot exceed 100.')

  // For percent: value is 1-100. For fixed: value is dollars from the form,
  // stored as cents.
  const storedValue = type === 'percent' ? value : Math.round(value * 100)

  const { error } = await supabase.from('discount_codes').insert({
    code,
    type,
    value: storedValue,
    min_subtotal_cents: Math.round(Math.max(0, minDollars) * 100),
    max_uses: intOrNull(fd.get('maxUses')),
    starts_at: dateOrNull(fd.get('startsAt')),
    ends_at: dateOrNull(fd.get('endsAt')),
    active: true,
  })
  if (error) {
    if (error.code === '23505') {
      throw new Error(`A code "${code}" already exists.`)
    }
    throw new Error(error.message)
  }

  revalidatePath('/admin/discounts')
  redirect('/admin/discounts')
}

export async function toggleDiscountAction(fd: FormData) {
  requireAdmin()
  if (!isSupabaseConfigured || !supabase) return
  const code = clip(fd.get('code'), 64)
  const nextActive = fd.get('nextActive') === 'true'
  await supabase.from('discount_codes').update({ active: nextActive }).eq('code', code)
  revalidatePath('/admin/discounts')
}

export async function deleteDiscountAction(fd: FormData) {
  requireAdmin()
  if (!isSupabaseConfigured || !supabase) return
  const code = clip(fd.get('code'), 64)
  await supabase.from('discount_codes').delete().eq('code', code)
  revalidatePath('/admin/discounts')
}
