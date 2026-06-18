// ──────────────────────────────────────────────────────────────────────────
// Product catalog (demo data).
//
// This is the single source of truth for the storefront's inventory. To move
// to a database later (e.g. Supabase), keep these function signatures and swap
// the bodies for queries — the rest of the app only talks to the helpers below.
//
// Money is stored in integer CENTS to avoid floating-point rounding bugs.
// ──────────────────────────────────────────────────────────────────────────

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

export const CATEGORIES = ['Glass', 'Cloth'] as const

export type Category = string

export type ColorOption = {
  name: string
  /** Swatch colour shown in the UI. */
  hex: string
}

export type Product = {
  id: string
  slug: string
  name: string
  category: Category
  priceCents: number
  /** If set and higher than priceCents, the item renders as on sale. */
  compareAtCents?: number
  shortDescription: string
  description: string
  details: string[]
  colors: ColorOption[]
  sizes: string[]
  /** Base colour for the art-directed product tile (used when no photo is set). */
  accent: string
  /**
   * Optional real product photo. Drop a URL here (e.g. an images.unsplash.com
   * link, already allow-listed in next.config.mjs) and it replaces the tile.
   */
  image?: string
  badge?: string
  featured?: boolean
  /** Variants with zero stock, keyed `${colorName}/${size}`. */
  soldOut?: string[]
  /** Variants that are nearly gone ("Only a few left"), keyed `${colorName}/${size}`. */
  lowStock?: string[]
  /** On-hand count (per product, not per variant). Drives the admin Products table. */
  stock?: number
}

export const PRODUCTS: Product[] = [
  {
    id: 'p_glass_pad',
    slug: 'glass-mouse-pad',
    name: 'Glass Mouse Pad',
    category: 'Glass',
    priceCents: 3900,
    shortDescription: 'A tempered-glass pad with a micro-etched surface for fast, precise tracking.',
    description:
      'A 5mm tempered-glass surface, micro-etched for a smooth-but-controlled glide that high-DPI sensors love. The underside is a full sheet of anti-slip silicone, so it stays put through fast flicks, and the polished edges are easy on your wrist. Wipes clean in seconds.',
    details: [
      '5mm tempered glass, micro-etched surface',
      'Full anti-slip silicone base',
      'Rounded, polished edges',
      'Wipe clean with a damp cloth',
    ],
    colors: [
      { name: 'Black', hex: '#1c1c1c' },
      { name: 'White', hex: '#ececec' },
    ],
    sizes: ['Square', 'Rectangle'],
    accent: '#5b6b73',
    badge: 'New',
    featured: true,
    stock: 40,
  },
  {
    id: 'p_cloth_pad',
    slug: 'cloth-mouse-pad',
    name: 'Cloth Mouse Pad',
    category: 'Cloth',
    priceCents: 1900,
    shortDescription: 'A stitched-edge cloth pad with a smooth, low-friction weave.',
    description:
      'A fine micro-weave cloth top over a dense foam core — smooth enough for speed, with just enough texture for control. Stitched, anti-fray edges keep it tidy for years, and the natural-rubber base grips any desk.',
    details: [
      'Micro-weave cloth surface',
      'Stitched anti-fray edges',
      'Non-slip natural rubber base',
      'Machine washable, air dry',
    ],
    colors: [
      { name: 'Black', hex: '#1c1c1c' },
      { name: 'Grey', hex: '#6b6b6b' },
      { name: 'Navy', hex: '#2c3347' },
    ],
    sizes: ['Square', 'Rectangle'],
    accent: '#2c2c2c',
    featured: true,
    stock: 75,
  },
]

// ── Data access (dual-mode: Supabase when configured, else in-memory demo) ──
// In demo mode the catalog lives on globalThis so a product added in the admin
// is visible to the storefront within the same server process. In live mode it
// all lives in Supabase. The pure helpers further down operate on a Product
// object, not the data source, so they stay synchronous.

const _catalog = ((globalThis as any).__mw_catalog ??= {
  products: PRODUCTS.map((p) => ({ ...p })),
  categories: [...CATEGORIES] as string[],
})

function rowToProduct(r: any): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    priceCents: r.price_cents,
    compareAtCents: r.compare_at_cents ?? undefined,
    shortDescription: r.short_description ?? '',
    description: r.description ?? '',
    details: r.details ?? [],
    colors: r.colors ?? [],
    sizes: r.sizes ?? [],
    accent: r.accent ?? '#6b6f4e',
    image: r.image ?? undefined,
    badge: r.badge ?? undefined,
    featured: r.featured ?? false,
    soldOut: r.sold_out ?? [],
    lowStock: r.low_stock ?? [],
    stock: typeof r.stock === 'number' ? r.stock : 0,
  }
}

