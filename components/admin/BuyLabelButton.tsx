'use client'

// Multi-carrier "Buy Label" widget for the order detail page.
//
// Three-step flow:
//   1. Pick a carrier (Canada Post / FedEx / DHL)
//   2. Pick a service (list changes per carrier + destination country)
//   3. Click Buy → hits /api/shipping/labels/<carrier>, which creates the
//      shipment, attaches tracking, and fires the shipped-notification email.
//
// Carriers that aren't configured (no env vars) still show up in the picker
// but the Buy click returns a friendly 503 with a "not configured" message.

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { normalizeCountry } from '@/lib/shipping/countries'

type Service = { code: string; label: string }

// ── Canada Post service codes ───────────────────────────────────────────────
const CP_DOMESTIC: Service[] = [
  { code: 'DOM.RP', label: 'Regular Parcel — cheapest, 3-6 business days' },
  { code: 'DOM.EP', label: 'Expedited Parcel — 1-3 business days' },
  { code: 'DOM.XP', label: 'Xpresspost — next business day (major centres)' },
  { code: 'DOM.PC', label: 'Priority — next business day by 10:30' },
]
const CP_USA: Service[] = [
  { code: 'USA.TP', label: 'Tracked Packet USA — 4-7 business days' },
  { code: 'USA.EP', label: 'Expedited Parcel USA — 4-7 business days' },
  { code: 'USA.XP', label: 'Xpresspost USA — 2-3 business days' },
]
const CP_INTL: Service[] = [
  { code: 'INT.TP', label: 'Tracked Packet International — 6-10 business days' },
  { code: 'INT.XP', label: 'Xpresspost International — 4-7 business days' },
]

// ── FedEx service codes ─────────────────────────────────────────────────────
const FEDEX_DOMESTIC: Service[] = [
  { code: 'FEDEX_GROUND', label: 'FedEx Ground — 1-5 business days' },
  { code: 'FEDEX_EXPRESS_SAVER', label: 'Express Saver — 3 business days' },
  { code: 'FEDEX_2_DAY', label: '2Day — 2 business days' },
  { code: 'STANDARD_OVERNIGHT', label: 'Standard Overnight — next business day' },
]
const FEDEX_INTL: Service[] = [
  { code: 'INTERNATIONAL_ECONOMY', label: 'International Economy — 4-6 business days' },
  { code: 'INTERNATIONAL_PRIORITY', label: 'International Priority — 1-3 business days' },
]

// ── DHL Express service codes ──────────────────────────────────────────────
// DHL uses product codes; these are the most common Express offerings.
const DHL_SERVICES: Service[] = [
  { code: 'P', label: 'Express Worldwide — end of next business day' },
  { code: 'U', label: 'Express Worldwide (non-doc)' },
  { code: 'D', label: 'Express Worldwide Document' },
  { code: 'N', label: 'Domestic Express — next business day' },
]

type Carrier = 'canada-post' | 'fedex' | 'dhl'

// Order matters — FedEx is Vion Labs' primary carrier for CA→US, DHL is the
// backup for international, Canada Post kept in case a future domestic need
// comes up.
const CARRIERS: Array<{ id: Carrier; label: string }> = [
  { id: 'fedex', label: 'FedEx' },
  { id: 'dhl', label: 'DHL Express' },
  { id: 'canada-post', label: 'Canada Post' },
]

function servicesFor(carrier: Carrier, country: string): Service[] {
  if (carrier === 'canada-post') {
    if (country === 'CA') return CP_DOMESTIC
    if (country === 'US') return CP_USA
    return CP_INTL
  }
  if (carrier === 'fedex') {
    // FedEx: domestic set only applies if shipper + recipient share country.
    // We don't know shipper here, so key off recipient — CA + US both use the
    // "domestic-looking" set, everywhere else uses international.
    if (country === 'CA' || country === 'US') return FEDEX_DOMESTIC
    return FEDEX_INTL
  }
  return DHL_SERVICES
}

