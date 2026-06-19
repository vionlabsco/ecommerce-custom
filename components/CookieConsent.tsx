'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// Lightweight consent banner. Stores the customer's decision in localStorage
// (no consent → no tracking pixels load on next render).
//
// The TrackingScripts component reads `consent.analytics === true` via the
// `window.__vlConsent` global the banner sets, so denying consent immediately
// stops new analytics scripts from being injected on subsequent pages.
//
// Three-button model is the GDPR-compliant minimum: Accept all / Necessary
// only / (link to manage in policy). Keeps the banner small while still
// being legal under CA + EU + UK regimes.

const STORAGE_KEY = 'vionlabs-cookie-consent-v1'

type Consent = {
  necessary: true       // always true; you can't opt out of "the site working"
  analytics: boolean
  marketing: boolean
  decidedAt: string
}

function read(): Consent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Consent
  } catch {
    return null
  }
}

function write(c: Consent) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(c))
  } catch {
    // storage unavailable; banner will re-show next visit
  }
  // Expose globally so TrackingScripts can check before injecting.
  ;(window as any).__vlConsent = c
}

export function CookieConsent() {
  const [decided, setDecided] = useState<Consent | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const c = read()
    if (c) {
      setDecided(c)
      ;(window as any).__vlConsent = c
    } else {
      // Defer rendering by one tick so the banner doesn't flash on top of
      // critical CLS metrics; it'll appear ~100ms after first paint.
      const t = setTimeout(() => setShow(true), 120)
      return () => clearTimeout(t)
    }
  }, [])

  function decide(analytics: boolean, marketing: boolean) {
    const c: Consent = {
      necessary: true,
      analytics,
      marketing,
      decidedAt: new Date().toISOString(),
    }
    write(c)
    setDecided(c)
    setShow(false)
  }

  if (decided || !show) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-2xl rounded-xl border border-line bg-paper p-4 shadow-2xl sm:inset-x-auto sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2 sm:p-5"
    >
      <p className="text-sm text-ink leading-relaxed">
        We use cookies to run the storefront, remember your cart, and
        (with your permission) understand how the site is used. Read our{' '}
        <Link href="/pages/privacy" className="text-accent hover:underline">
          privacy policy
        </Link>{' '}
        for the details.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => decide(true, true)}
          className="rounded-md bg-accent px-4 py-2 text-[12px] font-bold uppercase tracking-widest2 text-paper transition-colors hover:bg-accent-hover"
        >
          Accept all
        </button>
        <button
          type="button"
          onClick={() => decide(false, false)}
          className="rounded-md border border-line bg-paper px-4 py-2 text-[12px] font-medium uppercase tracking-widest2 text-ink-soft transition-colors hover:border-accent hover:text-accent"
        >
          Necessary only
        </button>
      </div>
    </div>
  )
}
