'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

// The hamburger and the drawer live in different places in the layout tree
// (header vs. just below). They sync via a window-level custom event instead
// of context so the layout can stay a Server Component.
const OPEN_EVENT = 'admin-nav-open'

export function MobileNavToggle() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className="-ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 md:hidden"
      aria-label="Open navigation"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  )
}

export function MobileNavDrawer({
  brand,
  children,
}: {
  brand: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener(OPEN_EVENT, handler)
    return () => window.removeEventListener(OPEN_EVENT, handler)
  }, [])

  // Auto-close on route change.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Lock body scroll while open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {/* Scrim */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-30 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white shadow-xl transition-transform duration-200 md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
          <Link
            href="/admin"
            className="font-display text-lg font-bold tracking-tight text-gray-900"
          >
            {brand}
            <span className="ml-1.5 font-mono text-[10px] font-medium uppercase tracking-widest text-gray-400">
              admin
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close navigation"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M6 18 18 6" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">{children}</div>
        <div className="border-t border-gray-200 px-3 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            ← View storefront
          </Link>
        </div>
      </aside>
    </>
  )
}
