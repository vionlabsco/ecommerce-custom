import Link from 'next/link'
import type { Metadata } from 'next'
import { ProductCard } from '@/components/ProductCard'
import { Reveal } from '@/components/Reveal'
import {
  getAllProducts,
  getProductsByCategory,
  getCategories,
  searchProducts,
} from '@/lib/products'
import { cn } from '@/lib/cn'

export const metadata: Metadata = { title: 'Shop' }
export const revalidate = 60

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string }
}) {
  const categories = await getCategories()
  const raw = searchParams.category
  const active = raw && categories.includes(raw) ? raw : null
  const query = (searchParams.q ?? '').trim().slice(0, 120)

  // Search takes precedence over category — if both come in, we search first
  // and ignore the category filter (cleaner than intersecting two filters).
  let products
  if (query) {
    products = await searchProducts(query)
  } else if (active) {
    products = await getProductsByCategory(active)
  } else {
    products = await getAllProducts()
  }

  const tabs: { label: string; value: string | null }[] = [
    { label: 'All', value: null },
    ...categories.map((c) => ({ label: c, value: c })),
  ]

  return (
    <div className="mx-auto max-w-shell px-5 py-10 md:px-8 md:py-16">
      <header className="max-w-2xl">
        <p className="label-accent">
          {query ? 'Search results' : 'Available now'}
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] text-ink md:text-5xl">
          {query ? <>&ldquo;{query}&rdquo;</> : (active ?? 'The formulation')}
        </h1>
        <p className="mt-3 text-ink-soft">
          {query ? (
            <>
              {products.length} {products.length === 1 ? 'result' : 'results'} for that search.{' '}
              <Link href="/shop" className="text-accent hover:underline">
                Clear search →
              </Link>
            </>
          ) : (
            <>
              {products.length} {products.length === 1 ? 'product' : 'products'} — pharmaceutical-grade,
              third-party tested, non-invasive.
            </>
          )}
        </p>
      </header>

      {/* category filter */}
      <nav className="mt-7 flex flex-wrap gap-2 border-b border-line pb-5">
        {tabs.map((tab) => {
          const isActive = tab.value === active
          const href = tab.value ? `/shop?category=${encodeURIComponent(tab.value)}` : '/shop'
          return (
            <Link
              key={tab.label}
              href={href}
              className={cn(
                'rounded-md border px-4 py-2 text-[11px] font-medium uppercase tracking-widest2 transition-colors',
                isActive
                  ? 'border-accent bg-accent text-paper'
                  : 'border-line bg-paper text-ink-soft hover:border-accent hover:text-accent',
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      {products.length === 0 ? (
        <div className="mt-16 rounded-md border border-line bg-surface px-6 py-16 text-center">
          <p className="label-mono">Nothing to show</p>
          <p className="mt-3 font-display text-2xl font-bold text-ink">
            No products in this view
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {active ? 'Try another category.' : 'Add a product in the admin to get started.'}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:mt-10 md:grid-cols-3 md:gap-x-5 md:gap-y-12 lg:grid-cols-4">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 80}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}
