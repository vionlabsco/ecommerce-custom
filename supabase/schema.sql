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
