-- ──────────────────────────────────────────────────────────────────────────
-- Marlowe — database schema
--
-- Run this once in your Supabase project (SQL Editor → paste → Run). It creates
-- the orders table the storefront writes to and the admin reads from. Nested
-- data (items, address, fulfilment, timeline) is stored as JSONB to keep the
-- mapping 1:1 with the app's Order type.
--
-- Orders are intentionally NOT seeded — in a live store they accumulate from
-- real checkouts. (Run the app without Supabase configured to see sample data.)
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists orders (
  id               text primary key,
  number           text not null unique,
  placed_at        timestamptz not null default now(),
  customer         jsonb not null,                    -- { name, email }
  items            jsonb not null,                    -- [{ name, variant, qty, priceCents }]
  subtotal_cents   integer not null,
  shipping_cents   integer not null,
  tax_cents        integer not null,
  total_cents      integer not null,
  shipping_address jsonb not null,                    -- { line1, city, region, postal, country }
  payment_status   text not null default 'pending',   -- pending | paid | refunded
  cancelled        boolean not null default false,
  fulfillment      jsonb not null default '{"status":"unfulfilled"}'::jsonb,
  timeline         jsonb not null default '[]'::jsonb
);

create index if not exists orders_placed_at_idx on orders (placed_at desc);

-- Row-level security: the app talks to Supabase with the service-role key from
-- the server, which bypasses RLS. Enable RLS so nothing is readable with the
-- public anon key by accident.
alter table orders enable row level security;

-- ── Catalog: categories + products ──────────────────────────────────────────
-- The storefront reads products from here (falling back to the bundled demo
-- catalog when Supabase isn't configured); the admin's Products manager writes
-- to it. Variant detail (colours, sizes, sold-out/low-stock keys) is JSONB to
-- match the app's Product type; `stock` is the simple on-hand count.

create table if not exists categories (
  id         text primary key,                 -- slug, e.g. 'knitwear'
  name       text not null unique,             -- display name, e.g. 'Knitwear'
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id                text primary key,
  slug              text not null unique,
  name              text not null,
  category          text not null,             -- matches categories.name
  price_cents       integer not null,
  compare_at_cents  integer,                   -- nullable; set when on sale
  short_description text not null default '',
  description       text not null default '',
  details           jsonb not null default '[]'::jsonb,   -- [string]
  colors            jsonb not null default '[]'::jsonb,   -- [{ name, hex }]
  sizes             jsonb not null default '[]'::jsonb,   -- [string]
  accent            text not null default '#6b6f4e',
  image             text,                                  -- optional photo URL
  badge             text,
  featured          boolean not null default false,
  sold_out          jsonb not null default '[]'::jsonb,   -- ["Colour/Size", ...]
  low_stock         jsonb not null default '[]'::jsonb,   -- ["Colour/Size", ...]
  stock             integer not null default 0,           -- on-hand count
  created_at        timestamptz not null default now()
);

create index if not exists products_category_idx on products (category);
create index if not exists products_slug_idx on products (slug);

alter table categories enable row level security;
alter table products enable row level security;

-- ── Seed: starter catalog (your two mouse pads) ─────────────────────────────
-- Safe to re-run — existing rows are left untouched.
insert into categories (id, name, position) values
  ('glass', 'Glass', 0),
  ('cloth', 'Cloth', 1)
on conflict (id) do nothing;

insert into products
  (id, slug, name, category, price_cents, short_description, description, details, colors, sizes, accent, badge, featured, stock)
values
  (
    'p_glass_pad', 'glass-mouse-pad', 'Glass Mouse Pad', 'Glass', 3900,
    'A tempered-glass pad with a micro-etched surface for fast, precise tracking.',
    'A 5mm tempered-glass surface, micro-etched for a smooth-but-controlled glide that high-DPI sensors love. The underside is a full sheet of anti-slip silicone, so it stays put through fast flicks, and the polished edges are easy on your wrist. Wipes clean in seconds.',
    '["5mm tempered glass, micro-etched surface","Full anti-slip silicone base","Rounded, polished edges","Wipe clean with a damp cloth"]'::jsonb,
    '[{"name":"Black","hex":"#1c1c1c"},{"name":"White","hex":"#ececec"}]'::jsonb,
    '["Square","Rectangle"]'::jsonb,
    '#5b6b73', 'New', true, 40
  ),
  (
    'p_cloth_pad', 'cloth-mouse-pad', 'Cloth Mouse Pad', 'Cloth', 1900,
    'A stitched-edge cloth pad with a smooth, low-friction weave.',
    'A fine micro-weave cloth top over a dense foam core — smooth enough for speed, with just enough texture for control. Stitched, anti-fray edges keep it tidy for years, and the natural-rubber base grips any desk.',
    '["Micro-weave cloth surface","Stitched anti-fray edges","Non-slip natural rubber base","Machine washable, air dry"]'::jsonb,
    '[{"name":"Black","hex":"#1c1c1c"},{"name":"Grey","hex":"#6b6b6b"},{"name":"Navy","hex":"#2c3347"}]'::jsonb,
    '["Square","Rectangle"]'::jsonb,
    '#2c2c2c', null, true, 75
  )
on conflict (id) do nothing;
