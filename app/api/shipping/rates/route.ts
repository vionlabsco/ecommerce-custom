// Live shipping rate quotes for a destination + item list.
//
// Called by the checkout to show real carrier prices instead of flat rates.
// Queries every enabled carrier in parallel, merges the results into a single
// sorted list. If no carrier is configured, returns an empty list and the
// checkout falls back to the flat rates in site.ts.
//
// Public route (no auth) — the customer needs it before they've signed in.
// Rate-limited per IP to blunt cost-scraping abuse.
//
// Response shape:
//   { ok: true, rates: [ { carrier, carrierLabel, serviceCode, serviceName,
//                          totalCents, transitDays } ] }

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getRates as cpRates, canPostRateQuotes } from '@/lib/shipping/canada-post'
import { getRates as fedexRates, fedexConfigured } from '@/lib/shipping/fedex'
import { getRates as dhlRates, dhlConfigured } from '@/lib/shipping/dhl'
import { rateLimit, requestKey } from '@/lib/rate-limit'
import { site } from '@/lib/site'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export type MergedRate = {
  carrier: 'fedex' | 'dhl' | 'canada-post'
  carrierLabel: string
  serviceCode: string
  serviceName: string
  totalCents: number
  transitDays: number | null
}

export async function POST(req: NextRequest) {
  // Per-IP rate limit — checkout naturally fetches on address changes, so a
  // real customer might hit this 3-5 times in a session. 30/min is generous.
  const rl = rateLimit(requestKey(headers(), 'shipping-rates'), 30, 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many rate requests. Try again in a moment.' },
      { status: 429 },
    )
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON' }, { status: 400 })
  }

  const toPostal = String(body?.toPostal || '').trim()
  const toCountry = String(body?.toCountry || 'CA').trim().toUpperCase()
  const toCity = String(body?.toCity || '').trim()
  const itemCount = Math.max(1, Math.min(99, Math.floor(Number(body?.itemCount) || 1)))
  if (!toPostal) {
    return NextResponse.json(
      { ok: false, error: 'missing destination postal code' },
      { status: 400 },
    )
  }

  const p = site.parcelDefaults
  const weightGrams = p.baseGrams + p.perItemGrams * itemCount

  // Query every configured carrier in parallel. A carrier that isn't
  // configured returns [] instantly — no wasted round trip. A carrier that
  // errors returns [] too; we don't fail the whole call because one carrier
  // is having a bad day.
  const results = await Promise.all([
    fedexConfigured()
      ? fedexRates({ toPostal, toCountry, weightGrams }).catch(() => [])
      : Promise.resolve([]),
    dhlConfigured()
      ? dhlRates({
          toPostal,
          toCountry,
          toCity: toCity || 'Unknown',
          weightGrams,
          lengthCm: p.lengthCm,
          widthCm: p.widthCm,
          heightCm: p.heightCm,
        }).catch(() => [])
      : Promise.resolve([]),
    canPostRateQuotes()
      ? cpRates({
          toPostal,
          toCountry,
          weightGrams,
          lengthCm: p.lengthCm,
          widthCm: p.widthCm,
          heightCm: p.heightCm,
        }).catch(() => [])
      : Promise.resolve([]),
  ])

  const merged: MergedRate[] = [
    ...results[0].map((r) => ({
      carrier: 'fedex' as const,
      carrierLabel: 'FedEx',
      serviceCode: r.serviceCode,
      serviceName: r.serviceName,
      totalCents: r.totalCents,
      transitDays: r.transitDays,
    })),
    ...results[1].map((r) => ({
      carrier: 'dhl' as const,
      carrierLabel: 'DHL Express',
      serviceCode: r.serviceCode,
      serviceName: r.serviceName,
      totalCents: r.totalCents,
      transitDays: r.transitDays,
    })),
    ...results[2].map((r) => ({
      carrier: 'canada-post' as const,
      carrierLabel: 'Canada Post',
      serviceCode: r.serviceCode,
      serviceName: r.serviceName,
      totalCents: r.totalCents,
      transitDays: r.transitDays,
    })),
  ].sort((a, b) => a.totalCents - b.totalCents)

  return NextResponse.json({ ok: true, rates: merged })
}
