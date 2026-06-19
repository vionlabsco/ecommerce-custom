// POST /api/products/by-slugs
// Body: { slugs: string[] }
// Returns the matching products, in the order requested. Used by the
// wishlist page which holds slugs in localStorage and needs fresh data.

import { NextResponse } from 'next/server'
import { getProductBySlug } from '@/lib/products'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let slugs: string[] = []
  try {
    const body = await request.json()
    if (Array.isArray(body?.slugs)) {
      slugs = body.slugs
        .filter((s: unknown) => typeof s === 'string')
        .slice(0, 100)
        .map((s: string) => s.slice(0, 100))
    }
  } catch {
    return NextResponse.json({ products: [] })
  }

  // Fetch in parallel, then preserve request order.
  const products = await Promise.all(slugs.map((slug) => getProductBySlug(slug)))
  return NextResponse.json({
    products: products.filter(Boolean),
  })
}
