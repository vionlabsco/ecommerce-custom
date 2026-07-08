// Dynamic sitemap.xml — lists every storefront-visible page (incl. dynamic
// product pages) so Google can index them. Excludes /admin/*.

import type { MetadataRoute } from 'next'
import { getAllProducts } from '@/lib/products'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticPaths = [
    '',
    '/shop',
    '/pages/about',
    '/pages/specs',
    '/pages/shipping-returns',
    '/pages/warranty',
    '/pages/contact',
    '/pages/privacy',
    '/pages/terms',
  ]

  const products = await getAllProducts().catch(() => [])
  const productPaths = products.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    ...staticPaths.map((p) => ({
      url: `${SITE_URL}${p}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: p === '' ? 1 : 0.6,
    })),
    ...productPaths,
  ]
}
