import Link from 'next/link'
import type { Metadata } from 'next'
import { ProductCard } from '@/components/ProductCard'
import { Reveal } from '@/components/Reveal'
import { getAllProducts, getProductsByCategory, getCategories } from '@/lib/products'
import { cn } from '@/lib/cn'

export const metadata: Metadata = { title: 'Shop' }
export const dynamic = 'force-dynamic'

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
    <div className="mx-auto max-w-shell px-5 py-12 md:px-8 md:py-16">
      <header className="max-w-2xl">
        <p className="text-[12px] uppercase tracking-[0.22em] text-clay">The collection</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">
          {active ?? 'Shop all'}
        </h1>
        <p className="mt-3 text-ink-soft">
          {products.length} {products.length === 1 ? 'piece' : 'pieces'} — quietly made,
          built to be worn for years.
        </p>
      </header>

      {/* category filter */}
      <nav className="mt-8 flex flex-wrap gap-2 border-b border-line pb-6">
        {tabs.map((tab) => {
          const isActive = tab.value === active
          const href = tab.value ? `/shop?category=${encodeURIComponent(tab.value)}` : '/shop'
          return (
            <Link
              key={tab.label}
              href={href}
              className={cn(
                'rounded-full border px-4 py-2 text-[13px] uppercase tracking-[0.12em] transition-colors',
                isActive
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line text-ink-soft hover:border-ink hover:text-ink',
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p, i) => (
          <Reveal key={p.id} delay={(i % 4) * 80}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </div>
  )
}
