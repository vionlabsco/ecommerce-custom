import Link from 'next/link'
import type { Metadata } from 'next'
import { getCategories } from '@/lib/products'
import { createCategoryAction, deleteCategoryAction } from '@/lib/admin/product-actions'

export const metadata: Metadata = { title: 'Categories' }

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="max-w-lg space-y-6">
      <Link href="/admin/products" className="text-[13px] text-ink-soft hover:text-clay">
        ← Products
      </Link>
      <h1 className="font-display text-3xl">Categories</h1>

      <form action={createCategoryAction} className="flex gap-2">
        <input
          name="name"
          required
          placeholder="New category name"
          className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none"
        />
        <button className="rounded-lg bg-ink px-5 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-clay">
          Add
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <div className="divide-y divide-line">
          {categories.map((c) => (
            <div key={c} className="flex items-center justify-between px-5 py-3 text-sm">
              <span>{c}</span>
              <form action={deleteCategoryAction}>
                <input type="hidden" name="name" value={c} />
                <button className="text-[13px] text-rose-600 transition-colors hover:text-rose-700">
                  Delete
                </button>
              </form>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-ink-soft">No categories yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