type Props = {
  orderNumber: string
  destinationCountry: string
  /** What the customer chose at checkout — pre-selects the carrier + service
   *  so the admin's next click matches what the customer already paid for. */
  selectedShipping?: {
    carrier: Carrier
    serviceCode: string
    serviceName: string
  } | null
}

export function BuyLabelButton({
  orderNumber,
  destinationCountry,
  selectedShipping,
}: Props) {
  const router = useRouter()
  const country = normalizeCountry(destinationCountry)

  const [carrier, setCarrier] = useState<Carrier>(
    selectedShipping?.carrier ?? 'fedex',
  )

  // Merge the customer's actual checkout choice (if any) into the service
  // list. FedEx returns different service codes per country (e.g. Canada
  // uses INTERNATIONAL_ECONOMY for domestic, the US uses FEDEX_GROUND), so
  // our hardcoded lists sometimes don't include the customer's real pick.
  // Always show the customer's actual service as an option so the admin
  // doesn't have to guess.
  const services = useMemo(() => {
    const base = servicesFor(carrier, country)
    if (
      selectedShipping &&
      selectedShipping.carrier === carrier &&
      !base.find((s) => s.code === selectedShipping.serviceCode)
    ) {
      return [
        {
          code: selectedShipping.serviceCode,
          label: `${selectedShipping.serviceName} — customer's choice at checkout`,
        },
        ...base,
      ]
    }
    return base
  }, [carrier, country, selectedShipping])

  const [serviceCode, setServiceCode] = useState(
    selectedShipping?.serviceCode ?? services[0].code,
  )

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<
    | { carrier: Carrier; trackingPin: string; labelUrl: string; totalCents: number }
    | null
  >(null)

  // Keep serviceCode in sync when carrier changes. If the current selection
  // isn't in the new list, fall back to the customer's choice (when the
  // switched carrier matches) or the first available service.
  useMemo(() => {
    if (!services.find((s) => s.code === serviceCode)) {
      const customerChoice =
        selectedShipping && selectedShipping.carrier === carrier
          ? selectedShipping.serviceCode
          : null
      setServiceCode(customerChoice ?? services[0].code)
    }
  }, [services, serviceCode, carrier, selectedShipping])

  async function buy() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/shipping/labels/${carrier}`, {
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
        carrier,
        trackingPin: j.trackingPin,
        labelUrl: j.labelUrl,
        totalCents: j.totalCents,
      })
      router.refresh()
    } catch (e) {
      setError((e as Error).message || 'network error')
    } finally {
      setBusy(false)
    }
  }

  if (result) {
    const carrierName =
      CARRIERS.find((c) => c.id === result.carrier)?.label ?? result.carrier
    return (
      <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ring-1 ring-inset ring-emerald-600/20">
        <p className="font-medium">{carrierName} label purchased.</p>
        <p className="mt-1 break-all text-[13px]">
          Tracking: <span className="font-mono">{result.trackingPin}</span>
        </p>
        {result.totalCents > 0 && (
          <p className="mt-0.5 text-[13px]">
            Charged: ${(result.totalCents / 100).toFixed(2)}
          </p>
        )}
        <a
          href={result.labelUrl}
          target="_blank"
          rel="noopener noreferrer"
          download={`${result.carrier}-${result.trackingPin}.pdf`}
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
        Buy shipping label
      </p>

      <label className="mt-3 block">
        <span className="text-[12px] text-gray-600">Carrier</span>
        <select
          value={carrier}
          onChange={(e) => setCarrier(e.target.value as Carrier)}
          disabled={busy}
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-60"
        >
          {CARRIERS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

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
        Buys a real label from the selected carrier, attaches tracking to the
        order, and emails the customer. Charged to the account on file for the
        carrier you pick.
      </p>
    </div>
  )
}
