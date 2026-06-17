import type { Product } from '@/lib/products'

const labelCls = 'mb-1.5 block text-[12px] uppercase tracking-[0.1em] text-ink-soft'
const inputCls =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none'

export function ProductForm({
  action,
  product,
  categories,
  stock = 0,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>
  product?: Product
  categories: string[]
  stock?: number
  submitLabel: string
}) {
  const price = product ? (product.priceCents / 100).toString() : ''
  const compareAt = product?.compareAtCents ? (product.compareAtCents / 100).toString() : ''

  return (
    <form action={action} className="max-w-2xl space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div>
        <label className={labelCls} htmlFor="name">Name</label>
        <input id="name" name="name" required defaultValue={product?.name} className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="category">Category</label>
          <input
            id="category"
            name="category"
            list="cats"
            required
            defaultValue={product?.category}
            placeholder="Knitwear"
            className={inputCls}
          />
          <datalist id="cats">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <label className={labelCls} htmlFor="slug">Slug (optional)</label>
          <input id="slug" name="slug" defaultValue={product?.slug} placeholder="auto from name" className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls} htmlFor="price">Price (USD)</label>
          <input id="price" name="price" type="number" step="0.01" min="0" required defaultValue={price} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="compareAt">Compare-at (USD)</label>
          <input id="compareAt" name="compareAt" type="number" step="0.01" min="0" defaultValue={compareAt} placeholder="optional" className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="stock">Stock on hand</label>
          <input id="stock" name="stock" type="number" min="0" defaultValue={stock} className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="shortDescription">Short description</label>
        <input id="shortDescription" name="shortDescription" defaultValue={product?.shortDescription} className={inputCls} />
      </div>

      <div>
        <label className={labelCls} htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={3} defaultValue={product?.description} className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="colors">Colours — one per line: Name #hex</label>
          <textarea
            id="colors"
            name="colors"
            rows={3}
            defaultValue={product?.colors.map((c) => `${c.name} ${c.hex}`).join('\n')}
            placeholder={'Oat #d8cdb3\nMoss #6b6f4e'}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="details">Details — one per line</label>
          <textarea
            id="details"
            name="details"
            rows={3}
            defaultValue={product?.details.join('\n')}
            placeholder={'100% lambswool\nMade in Scotland'}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="sizes">Sizes — comma-separated</label>
          <input id="sizes" name="sizes" defaultValue={product?.sizes.join(', ')} placeholder="XS, S, M, L, XL" className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="badge">Badge (optional)</label>
          <input id="badge" name="badge" defaultValue={product?.badge} placeholder="New" className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="accent">Tile colour</label>
          <input id="accent" name="accent" type="color" defaultValue={product?.accent ?? '#6b6f4e'} className="h-10 w-full rounded-lg border border-line bg-white" />
        </div>
        <div>
          <label className={labelCls} htmlFor="image">Photo URL (optional)</label>
          <input id="image" name="image" defaultValue={product?.image} placeholder="https://…" className={inputCls} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={product?.featured} className="accent-ink" />
        Feature on the homepage
      </label>

      <div className="pt-2">
        <button className="rounded-lg bg-ink px-6 py-2.5 text-[13px] font-medium text-paper transition-colors hover:bg-clay">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
