'use server'

// Server actions for the Products & Categories manager. Each parses the form,
// writes through the catalog data layer (Supabase when configured, else demo),
// revalidates the affected pages, and redirects back to the list.

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  deleteCategory,
  type ProductDraft,
} from '@/lib/products'
import { setStock } from '@/lib/admin/store'

function dollarsToCents(v: FormDataEntryValue | null): number {
  const n = parseFloat(String(v ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? Math.round(n * 100) : 0
}

function parseColors(v: FormDataEntryValue | null): { name: string; hex: string }[] {
  return String(v ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(.*?)[\s|]+(#[0-9a-fA-F]{3,8})\s*$/)
      return m ? { name: m[1].trim(), hex: m[2] } : { name: line, hex: '#cccccc' }
    })
}

function parseList(v: FormDataEntryValue | null, sep: string): string[] {
  return String(v ?? '')
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean)
}

function draftFromForm(fd: FormData): ProductDraft {
  const compareRaw = String(fd.get('compareAt') ?? '').trim()
  return {
    slug: String(fd.get('slug') ?? '').trim(),
    name: String(fd.get('name') ?? '').trim(),
    category: String(fd.get('category') ?? '').trim() || 'Uncategorised',
    priceCents: dollarsToCents(fd.get('price')),
    compareAtCents: compareRaw ? dollarsToCents(compareRaw) : undefined,
    shortDescription: String(fd.get('shortDescription') ?? '').trim(),
    description: String(fd.get('description') ?? '').trim(),
    details: parseList(fd.get('details'), '\n'),
    colors: parseColors(fd.get('colors')),
    sizes: parseList(fd.get('sizes'), ','),
    accent: String(fd.get('accent') ?? '').trim() || '#6b6f4e',
    image: String(fd.get('image') ?? '').trim() || undefined,
    badge: String(fd.get('badge') ?? '').trim() || undefined,
    featured: fd.get('featured') === 'on',
    soldOut: [],
    lowStock: [],
  }
}

function revalidateCatalog() {
  revalidatePath('/admin/products')
  revalidatePath('/shop')
  revalidatePath('/')
}

export async function createProductAction(fd: FormData) {
  const draft = draftFromForm(fd)
  if (draft.category) await createCategory(draft.category) // ensure the category exists
  const product = await createProduct(draft)
  setStock(product.id, parseInt(String(fd.get('stock') ?? '0'), 10) || 0)
  revalidateCatalog()
  redirect('/admin/products')
}

export async function updateProductAction(fd: FormData) {
  const id = String(fd.get('id') ?? '')
  const draft = draftFromForm(fd)
  if (draft.category) await createCategory(draft.category)
  await updateProduct(id, draft)
  setStock(id, parseInt(String(fd.get('stock') ?? '0'), 10) || 0)
  revalidateCatalog()
  redirect('/admin/products')
}

export async function deleteProductAction(fd: FormData) {
  await deleteProduct(String(fd.get('id') ?? ''))
  revalidateCatalog()
  redirect('/admin/products')
}

export async function createCategoryAction(fd: FormData) {
  await createCategory(String(fd.get('name') ?? ''))
  revalidatePath('/admin/products/categories')
  revalidatePath('/shop')
  revalidatePath('/')
}

export async function deleteCategoryAction(fd: FormData) {
  await deleteCategory(String(fd.get('name') ?? ''))
  revalidatePath('/admin/products/categories')
  revalidatePath('/shop')
  revalidatePath('/')
}
