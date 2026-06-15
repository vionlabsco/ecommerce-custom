import type { Metadata } from 'next'
import { getInventory } from '@/lib/admin/store'
import { setStockAction } from '@/lib/admin/actions'
import { formatPrice } from '@/lib/format'
import { Badge } from '@/components/admin/StatusBadge'

export const metadata: Metadata = { title: 'Inventory' }

export default function ProductsPage() {
  const inventory = getInventory()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Inventory</h1>
        <p className="mt-1 text-sm text-ink-soft">Adjust stock on hand for each product.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[1.8fr_0.8fr_0.9fr_1.1fr] gap-4 border-b border-line px-5 py-3 text-[11px] uppercase tracking-[0.1em] text-ink-soft">
              <span>Product</span>
              <span className="text-right">Price</span>
              <span>Status</span>
              <span className="text-right">Stock on hand</span>
            </div>
            <div className="divide-y divide-line">
              {inventory.map((p) => {
                const tone = p.stock === 0 ? 'red' : p.stock <= 5 ? 'amber' : 'green'
                const label = p.stock === 0 ? 'out of stock' : p.stock <= 5 ? 'low stock' : 'in stock'
                return (
                  <div
                    key={p.id}
                    className="grid grid-cols-[1.8fr_0.8fr_0.9fr_1.1fr] items-center gap-4 px-5 py-3.5 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{p.name}</span>
                      <span className="block truncate text-[12px] text-ink-soft">{p.category}</span>
                    </span>
                    <span className="text-right tabular-nums">{formatPrice(p.priceCents)}</span>
                    <span>
                      <Badge tone={tone}>{label}</Badge>
                    </span>
                    <form action={setStockAction} className="flex items-center justify-end gap-2">
                      <input type="hidden" name="productId" value={p.id} />
                      <input
                        type="number"
                        name="stock"
                        min={0}
                        defaultValue={p.stock}
                        className="w-20 rounded-lg border border-line bg-white px-2.5 py-1.5 text-right text-sm tabular-nums focus:border-ink focus:outline-none"
                      />
                      <button className="rounded-lg border border-line bg-white px-3 py-1.5 text-[13px] font-medium transition-colors hover:border-ink">
                        Save
                      </button>
                    </form>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
