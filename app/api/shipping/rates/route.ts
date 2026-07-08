// Rate quotes for a shipping address + item list.
//
// Called by the checkout to show real Canada Post prices instead of the flat
// "Standard $8 / Express $18" placeholder. If Canada Post isn't configured,
// this route returns an empty list — the checkout falls back gracefully.
//
// Public route (no auth) — the customer needs it before they've signed in.
// Rate limiting will be added in Phase 2 (M3 in the security audit).

import { NextRequest, NextResponse } from 'next/server'
import { getRates, canPostRateQuotes } from '@/lib/shipping/canada-post'
import { site } from '@/lib/site'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!canPostRateQuotes()) {
    // Canada Post isn't configured — return an empty list. Checkout falls
    // back to the flat rates in site.ts.
    return NextResponse.json({ ok: true, rates: [] })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON' }, { status: 400 })
  }

  const toPostal = String(body?.toPostal || '').trim()
  const toCountry = String(body?.toCountry || 'CA').trim().toUpperCase()
  const itemCount = Math.max(1, Math.min(99, Math.floor(Number(body?.itemCount) || 1)))
  if (!toPostal) {
    return NextResponse.json({ ok: false, error: 'missing destination postal code' }, { status: 400 })
  }

  const p = site.parcelDefaults
  const weightGrams = p.baseGrams + p.perItemGrams * itemCount

  const rates = await getRates({
    toPostal,
    toCountry,
    weightGrams,
    lengthCm: p.lengthCm,
    widthCm: p.widthCm,
    heightCm: p.heightCm,
  })

  return NextResponse.json({ ok: true, rates })
}
