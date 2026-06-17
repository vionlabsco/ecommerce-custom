import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductForm } from '@/components/admin/ProductForm'
import { updateProductAction } from '@/lib/admin/product-actions'
import { getProductById, getCategories } from '@/lib/products'
import { getInventory } from '@/lib/admin/store'

export const metadata: Metadata = { title: 'Edit product' }

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id)
  if (!product) notFound()

  const categories = await getCategories()
  const inv = (await getInventory()).find((i) => i.id === product.id)

  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="text-[13px] text-ink-soft hover:text-clay">
        ← Products
      </Link>
      <h1 className="font-display text-3xl">{product.name}</h1>
      <ProductForm
        action={updateProductAction}
        product={product}
        categories={categories}
        stock={inv?.stock ?? 0}
        submitLabel="Save changes"
      />
    </div>
  )
}
