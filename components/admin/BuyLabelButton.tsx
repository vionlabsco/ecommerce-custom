'use client'

// Admin-facing "Buy Canada Post label" widget for the order detail page.
//
// Two-step flow so the admin can see what they're about to pay before
// committing:
//   1. Pick a service (dropdown, defaults sensibly by destination country).
//   2. Click Buy → hits /api/shipping/labels/canada-post, which creates the
//      shipment, attaches the tracking PIN to the order, and fires the
//      shipped-notification email.
//
// The API route also flips `fulfillment.status` to 'fulfilled', so after a
// successful buy the parent page's manual carrier-entry form should be
// hidden on the next render. This component reports success in place until
// the caller triggers a refresh.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { normalizeCountry } from '@/lib/shipping/countries'

// Canada Post service codes — subset the merchant is most likely to use.
// Full list: https://www.canadapost-postescanada.ca/cpc/en/support/kb/business/tools/CT301.page
const DOMESTIC_SERVICES = [
  { code: 'DOM.RP', label: 'Regular Parcel — cheapest, 3-6 business days' },
  { code: 'DOM.EP', label: 'Expedited Parcel — 1-3 business days' },
  { code: 'DOM.XP', label: 'Xpresspost — next business day (major centres)' },
  { code: 'DOM.PC', label: 'Priority — next business day, delivery by 10:30' },
]

const USA_SERVICES = [
  { code: 'USA.TP', label: 'Tracked Packet USA — 4-7 business days' },
  { code: 'USA.EP', label: 'Expedited Parcel USA — 4-7 business days' },
  { code: 'USA.XP', label: 'Xpresspost USA — 2-3 business days' },
]

const INTL_SERVICES = [
  { code: 'INT.TP', label: 'Tracked Packet International — 6-10 business days' },
  { code: 'INT.XP', label: 'Xpresspost International — 4-7 business days' },
]

type Props = {
  orderNumber: string
  destinationCountry: string
}

export function BuyLabelButton({ orderNumber, destinationCountry }: Props) {
  const router = useRouter()
  // Normalize free-text country ("United States", "Canada") to ISO-2 so the
  // service dropdown picks the right list. Existing orders were stored with
  // free text before the checkout form used a country <select>.
  const country = normalizeCountry(destinationCountry)
  const services =
    country === 'CA' ? DOMESTIC_SERVICES : country === 'US' ? USA_SERVICES : INTL_SERVICES

  const [serviceCode, setServiceCode] = useState(services[0].code)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<
    | { trackingPin: string; labelUrl: string; totalCents: number }
    | null
  >(null)

  async function buy() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/shipping/labels/canada-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, serviceCode }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok || !j.ok) {
        setError(j.error || `Failed (HTTP ${res.status})`)
        setBusy(false)
        return
      }
      setResult({
        trackingPin: j.trackingPin,
        labelUrl: j.labelUrl,
        totalCents: j.totalCents,
      })
      // Ask the server component to refetch so the manual carrier form is
      // replaced by the "fulfilled" summary.
      router.refresh()
    } catch (e) {
      setError((e as Error).message || 'network error')
    } finally {
      setBusy(false)
    }
  }

  if (result) {
    return (
      <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ring-1 ring-inset ring-emerald-600/20">
        <p className="font-medium">Canada Post label purchased.</p>
        <p className="mt-1 break-all text-[13px]">
          Tracking: <span className="font-mono">{result.trackingPin}</span>
        </p>
        {result.totalCents > 0 && (
          <p className="mt-0.5 text-[13px]">
            Charged: ${(result.totalCents / 100).toFixed(2)} CAD
          </p>
        )}
        <a
          href={result.labelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-emerald-800"
        >
          Download label PDF →
        </a>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <p className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">
        Canada Post — buy label
      </p>
      <label className="mt-3 block">
        <span className="text-[12px] text-gray-600">Service</span>
        <select
          value={serviceCode}
          onChange={(e) => setServiceCode(e.target.value)}
          disabled={busy}
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-60"
        >
          {services.map((s) => (
            <option key={s.code} value={s.code}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <button
        onClick={buy}
        disabled={busy}
        className="mt-3 w-full rounded-md bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? 'Creating label…' : 'Buy label + fulfil order'}
      </button>
      {error && (
        <p className="mt-2 rounded-md bg-rose-50 px-3 py-2 text-[12.5px] text-rose-700 ring-1 ring-inset ring-rose-100">
          {error}
        </p>
      )}
      <p className="mt-2 text-[11px] text-gray-500">
        Buys a real label, attaches tracking to the order, and emails the customer.
        Charged to the card on your Canada Post account.
      </p>
    </div>
  )
}
