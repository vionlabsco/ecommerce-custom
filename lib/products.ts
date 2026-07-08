// ──────────────────────────────────────────────────────────────────────────
// Product catalog (demo data).
//
// This is the single source of truth for the storefront's inventory. To move
// to a database later (e.g. Supabase), keep these function signatures and swap
// the bodies for queries — the rest of the app only talks to the helpers below.
//
// Money is stored in integer CENTS to avoid floating-point rounding bugs.
// ──────────────────────────────────────────────────────────────────────────

import { randomBytes } from 'crypto'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

function id(): string {
  return randomBytes(6).toString('hex')
}

export const CATEGORIES = [
  'Sleep',
  'Focus',
  'Immunity',
  'Energy',
  'Recovery',
  'Daily',
] as const

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

// Placeholder catalog. Names, copy, prices, flavors, and pack sizes are all
// intentionally generic — replace via the admin (or edit here) once the client
// finalises the line. Blue-family `accent` hexes let the monogram tiles read
// as one coherent range in the store grid.
export const PRODUCTS: Product[] = [
  {
    id: 'p_sleep_formula',
    slug: 'sleep-formula',
    name: 'Sleep Formula',
    category: 'Sleep',
    priceCents: 3400,
    shortDescription: 'A nightly micro-gummy for falling asleep — and staying there.',
    description:
      'A dialed sleep blend designed to shorten how long it takes to drift off and stabilise the second half of the night. Non-habit-forming, no morning grog. Take two, twenty minutes before bed.',
    details: [
      'Two-gummy dose, 20 min before bed',
      'Non-habit-forming — no morning grog',
      '30 nights per bottle',
      'Third-party tested, every batch',
    ],
    colors: [],
    sizes: [],
    accent: '#1e3a8a',
    badge: 'Bestseller',
    featured: true,
    stock: 60,
  },
  {
    id: 'p_focus_blend',
    slug: 'focus-blend',
    name: 'Focus Blend',
    category: 'Focus',
    priceCents: 3200,
    shortDescription: 'Clean, jitter-free clarity — for the work you actually mean to do.',
    description:
      'A stack of nootropic actives that sharpens attention without the coffee spike-and-crash. Formulated for two-to-three-hour cognitive blocks. One micro-tab in the morning, one after lunch if you need it.',
    details: [
      'No caffeine, no jitters',
      'Onset in 30–45 minutes',
      '60 micro-tabs per bottle',
      'Third-party tested, every batch',
    ],
    colors: [],
    sizes: [],
    accent: '#3b5bdb',
    featured: true,
    stock: 48,
  },
  {
    id: 'p_immunity_daily',
    slug: 'immunity-daily',
    name: 'Immunity Daily',
    category: 'Immunity',
    priceCents: 2800,
    shortDescription: 'Baseline defence, one gummy a day. For the sniffle you’d rather skip.',
    description:
      'A daily immune-support gummy stacking the vitamins, minerals, and botanicals your body actually uses to keep the baseline strong. Not a cure — a floor. Take one with breakfast.',
    details: [
      'One-a-day, easy to remember',
      'Real doses, no proprietary blends',
      '60 gummies per bottle',
      'Third-party tested, every batch',
    ],
    colors: [],
    sizes: [],
    accent: '#4c9aff',
    featured: true,
    stock: 80,
  },
  {
    id: 'p_energy_ramp',
    slug: 'energy-ramp',
    name: 'Energy Ramp',
    category: 'Energy',
    priceCents: 3000,
    shortDescription: 'Sustained energy that ramps up, holds, and doesn’t crash.',
    description:
      'Slow-release energy without the caffeine cliff. A blend of adaptogens, B-complex, and paced caffeine that gets you to 3pm without the shakes. One tab in the morning.',
    details: [
      'Slow-release, no crash',
      'Low-dose caffeine (60mg) + adaptogens',
      '30 tabs per bottle',
      'Third-party tested, every batch',
    ],
    colors: [],
    sizes: [],
    accent: '#2563eb',
    featured: true,
    stock: 55,
  },
  {
    id: 'p_recovery_complex',
    slug: 'recovery-complex',
    name: 'Recovery Complex',
    category: 'Recovery',
    priceCents: 3600,
    shortDescription: 'For the day after. Muscle, joint, and inflammation support in one dose.',
    description:
      'A post-effort recovery capsule stacking anti-inflammatories, magnesium, and joint-support amino acids. Take two in the evening on training days. Two capsules per dose.',
    details: [
      'Two capsules, evening of training',
      'Magnesium + curcumin + collagen peptides',
      '60 capsules per bottle',
      'Third-party tested, every batch',
    ],
    colors: [],
    sizes: [],
    accent: '#5b8fd9',
    stock: 42,
  },
  {
    id: 'p_daily_baseline',
    slug: 'daily-baseline',
    name: 'Daily Baseline',
    category: 'Daily',
    priceCents: 4200,
    shortDescription: 'The essentials your diet keeps missing — in one honest dose.',
    description:
      'A daily multivitamin built to fill the gaps most modern diets leave behind. Real doses of vitamin D, B-complex, magnesium, and omega-3. Two capsules with your first meal.',
    details: [
      'Two capsules with breakfast',
      'Fills real gaps, not marketing gaps',
      '60 capsules per bottle',
      'Third-party tested, every batch',
    ],
    colors: [],
    sizes: [],
    accent: '#3e5c76',
    featured: true,
    stock: 90,
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

/** Simple substring search across name + shortDescription + description +
 *  category. Case-insensitive. Good enough for a small catalogue; swap for
 *  Postgres full-text or Algolia once the catalogue grows past ~50 SKUs. */
export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const all = await getAllProducts()
  return all.filter((p) => {
    const hay = [
      p.name,
      p.shortDescription ?? '',
      p.description ?? '',
      p.category,
      ...(p.colors ?? []).map((c) => c.name),
    ]
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
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
  const newId = id()
  const slug = (draft.slug && draft.slug.trim()) || slugify(draft.name) || `product-${newId}`
  const product: Product = { ...draft, id: `p_${newId}`, slug }
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

/** True if a product has at least one buyable variant.
 *  Single-variant products (no colours + no sizes) fall back to the product's
 *  own `stock` count — otherwise every variant-less SKU would look sold out. */
export function isProductAvailable(product: Product): boolean {
  const hasVariants =
    (product.colors?.length ?? 0) > 0 || (product.sizes?.length ?? 0) > 0
  if (!hasVariants) return (product.stock ?? 0) > 0
  for (const color of product.colors) {
    for (const size of product.sizes) {
      if (getVariantState(product, color.name, size) !== 'sold-out') return true
    }
  }
  return false
}
