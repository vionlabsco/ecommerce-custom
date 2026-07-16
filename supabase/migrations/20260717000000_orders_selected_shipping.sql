-- Add selected_shipping to orders so createOrder can persist the customer's
-- checkout carrier choice. Nullable — orders placed before the multi-carrier
-- picker landed will have null here, and the admin's BuyLabelButton falls
-- back to the default carrier (FedEx) for those.
--
-- Apply via: Supabase Dashboard → SQL Editor → paste + Run

alter table orders
  add column if not exists selected_shipping jsonb;
