import type { Product } from '@/lib/products'

const labelCls = 'mb-1.5 block text-[13px] font-medium text-gray-700'
const inputCls =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100'
const helpCls = 'mt-1 text-[12px] text-gray-500'

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-[14px] font-semibold text-gray-900">{title}</h2>
      {description && <p className="mt-0.5 text-[12px] text-gray-500">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  )
}

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
    <form action={action} className="max-w-3xl space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}
      {product?.image && <input type="hidden" name="existingImage" value={product.image} />}

      {/* Title & description */}
      <Section title="Title and description">
        <div>
          <label className={labelCls} htmlFor="name">Title</label>
          <input
            id="name"
            name="name"
            required
            defaultValue={product?.name}
            placeholder="Glass Mouse Pad"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="shortDescription">Short description</label>
          <input
            id="shortDescription"
            name="shortDescription"
            defaultValue={product?.shortDescription}
            placeholder="One-sentence sell line shown in cards"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product?.description}
            placeholder="Long-form copy shown on the product page"
            className={inputCls}
          />
        </div>
      </Section>

      {/* Media */}
      <Section
        title="Media"
        description="Upload an image or paste a URL. PNG, JPG, WebP up to 5 MB."
      >
        {product?.image && (
          <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-2">
            <img
              src={product.image}
              alt="Current"
              className="h-16 w-16 rounded-md object-cover ring-1 ring-gray-200"
            />
            <div>
              <p className="text-[13px] font-medium text-gray-700">Current image</p>
              <p className="text-[12px] text-gray-500">Upload a new file below to replace it.</p>
            </div>
          </div>
        )}

        <div>
          <label className={labelCls} htmlFor="imageFile">Upload image</label>
          <input
            id="imageFile"
            name="imageFile"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="block w-full text-sm text-gray-700 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-[13px] file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
          />
          <p className={helpCls}>Stored in your Supabase bucket — served via a public URL.</p>
        </div>

        <div>
          <label className={labelCls} htmlFor="image">Or paste an image URL</label>
          <input
            id="image"
            name="image"
            type="url"
            defaultValue={product?.image}
            placeholder="https://…"
            className={inputCls}
          />
        </div>
      </Section>

      {/* Pricing */}
      <Section title="Pricing">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="price">Price (USD)</label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={price}
              placeholder="39.00"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="compareAt">Compare-at price</label>
            <input
              id="compareAt"
              name="compareAt"
              type="number"
              step="0.01"
              min="0"
              defaultValue={compareAt}
              placeholder="49.00 (optional)"
              className={inputCls}
            />
            <p className={helpCls}>Shows a strike-through when higher than the price.</p>
          </div>
        </div>
      </Section>

      {/* Inventory */}
      <Section title="Inventory">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="stock">Stock on hand</label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              defaultValue={stock}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="slug">URL slug (optional)</label>
            <input
              id="slug"
              name="slug"
              defaultValue={product?.slug}
              placeholder="auto-generated from title"
              className={inputCls}
            />
          </div>
        </div>
      </Section>

      {/* Variants */}
      <Section title="Variants" description="Optional. Leave blank if the product has no choices.">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="colors">Colours</label>
            <textarea
              id="colors"
              name="colors"
              rows={3}
              defaultValue={product?.colors.map((c) => `${c.name} ${c.hex}`).join('\n')}
              placeholder={'Black #1c1c1c\nWhite #ececec'}
              className={inputCls + ' font-mono'}
            />
            <p className={helpCls}>One per line: <code className="rounded bg-gray-100 px-1 py-0.5">Name #hex</code>.</p>
          </div>
          <div>
            <label className={labelCls} htmlFor="sizes">Sizes</label>
            <input
              id="sizes"
              name="sizes"
              defaultValue={product?.sizes.join(', ')}
              placeholder="Square, Rectangle"
              className={inputCls}
            />
            <p className={helpCls}>Comma-separated.</p>
          </div>
        </div>
      </Section>

      {/* Details + organization */}
      <Section title="Details & organization">
        <div>
          <label className={labelCls} htmlFor="details">Product details</label>
          <textarea
            id="details"
            name="details"
            rows={3}
            defaultValue={product?.details.join('\n')}
            placeholder={'5mm tempered glass\nFull anti-slip silicone base'}
            className={inputCls}
          />
          <p className={helpCls}>One detail per line — shown as a bullet list on the product page.</p>
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
              placeholder="Glass"
              className={inputCls}
            />
            <datalist id="cats">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label className={labelCls} htmlFor="badge">Badge</label>
            <input
              id="badge"
              name="badge"
              defaultValue={product?.badge}
              placeholder="New, Sale, etc. (optional)"
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-[160px_1fr] items-end gap-4">
          <div>
            <label className={labelCls} htmlFor="accent">Tile colour</label>
            <input
              id="accent"
              name="accent"
              type="color"
              defaultValue={product?.accent ?? '#6b6f4e'}
              className="h-10 w-full cursor-pointer rounded-md border border-gray-300 bg-white"
            />
            <p className={helpCls}>Used when no image is set.</p>
          </div>
          <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product?.featured}
              className="h-4 w-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-500"
            />
            Feature on the homepage
          </label>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="submit"
          className="rounded-md bg-emerald-700 px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-emerald-800"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
