import Link from 'next/link'
import type { Metadata } from 'next'
import { ProductForm } from '@/components/admin/ProductForm'
import { createProductAction } from '@/lib/admin/product-actions'
import { getCategories } from '@/lib/products'

export const metadata: Metadata = { title: 'New product' }

export default async function NewProductPage() {
  const categories = await getCategories()
  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="text-[13px] text-ink-soft hover:text-clay">
        ← Products
      </Link>
      <h1 className="font-display text-3xl">New product</h1>
      <ProductForm action={createProductAction} categories={categories} submitLabel="Create product" />
    </div>
  )
}
