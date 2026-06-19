'use client'

// Client-side wishlist hook. Stores product slugs in localStorage so the
// list persists across visits without requiring a sign-in. (We could sync
// to Supabase per-user later — but localStorage covers the 80% case.)
//
// Why slugs and not full Product objects:
//   1. Slugs are stable; product data changes (price, image, name).
//   2. We re-fetch fresh product data on the wishlist page anyway, so
//      storing more would be wasted bytes that can go stale.

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'vionlabs-wishlist-v1'
const EVENT_NAME = 'vionlabs-wishlist-change'

function read(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.filter((s) => typeof s === 'string')
    return []
  } catch {
    return []
  }
}

function write(slugs: string[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs))
    // Other useWishlist() consumers in the same tab re-read on this event.
    // Cross-tab sync is handled by the native `storage` event below.
    window.dispatchEvent(new CustomEvent(EVENT_NAME))
  } catch {
    // storage may be unavailable (private mode); fail quietly
  }
}

export function useWishlist() {
  const [slugs, setSlugs] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setSlugs(read())
    setHydrated(true)

    const sync = () => setSlugs(read())
    window.addEventListener(EVENT_NAME, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT_NAME, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs])

  const toggle = useCallback((slug: string) => {
    const current = read()
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug]
    write(next)
    setSlugs(next)
  }, [])

  const remove = useCallback((slug: string) => {
    const current = read()
    const next = current.filter((s) => s !== slug)
    write(next)
    setSlugs(next)
  }, [])

  return { slugs, has, toggle, remove, hydrated, count: slugs.length }
}
