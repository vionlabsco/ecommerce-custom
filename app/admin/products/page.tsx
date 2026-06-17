import Link from 'next/link'
import type { Metadata } from 'next'
import { getInventory } from '@/lib/admin/store'
import { setStockAction } from '@/lib/admin/actions'
import { deleteProductAction } from '@/lib/admin/product-actions'
import { formatPrice } from '@/lib/format'

export const metadata: Metadata = { title: 'Products' }

export default async function ProductsPage() {
  const inventory = await getInventory()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {inventory.length} {inventory.length === 1 ? 'product' : 'products'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/products/categories"
            className="rounded-lg border border-line bg-white px-4 py-2 text-[13px] font-medium transition-colors hover:border-ink"
          >
            Categories
          </Link>
          <Link
            href="/admin/products/new"
            className="rounded-lg bg-ink px-4 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-clay"
          >
            + New product
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <div className="overflow-x-auto">
          <div className="min-w-[820px]">
            <div className="grid grid-cols-[1.8fr_0.9fr_0.8fr_1.2fr_0.9fr] gap-4 border-b border-line px-5 py-3 text-[11px] uppercase tracking-[0.1em] text-ink-soft">
              <span>Product</span>
              <span>Category</span>
              <span className="text-right">Price</span>
              <span>Stock</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-line">
              {inventory.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-[1.8fr_0.9fr_0.8fr_1.2fr_0.9fr] items-center gap-4 px-5 py-3.5 text-sm"
                >
                  <span className="truncate font-medium">{p.name}</span>
                  <span className="text-ink-soft">{p.category}</span>
                  <span className="text-right tabular-nums">{formatPrice(p.priceCents)}</span>
                  <form action={setStockAction} className="flex items-center gap-2">
                    <input type="hidden" name="productId" value={p.id} />
                    <input
                      type="number"
                      name="stock"
                      min={0}
                      defaultValue={p.stock}
                      className="w-16 rounded-lg border border-line bg-white px-2 py-1 text-right text-sm tabular-nums focus:border-ink focus:outline-none"
                    />
                    <button className="rounded-md border border-line px-2 py-1 text-[12px] transition-colors hover:border-ink">
                      Save
                    </button>
                  </form>
                  <span className="flex items-center justify-end gap-4">
                    <Link href={`/admin/products/${p.id}`} className="text-[13px] text-ink-soft transition-colors hover:text-ink">
                      Edit
                    </Link>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="text-[13px] text-rose-600 transition-colors hover:text-rose-700">
                        Delete
                      </button>
                    </form>
                  </span>
                </div>
              ))}
              {inventory.length === 0 && (
                <p className="px-5 py-10 text-center text-sm text-ink-soft">
                  No products yet — add your first with “New product”.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