function productToRow(p: Product) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    price_cents: p.priceCents,
    compare_at_cents: p.compareAtCents ?? null,
    short_description: p.shortDescription,
    description: p.description,
    details: p.details,
    colors: p.colors,
    sizes: p.sizes,
    accent: p.accent,
    image: p.image ?? null,
    badge: p.badge ?? null,
    featured: p.featured ?? false,
    sold_out: p.soldOut ?? [],
    low_stock: p.lowStock ?? [],
    stock: p.stock ?? 0,
  }
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function getAllProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data ?? []).map(rowToProduct)
  }
  return _catalog.products
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle()
    if (error) throw error
    return data ? rowToProduct(data) : undefined
  }
  return _catalog.products.find((p: Product) => p.slug === slug)
}

export async function getProductById(id: string): Promise<Product | undefined> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? rowToProduct(data) : undefined
  }
  return _catalog.products.find((p: Product) => p.id === id)
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return (await getAllProducts()).filter((p) => p.featured)
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return (await getAllProducts()).filter((p) => p.category === category)
}

export async function getRelatedProducts(product: Product, limit = 3): Promise<Product[]> {
  const all = await getAllProducts()
  return all
    .filter((p) => p.id !== product.id && p.category === product.category)
    .concat(all.filter((p) => p.id !== product.id && p.category !== product.category))
    .slice(0, limit)
}

export async function getCategories(): Promise<string[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .order('position', { ascending: true })
    if (error) throw error
    return (data ?? []).map((r: any) => r.name as string)
  }
  return _catalog.categories
}

// ── Mutations (admin Products & Categories manager) ──
export type ProductDraft = Omit<Product, 'id'>

export async function createProduct(draft: ProductDraft): Promise<Product> {
  const seq = Math.floor(100000 + Math.random() * 900000)
  const slug = (draft.slug && draft.slug.trim()) || slugify(draft.name) || `product-${seq}`
  const product: Product = { ...draft, id: `p_${seq}`, slug }
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('products').insert(productToRow(product))
    if (error) throw error
  } else {
    _catalog.products.push(product)
  }
  return product
}

export async function updateProduct(id: string, draft: ProductDraft): Promise<void> {
  const product: Product = { ...draft, id }
  if (isSupabaseConfigured && supabase) {
    const { id: _omit, ...rest } = productToRow(product)
    const { error } = await supabase.from('products').update(rest).eq('id', id)
    if (error) throw error
  } else {
    const i = _catalog.products.findIndex((p: Product) => p.id === id)
    if (i >= 0) _catalog.products[i] = product
  }
}

export async function setProductStock(id: string, stock: number): Promise<void> {
  const clean = Math.max(0, Math.floor(stock))
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('products').update({ stock: clean }).eq('id', id)
    if (error) throw error
  } else {
    const p = _catalog.products.find((x: Product) => x.id === id)
    if (p) p.stock = clean
  }
}

export async function deleteProduct(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  } else {
    const i = _catalog.products.findIndex((p: Product) => p.id === id)
    if (i >= 0) _catalog.products.splice(i, 1)
  }
}

export async function createCategory(name: string): Promise<void> {
  const clean = name.trim()
  if (!clean) return
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('categories').insert({ id: slugify(clean), name: clean })
    if (error) throw error
  } else if (!_catalog.categories.includes(clean)) {
    _catalog.categories.push(clean)
  }
}

export async function deleteCategory(name: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('categories').delete().eq('name', name)
    if (error) throw error
  } else {
    _catalog.categories = _catalog.categories.filter((c: string) => c !== name)
  }
}

export type VariantState = 'in-stock' | 'low-stock' | 'sold-out'

/** Resolve the stock state of a specific colour/size combination. */
export function getVariantState(
  product: Product,
  color: string,
  size: string,
): VariantState {
  const key = `${color}/${size}`
  if (product.soldOut?.includes(key)) return 'sold-out'
  if (product.lowStock?.includes(key)) return 'low-stock'
  return 'in-stock'
}

/** True if a product has at least one buyable variant. */
export function isProductAvailable(product: Product): boolean {
  for (const color of product.colors) {
    for (const size of product.sizes) {
      if (getVariantState(product, color.name, size) !== 'sold-out') return true
    }
  }
  return false
}
