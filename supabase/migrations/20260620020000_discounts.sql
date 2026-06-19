-- discount_codes — coupon codes customers enter at checkout (and admin
-- creates in /admin/discounts). The discount is computed at order time from
-- (type, value) so historical orders keep their original discount even if
-- the code is later changed or deleted.

create table if not exists discount_codes (
  code               text primary key,                  -- normalised UPPER, e.g. "WELCOME10"
  type               text not null check (type in ('percent', 'fixed')),
  value              integer not null check (value > 0), -- percent (1-100) or cents
  min_subtotal_cents integer not null default 0,
  max_uses           integer,                            -- null = unlimited
  uses_count         integer not null default 0,
  starts_at          timestamptz,
  ends_at            timestamptz,
  active             boolean not null default true,
  created_at         timestamptz not null default now()
);

create index if not exists discount_codes_active_idx on discount_codes (active) where active = true;

alter table discount_codes enable row level security;
drop policy if exists "deny_all" on discount_codes;
create policy "deny_all" on discount_codes for all to public using (false) with check (false);

-- Track discount fields on orders so the receipt + admin order view show
-- exactly how much was knocked off + which code was used. Subtotal still
-- represents the pre-discount line-item sum; total reflects the discount.
alter table orders
  add column if not exists discount_code text,
  add column if not exists discount_cents integer not null default 0;
