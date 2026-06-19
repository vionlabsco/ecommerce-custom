'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useWishlist } from '@/lib/wishlist'
import { ProductCard } from '@/components/ProductCard'
import type { Product } from '@/lib/products'

// Wishlist lives in localStorage, so we have to fetch matching products
// on the client. We expose a tiny POST endpoint at /api/products/by-slugs
// that returns the freshest data for the slugs we hold. (Pure SSR would
// require knowing the slugs at request time — they're per-browser.)
//
// While the products are loading we show a count and skeletons; once the
// fetch lands we render the same ProductCards used elsewhere.

export default function WishlistPage() {
  const { slugs, hydrated, count } = useWishlist()
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    if (!hydrated) return
    if (slugs.length === 0) {
      setProducts([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/products/by-slugs', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ slugs }),
        })
        const data = await res.json()
        if (!cancelled) setProducts(Array.isArray(data.products) ? data.products : [])
      } catch {
        if (!cancelled) setProducts([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [hydrated, slugs.join(',')])

  return (
    <div className="mx-auto max-w-shell px-5 py-12 md:px-8 md:py-16">
      <Link
        href="/account"
        className="text-[11px] font-medium uppercase tracking-widest2 text-ink-soft hover:text-accent"
      >
        ← Your account
      </Link>

      <header className="mt-4">
        <p className="label-accent">Saved</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink md:text-4xl">
          Wishlist
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          {!hydrated ? 'Loading…' : count === 0 ? 'Nothing saved yet.' : `${count} ${count === 1 ? 'item' : 'items'}`}
        </p>
      </header>

      {hydrated && count === 0 && (
        <div className="mt-10 rounded-xl border border-line bg-card p-10 text-center">
          <p className="font-display text-xl font-bold text-ink">
            Save the pads you&apos;re considering
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Tap the heart on any product card or page — it&apos;ll show up here.
          </p>
          <Link
            href="/shop"
            className="mt-5 inline-block rounded-md bg-accent px-5 py-2.5 text-[12px] font-bold uppercase tracking-widest2 text-paper hover:bg-accent-hover"
          >
            Browse the shop
          </Link>
        </div>
      )}

      {hydrated && count > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-5 md:gap-y-10 lg:grid-cols-4">
          {products === null
            ? slugs.map((s) => (
                <div key={s} className="animate-pulse">
                  <div className="aspect-square rounded-md bg-ink/5" />
                  <div className="mt-4 h-4 w-2/3 rounded bg-ink/10" />
                  <div className="mt-2 h-3 w-1/3 rounded bg-ink/5" />
                </div>
              ))
            : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
