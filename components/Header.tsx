'use client'

import Link from 'next/link'
import { useCart } from './CartProvider'
import { site } from '@/lib/site'

const NAV = [
  { label: 'Shop', href: '/shop' },
  { label: 'Glass', href: '/shop?category=Glass' },
  { label: 'Cloth', href: '/shop?category=Cloth' },
]

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 8h12l-.8 11.2a1.5 1.5 0 0 1-1.5 1.4H8.3a1.5 1.5 0 0 1-1.5-1.4L6 8Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M9 8V6.5a3 3 0 0 1 6 0V8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Header() {
  const { count, hydrated, openCart } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-shell grid-cols-2 items-center gap-4 px-5 md:grid-cols-3 md:px-8">
        <nav className="hidden items-center gap-7 text-[13px] uppercase tracking-[0.14em] text-ink-soft md:flex">
          {NAV.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="justify-self-start font-display text-2xl tracking-tightest text-ink md:justify-self-center"
        >
          {site.brand}
        </Link>

        <div className="flex items-center justify-end gap-1">
          <Link
            href="/shop"
            className="px-3 py-2 text-[13px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink md:hidden"
          >
            Shop
          </Link>
          <button
            onClick={openCart}
            aria-label="Open cart"
            className="group inline-flex items-center gap-2 rounded-full px-3 py-2 text-ink transition-colors hover:text-clay"
          >
            <span className="relative inline-flex">
              <BagIcon />
              {hydrated && count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-clay px-1 text-[10px] font-semibold text-paper">
                  {count}
                </span>
              )}
            </span>
            <span className="hidden text-[13px] uppercase tracking-[0.14em] sm:inline">Cart</span>
          </button>
        </div>
      </div>
    </header>
  )
}
