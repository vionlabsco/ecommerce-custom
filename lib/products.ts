// ──────────────────────────────────────────────────────────────────────────
// Product catalog (demo data).
//
// This is the single source of truth for the storefront's inventory. To move
// to a database later (e.g. Supabase), keep these function signatures and swap
// the bodies for queries — the rest of the app only talks to the helpers below.
//
// Money is stored in integer CENTS to avoid floating-point rounding bugs.
// ──────────────────────────────────────────────────────────────────────────

export const CATEGORIES = [
  'Knitwear',
  'Shirting',
  'Outerwear',
  'Trousers',
  'Accessories',
] as const

export type Category = (typeof CATEGORIES)[number]

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
}

export const PRODUCTS: Product[] = [
  {
    id: 'p_garun_sweater',
    slug: 'garun-wool-sweater',
    name: 'Garún Wool Sweater',
    category: 'Knitwear',
    priceCents: 16800,
    shortDescription: 'A dense, lightly brushed lambswool sweater knit on old gauge machines.',
    description:
      'Knit in a small mill from a five-ply lambswool yarn, the Garún has the heft of a sweater you keep for a decade. The collar and cuffs are worked on a finer gauge so they hold their shape; the body is brushed once, by hand, for a softer surface that wears in rather than out.',
    details: [
      '100% lambswool, five-ply',
      'Ribbed collar, cuffs and hem',
      'Knit and finished in Scotland',
      'Cool wool wash, dry flat',
    ],
    colors: [
      { name: 'Oat', hex: '#d8cdb3' },
      { name: 'Moss', hex: '#6b6f4e' },
      { name: 'Rust', hex: '#a8482b' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    accent: '#6b6f4e',
    badge: 'New',
    featured: true,
    soldOut: ['Rust/XL', 'Rust/XS'],
    lowStock: ['Moss/S', 'Oat/XS'],
  },
  {
    id: 'p_lambswool_crew',
    slug: 'lambswool-crewneck',
    name: 'Lambswool Crewneck',
    category: 'Knitwear',
    priceCents: 12800,
    shortDescription: 'The everyday crew — fine-gauge, trim through the body, never scratchy.',
    description:
      'A fine-gauge crewneck that layers cleanly under a jacket and stands on its own over a shirt. The yarn is spun for softness first, so it skips the break-in period most wool asks of you.',
    details: [
      '100% lambswool, fine gauge',
      'Set-in sleeves for a trimmer line',
      'Reinforced shoulder seams',
      'Cool wool wash, dry flat',
    ],
    colors: [
      { name: 'Ecru', hex: '#e6ddc8' },
      { name: 'Charcoal', hex: '#3a3a38' },
      { name: 'Petrol', hex: '#2f4f54' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    accent: '#2f4f54',
    featured: true,
    lowStock: ['Petrol/L'],
  },
  {
    id: 'p_oxford_shirt',
    slug: 'everyday-oxford-shirt',
    name: 'Everyday Oxford Shirt',
    category: 'Shirting',
    priceCents: 9600,
    shortDescription: 'A washed oxford with just enough structure to look considered.',
    description:
      'Cut from a mid-weight oxford that has been garment-washed so it arrives soft and ready. A relaxed-but-not-boxy fit, a collar that sits well open or buttoned, and mother-of-pearl buttons that outlast the shirt.',
    details: [
      '100% organic cotton oxford',
      'Garment-washed for a lived-in hand',
      'Mother-of-pearl buttons',
      'Machine wash cold, hang dry',
    ],
    colors: [
      { name: 'White', hex: '#f3f1ea' },
      { name: 'Sky', hex: '#bcd0dc' },
      { name: 'Stone', hex: '#cdc4b0' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    accent: '#bcd0dc',
  },
  {
    id: 'p_camp_collar',
    slug: 'camp-collar-shirt',
    name: 'Camp-Collar Shirt',
    category: 'Shirting',
    priceCents: 11200,
    shortDescription: 'A breezy, open-collar shirt in a slubby cotton-linen.',
    description:
      'An open, notched collar and a straight hem made to wear untucked. The cotton-linen cloth is loosely woven so it moves air on warm days and softens with every wash.',
    details: [
      '55% linen, 45% cotton',
      'Camp collar, single chest pocket',
      'Corozo nut buttons',
      'Machine wash cold, line dry',
    ],
    colors: [
      { name: 'Sand', hex: '#d9c9a8' },
      { name: 'Sage', hex: '#9aa284' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    accent: '#9aa284',
    soldOut: ['Sage/XS'],
  },
  {
    id: 'p_chore_jacket',
    slug: 'waxed-chore-jacket',
    name: 'Waxed Chore Jacket',
    category: 'Outerwear',
    priceCents: 24500,
    compareAtCents: 29000,
    shortDescription: 'A three-pocket chore coat in a dry, British-milled wax cotton.',
    description:
      'Built from a dry-finish waxed cotton that weathers to its own patina. Three patch pockets, a corduroy-lined collar, and a cut roomy enough for a sweater underneath. Re-wax it in a few years and start again.',
    details: [
      'Dry-finish waxed cotton, British-milled',
      'Corduroy under-collar',
      'Three patch pockets, two interior',
      'Spot clean; re-wax as needed',
    ],
    colors: [
      { name: 'Field Tan', hex: '#9c7b4e' },
      { name: 'Black Olive', hex: '#3f3f33' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    accent: '#8a6d44',
    badge: 'Last few',
    featured: true,
    soldOut: ['Field Tan/XS', 'Field Tan/S', 'Black Olive/XS'],
    lowStock: ['Black Olive/M', 'Black Olive/L', 'Field Tan/L'],
  },
  {
    id: 'p_wide_trouser',
    slug: 'pleated-wide-trouser',
    name: 'Pleated Wide Trouser',
    category: 'Trousers',
    priceCents: 13800,
    shortDescription: 'A single-pleat trouser with a clean, generous leg.',
    description:
      'A single forward pleat gives room through the thigh before falling to a wide, even leg. Cut from a mid-weight cotton twill with a touch of recovery so the crease holds and the knees do not bag.',
    details: [
      '98% cotton, 2% elastane twill',
      'Single forward pleat, side adjusters',
      'Hidden hook-and-bar closure',
      'Machine wash cold, hang dry',
    ],
    colors: [
      { name: 'Stone', hex: '#cabfa6' },
      { name: 'Navy', hex: '#2c3347' },
      { name: 'Black', hex: '#26241f' },
    ],
    sizes: ['28', '30', '32', '34', '36'],
    accent: '#2c3347',
    lowStock: ['Navy/30'],
  },
  {
    id: 'p_canvas_tote',
    slug: 'canvas-weekend-tote',
    name: 'Canvas Weekend Tote',
    category: 'Accessories',
    priceCents: 7800,
    shortDescription: 'An overbuilt 18oz canvas tote that flattens nothing and carries everything.',
    description:
      'Cut from an 18oz cotton canvas with bridle-leather handles and a riveted base. It starts stiff and earns its slouch. Big enough for a market run or a long weekend.',
    details: [
      '18oz cotton canvas',
      'Vegetable-tanned leather handles',
      'Riveted, boxed base',
      'Interior slip pocket',
    ],
    colors: [
      { name: 'Natural', hex: '#ddd2b6' },
      { name: 'Slate', hex: '#5a6066' },
    ],
    sizes: ['One Size'],
    accent: '#a98c52',
    featured: true,
  },
  {
    id: 'p_wool_beanie',
    slug: 'ribbed-wool-beanie',
    name: 'Ribbed Wool Beanie',
    category: 'Accessories',
    priceCents: 4200,
    shortDescription: 'A close-knit merino beanie with a short, clean turn-back.',
    description:
      'A fine 2x2 rib in soft merino that sits close without itch. The cuff is short and unfussy — no logo, no slouch, just a good hat.',
    details: [
      '100% extra-fine merino wool',
      '2x2 rib, short turn-back cuff',
      'One size, generous stretch',
      'Hand wash cold, dry flat',
    ],
    colors: [
      { name: 'Oat', hex: '#d8cdb3' },
      { name: 'Moss', hex: '#6b6f4e' },
      { name: 'Rust', hex: '#a8482b' },
      { name: 'Charcoal', hex: '#3a3a38' },
    ],
    sizes: ['One Size'],
    accent: '#a8482b',
    badge: 'New',
    lowStock: ['Rust/One Size'],
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────
// Swap these bodies for DB queries later; signatures stay the same.

export function getAllProducts(): Product[] {
  return PRODUCTS
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug)
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((p) => p.featured)
}

export function getProductsByCategory(category: Category): Product[] {
  return PRODUCTS.filter((p) => p.category === category)
}

export function getRelatedProducts(product: Product, limit = 3): Product[] {
  return PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category,
  )
    .concat(PRODUCTS.filter((p) => p.id !== product.id && p.category !== product.category))
    .slice(0, limit)
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
