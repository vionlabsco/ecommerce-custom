-- back_in_stock_signups — captures emails of customers who want to be
-- notified when a sold-out variant comes back into stock. The variant_key
-- mirrors the cart-line key format ("Black/Square") so signups are scoped
-- to a specific colour+size combination, not the whole product.

create table if not exists back_in_stock_signups (
  id           bigserial primary key,
  product_id   text not null,
  variant_key  text,                -- e.g. "Black/Square"; null when no variants
  email        text not null,
  notified_at  timestamptz,
  created_at   timestamptz not null default now(),
  unique (product_id, variant_key, email)
);

create index if not exists back_in_stock_unnotified_idx
  on back_in_stock_signups (product_id, variant_key)
  where notified_at is null;

alter table back_in_stock_signups enable row level security;
drop policy if exists "deny_all" on back_in_stock_signups;
create policy "deny_all" on back_in_stock_signups for all to public using (false) with check (false);
