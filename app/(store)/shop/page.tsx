import Link from 'next/link'
import type { Metadata } from 'next'
import { ProductCard } from '@/components/ProductCard'
import { Reveal } from '@/components/Reveal'
import { getAllProducts, getProductsByCategory, getCategories } from '@/lib/products'
import { cn } from '@/lib/cn'

export const metadata: Metadata = { title: 'Shop' }
export const revalidate = 60

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const categories = await getCategories()
  const raw = searchParams.category
  const active = raw && categories.includes(raw) ? raw : null
  const products = active ? await getProductsByCategory(active) : await getAllProducts()

  const tabs: { label: string; value: string | null }[] = [
    { label: 'All', value: null },
    ...categories.map((c) => ({ label: c, value: c })),
  ]

  return (
    <div className="mx-auto max-w-shell px-5 py-10 md:px-8 md:py-16">
      <header className="max-w-2xl">
        <p className="label-accent">The Collection</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] md:text-5xl">
          {active ?? 'Every surface'}
        </h1>
        <p className="mt-3 text-paper-soft">
          {products.length} {products.length === 1 ? 'pad' : 'pads'} — engineered,
          tested, and built to outlast.
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
                'rounded-md border px-4 py-2 font-mono text-[11px] uppercase tracking-widest2 transition-colors',
                isActive
                  ? 'border-accent bg-accent text-ink'
                  : 'border-line text-paper-soft hover:border-paper hover:text-paper',
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      {products.length === 0 ? (
        <div className="mt-16 rounded-md border border-line bg-surface px-6 py-16 text-center">
          <p className="label-mono">No matches</p>
          <p className="mt-3 font-display text-2xl font-bold text-paper">
            Nothing in this surface yet
          </p>
          <p className="mt-2 text-sm text-paper-soft">Try another category.</p>
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
