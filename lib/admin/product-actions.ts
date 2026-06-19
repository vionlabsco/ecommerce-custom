'use server'

// Server actions for the Products & Categories manager. Each parses the form,
// optionally uploads an image to Supabase Storage, writes through the catalog
// data layer (Supabase when configured, else demo), revalidates affected pages,
// and redirects back to the list.

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/admin'
import {
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  deleteCategory,
  type ProductDraft,
} from '@/lib/products'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

// Server-side length caps on every free-text field. Front-end can ignore.
const LIMIT = {
  short: 120,
  medium: 280,
  long: 5000,
  slug: 100,
  hex: 9,
}
function clip(v: FormDataEntryValue | null, max: number): string {
  return String(v ?? '').trim().slice(0, max)
}

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

/** Upload a single image to the `product-images` Supabase bucket and return
 *  its public URL. Returns null if the file is empty or upload fails. */
async function uploadImage(file: File | null): Promise<string | null> {
  if (!file || !(file instanceof File) || file.size === 0) return null
  if (!isSupabaseConfigured || !supabase) return null
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`
  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { contentType: file.type, upsert: false })
  if (error) {
    console.error('Image upload failed:', error.message)
    return null
  }
  const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
  return data.publicUrl
}

async function draftFromForm(
  fd: FormData,
  existingImage?: string,
): Promise<ProductDraft> {
  const compareRaw = String(fd.get('compareAt') ?? '').trim()

  // Image priority:
  //   1. New file uploaded → upload to Storage, use returned URL
  //   2. URL pasted in the text input → use that
  //   3. Existing product image → preserve
  const imageFile = fd.get('imageFile') as File | null
  const imageUrl = String(fd.get('image') ?? '').trim()
  let finalImage: string | undefined = existingImage
  if (imageUrl) finalImage = imageUrl
  const uploaded = await uploadImage(imageFile)
  if (uploaded) finalImage = uploaded

  return {
    slug: clip(fd.get('slug'), LIMIT.slug),
    name: clip(fd.get('name'), LIMIT.short),
    category: clip(fd.get('category'), LIMIT.short) || 'Uncategorised',
    priceCents: Math.min(dollarsToCents(fd.get('price')), 100_000_000), // $1,000,000 cap
    compareAtCents: compareRaw
      ? Math.min(dollarsToCents(compareRaw), 100_000_000)
      : undefined,
    shortDescription: clip(fd.get('shortDescription'), LIMIT.medium),
    description: clip(fd.get('description'), LIMIT.long),
    details: parseList(fd.get('details'), '\n').slice(0, 20).map((s) => s.slice(0, 200)),
    colors: parseColors(fd.get('colors')).slice(0, 24),
    sizes: parseList(fd.get('sizes'), ',').slice(0, 24).map((s) => s.slice(0, 40)),
    accent: clip(fd.get('accent'), LIMIT.hex) || '#6b6f4e',
    image: finalImage || undefined,
    badge: clip(fd.get('badge'), 32) || undefined,
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
  requireAdmin()
  const draft = await draftFromForm(fd)
  if (draft.category) await createCategory(draft.category)
  const stock = Math.min(Math.max(0, parseInt(String(fd.get('stock') ?? '0'), 10) || 0), 999_999)
  await createProduct({ ...draft, stock })
  revalidateCatalog()
  redirect('/admin/products')
}

export async function updateProductAction(fd: FormData) {
  requireAdmin()
  const id = clip(fd.get('id'), 64)
  const existingImage = clip(fd.get('existingImage'), 2000) || undefined
  const draft = await draftFromForm(fd, existingImage)
  if (draft.category) await createCategory(draft.category)
  const stock = Math.min(Math.max(0, parseInt(String(fd.get('stock') ?? '0'), 10) || 0), 999_999)
  await updateProduct(id, { ...draft, stock })
  revalidateCatalog()
  redirect('/admin/products')
}

export async function deleteProductAction(fd: FormData) {
  requireAdmin()
  await deleteProduct(clip(fd.get('id'), 64))
  revalidateCatalog()
  redirect('/admin/products')
}

export async function createCategoryAction(fd: FormData) {
  requireAdmin()
  await createCategory(clip(fd.get('name'), LIMIT.short))
  revalidatePath('/admin/products/categories')
  revalidatePath('/shop')
  revalidatePath('/')
}

export async function deleteCategoryAction(fd: FormData) {
  requireAdmin()
  await deleteCategory(clip(fd.get('name'), LIMIT.short))
  revalidatePath('/admin/products/categories')
  revalidatePath('/shop')
  revalidatePath('/')
}
