'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

// Search opens as an overlay over the header (avoids pushing layout around)
// and submits to /shop?q=... so results render in the existing grid + the
// query stays bookmarkable. Open via header button or keyboard "/" shortcut
// (industry standard for storefronts).
const OPEN_EVENT = 'open-search'

export function SearchToggle() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      aria-label="Open search"
      className="group inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-paper text-ink-soft transition-colors hover:border-accent hover:text-accent md:h-auto md:w-auto md:gap-2 md:border-0 md:px-2 md:py-1.5 md:text-[11px] md:font-medium md:uppercase md:tracking-widest2"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
        <path d="m21 21-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span className="hidden md:inline">Search</span>
    </button>
  )
}

export function SearchOverlay() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Open on event from header button
  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener(OPEN_EVENT, handler)
    return () => window.removeEventListener(OPEN_EVENT, handler)
  }, [])

  // "/" keyboard shortcut to open (skip when typing in an input)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !isTypingInField()) {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape' && open) setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  // Focus the input + lock scroll when opening
  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = q.trim()
    if (!trimmed) return
    setOpen(false)
    router.push(`/shop?q=${encodeURIComponent(trimmed)}`)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Search">
      <div
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
        aria-hidden
      />
      <div className="relative mx-auto mt-[10vh] w-full max-w-2xl px-4">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-paper p-2 shadow-2xl">
          <div className="flex items-center gap-3 px-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="text-ink-soft">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="m21 21-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search pads, colours, or sizes…"
              className="w-full bg-transparent py-4 text-lg text-ink placeholder:text-ink-mute focus:outline-none"
              autoComplete="off"
              maxLength={120}
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-line px-2 py-1 text-[11px] font-medium uppercase tracking-widest2 text-ink-soft hover:border-ink hover:text-ink"
              aria-label="Close search"
            >
              Esc
            </button>
          </div>
          <p className="border-t border-line px-3 py-2 text-[11px] text-ink-mute">
            Press <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-ink-soft">Enter</span> to search.
            Or browse <button type="button" onClick={() => { setOpen(false); router.push('/shop') }} className="text-accent hover:underline">the full collection →</button>
          </p>
        </form>
      </div>
    </div>
  )
}

function isTypingInField(): boolean {
  const el = document.activeElement as HTMLElement | null
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || el.isContentEditable
}
