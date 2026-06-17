import Link from 'next/link'
import type { Metadata } from 'next'
import { getInventory } from '@/lib/admin/store'
import { setStockAction } from '@/lib/admin/actions'
import { deleteProductAction } from '@/lib/admin/product-actions'
import { formatPrice } from '@/lib/format'
import { PageHeader } from '@/components/admin/PageHeader'

export const metadata: Metadata = { title: 'Products' }

export default async function ProductsPage() {
  const inventory = await getInventory()

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${inventory.length} ${inventory.length === 1 ? 'product' : 'products'}`}
        action={
          <div className="flex gap-2">
            <Link
              href="/admin/products/categories"
              className="rounded-md border border-gray-200 bg-white px-3.5 py-2 text-[13px] font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              Categories
            </Link>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-3.5 py-2 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-emerald-800"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add product
            </Link>
          </div>
        }
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {inventory.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500">
            No products yet — add your first with{' '}
            <Link href="/admin/products/new" className="font-medium text-emerald-700 hover:text-emerald-800">
              New product
            </Link>
            .
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[820px]">
              <div className="grid grid-cols-[1.8fr_0.9fr_0.8fr_1.2fr_0.9fr] gap-4 border-b border-gray-200 bg-gray-50 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                <span>Product</span>
                <span>Category</span>
                <span className="text-right">Price</span>
                <span>Stock</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-gray-100">
                {inventory.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-[1.8fr_0.9fr_0.8fr_1.2fr_0.9fr] items-center gap-4 px-5 py-3 text-sm hover:bg-gray-50"
                  >
                    <span className="truncate font-medium text-gray-900">{p.name}</span>
                    <span className="text-gray-600">{p.category}</span>
                    <span className="text-right tabular-nums text-gray-900">
                      {formatPrice(p.priceCents)}
                    </span>
                    <form action={setStockAction} className="flex items-center gap-2">
                      <input type="hidden" name="productId" value={p.id} />
                      <input
                        type="number"
                        name="stock"
                        min={0}
                        defaultValue={p.stock}
                        className="w-20 rounded-md border border-gray-300 bg-white px-2 py-1 text-right text-sm tabular-nums text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                      <button className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[12px] font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50">
                        Save
                      </button>
                    </form>
                    <span className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-[13px] font-medium text-emerald-700 transition-colors hover:text-emerald-800"
                      >
                        Edit
                      </Link>
                      <form action={deleteProductAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="text-[13px] font-medium text-rose-600 transition-colors hover:text-rose-700">
                          Delete
                        </button>
                      </form>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
