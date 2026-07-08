'use client'

// Age verification gate. Blocks the storefront on first visit until the
// customer confirms they're 18+. Their choice is stored in localStorage so
// the modal only fires once per device.
//
// Under-18 doesn't try to redirect off-site (fragile + hostile) — it swaps
// the modal into a soft "come back later" state that also persists, so a
// determined kid isn't invited to just reload and re-answer.
//
// Placeholder — swap the age threshold, copy, and legal disclaimer to match
// the finalised regulatory language before launch (varies by jurisdiction).

import { useEffect, useState } from 'react'
import { site } from '@/lib/site'

const STORAGE_KEY = 'vionlabs-age-verified-v1'
const MINIMUM_AGE = 18

type Status = 'loading' | 'verified' | 'denied' | 'prompt'

export function AgeGate() {
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === 'verified') return setStatus('verified')
      if (stored === 'denied') return setStatus('denied')
      setStatus('prompt')
    } catch {
      setStatus('prompt')
    }
  }, [])

  useEffect(() => {
    const locked = status === 'prompt' || status === 'denied'
    document.body.style.overflow = locked ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [status])

  function confirm() {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'verified')
    } catch {}
    setStatus('verified')
  }

  function deny() {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'denied')
    } catch {}
    setStatus('denied')
  }

  if (status === 'loading' || status === 'verified') return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
    >
      <div className="absolute inset-0 bg-navy/85 backdrop-blur-md" aria-hidden />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-paper p-8 text-center shadow-2xl sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-widest2 text-accent">
          {site.brand}
        </p>

        {status === 'prompt' ? (
          <>
            <h2
              id="age-gate-title"
              className="mt-4 font-display text-2xl font-bold leading-tight tracking-tightest text-ink sm:text-3xl"
            >
              Are you {MINIMUM_AGE} or older?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              This site sells dietary supplements. You must be {MINIMUM_AGE} or
              older to browse and purchase.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={confirm}
                className="rounded-md bg-accent px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest2 text-paper transition-colors hover:bg-accent-hover"
              >
                Yes, I&apos;m {MINIMUM_AGE}+
              </button>
              <button
                onClick={deny}
                className="rounded-md border border-line bg-paper px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest2 text-ink-soft transition-colors hover:border-accent hover:text-accent"
              >
                No, I&apos;m under {MINIMUM_AGE}
              </button>
            </div>
            <p className="mt-6 text-[11px] leading-relaxed text-ink-mute">
              By continuing you confirm you meet the age requirement in your
              jurisdiction. These products are not intended to diagnose, treat,
              cure, or prevent any disease.
            </p>
          </>
        ) : (
          <>
            <h2
              id="age-gate-title"
              className="mt-4 font-display text-2xl font-bold leading-tight tracking-tightest text-ink sm:text-3xl"
            >
              Come back when you&apos;re {MINIMUM_AGE}.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              You need to be {MINIMUM_AGE} or older to shop {site.brand}. Thanks
              for being honest — we&apos;ll see you here in a few years.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
