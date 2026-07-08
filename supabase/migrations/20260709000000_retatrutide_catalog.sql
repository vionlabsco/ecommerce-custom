-- Reset the catalog to Vion Labs' single-product line: Retatrutide Sublingual.
--
-- Wipes the previous mousepad / supplement-placeholder products and categories
-- then inserts the retatrutide product row that lib/products.ts already
-- references. Safe to re-run — every statement is idempotent.
--
-- Apply via: Supabase Dashboard → SQL Editor → paste + Run
-- Or via CLI: `supabase db push` (once you're linked to the project)

begin;

-- 1. Clear anything that references product rows first — the FK-clean order is
--    back-in-stock signups → wishlists → products (we don't have hard FKs by
--    default, but if you added them later, this order still works).
delete from back_in_stock_signups where product_id is not null;
delete from products;
delete from categories;

-- 2. Reseed the category the app expects.
insert into categories (id, name, position) values
  ('sublingual', 'Sublingual', 0)
on conflict (id) do nothing;

-- 3. Insert the Retatrutide Sublingual product. Prices in cents.
--    `accent` matches the brand's Abyss Navy for the product tile fallback.
insert into products (
  id,
  slug,
  name,
  category,
  price_cents,
  short_description,
  description,
  details,
  colors,
  sizes,
  accent,
  image,
  badge,
  featured,
  sold_out,
  low_stock,
  stock
) values (
  'p_retatrutide_sublingual',
  'retatrutide-sublingual',
  'Retatrutide Sublingual',
  'Sublingual',
  29900,
  'The first non-invasive sublingual retatrutide — a triple-agonist peptide delivered under the tongue. No needles.',
  'A proprietary sublingual formulation of retatrutide, the next-generation triple-agonist peptide (GIP · GLP-1 · Glucagon) engineered for weight and metabolic support. Delivered under the tongue via our SNEDDS nanoemulsion platform, the peptide is protected from enzymatic degradation and rapidly absorbed through the sublingual mucosa — bypassing the stomach, first-pass metabolism, and the need for injection. Pharmaceutical-grade excipients, non-irritating, designed for daily at-home use.',
  '[
    "6 mg retatrutide per dose (2.5 mg per spray)",
    "Triple-agonist peptide — GIP, GLP-1, and Glucagon receptors",
    "Sublingual SNEDDS nanoemulsion platform — no injection required",
    "Pharmaceutical-grade excipients (FDA IID-listed)",
    "Non-irritating, designed for repeated sublingual administration",
    "30 mL amber glass bottle · 30-day supply at standard dosing"
  ]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '#0b1f3a',
  '/product/retatrutide-hero.png',
  'New',
  true,
  '[]'::jsonb,
  '[]'::jsonb,
  100
)
on conflict (id) do update set
  slug              = excluded.slug,
  name              = excluded.name,
  category          = excluded.category,
  price_cents       = excluded.price_cents,
  short_description = excluded.short_description,
  description       = excluded.description,
  details           = excluded.details,
  colors            = excluded.colors,
  sizes             = excluded.sizes,
  accent            = excluded.accent,
  image             = excluded.image,
  badge             = excluded.badge,
  featured          = excluded.featured,
  sold_out          = excluded.sold_out,
  low_stock         = excluded.low_stock,
  stock             = excluded.stock;

commit;
