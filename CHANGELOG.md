# Changelog

A running log of fixes, features, and notable changes shipped to vionlabs.co.

Newest at top. Each entry shows the date, type (fix / feat / chore / sec), and
a short human-readable summary. Use this for bug reports — quote the most
recent entry so support knows which version you're on.

---

## 2026-06-20

### feat — Customer accounts + order history
- **Signup / sign in** at `/account/signup` and `/account/login`. Email + password via Supabase Auth (separate from the admin allowlist — anyone can create a customer account, but only ADMIN_ALLOWED_EMAILS can reach the admin).
- **Dashboard** at `/account` shows the customer's order history: list of orders with status pills (Processing / Shipped / Cancelled / Payment pending), date, item count, total.
- **Order detail** at `/account/orders/[number]` shows items, totals (including the discount line when applicable), shipping address, and the live tracking block when fulfilled. A double check on customer email prevents URL guessing across accounts.
- **Header gains an Account icon** (silhouette) next to the cart, visible on both desktop and mobile.
- **Middleware** now gates `/account/*` behind sign-in (login, signup, and auth callbacks are public). Signed-in customers visiting `/account/login` get bounced to `/account`.
- **Order matching** is by email — guest orders placed before someone signs up automatically appear in their dashboard once they create an account with the same address.

### feat — Discount codes end-to-end
- **Admin** creates codes at `/admin/discounts` (re-added to the sidebar): percent or fixed-dollar value, optional min order, max uses, start/end dates. Toggle enable/disable, delete.
- **Customers** see a "Discount code" input on the cart drawer and checkout summary. Once applied, it collapses to a chip showing the code + dollars saved, with an X to remove.
- **Validation** is server-side on every apply (`lib/discounts.ts`) and again on order creation — the client never controls discount amounts.
- **Order pipeline** stores `discountCode` + `discountCents` on the orders row. Discount applies to subtotal first; tax + shipping are calculated on the post-discount amount (standard US/CA practice).
- **Order email** + the success page now show the discount line with the code that was used.
- `uses_count` increments atomically on order creation; best-effort failure (eg. database hiccup) lets the order through rather than blocking it.
- New migration: `supabase/migrations/20260620020000_discounts.sql` (applied).

### feat — PDP polish: clearer swatches, spec card, working size guide
- **Colour swatches** are now larger circles with a clear scale animation + soft accent shadow on selection; a checkmark icon overlays the selected swatch (white on dark colours, black on light — YIQ contrast). The dead-end "is this selected?" question is gone.
- **"Specs at a glance" card** above the accordion shows sizes, colours, category, warranty in a scannable 2×2 grid. Derived from existing product fields so admin edits flow through automatically — no separate spec schema needed.
- **Size guide modal** works for the first time — clicking the "Size guide" link on the PDP opens a clean modal with Square + Rectangle dimensions in both inches and mm, plus use-case notes. ESC + click-outside + close-button + bottom-sheet on mobile.

### feat — Customer-visible tracking on the order success page + shipped email
- Order success page (`/checkout/success`) now loads the order from Supabase and, if the admin has marked it fulfilled, shows the carrier, tracking number, and a clickable "Track your package" button that deep-links to the carrier's tracking page.
- New `lib/tracking.ts` maps common carriers (USPS, UPS, FedEx, DHL, Canada Post, Stallion Express, Chit Chats, DPD) to their public tracking URLs. Unknown carriers fall back to plain text.
- New `sendShippedNotification` email fires automatically when admin clicks "Fulfil" in `/admin/orders/[id]`. Templated like the order confirmation (white + peach + orange CTA), with the tracking link front-and-centre.
- Customers can also revisit `/checkout/success?order=VL-...` from the email link any time to see live tracking status.

### feat — Order confirmation emails (Resend)
- Every checkout now sends a branded order-confirmation email via Resend.
- Sending domain `send.vionlabs.co` verified (us-east-1).
- Email template: brand mark, peach summary banner, line items with variants, totals, shipping address, customer-care contact.
- Send is non-blocking — a slow Resend response never holds up the customer's success-page redirect.

### fix — Origin copy now reflects reality (Canada operation)
- Footer trust badges: "Made in EU" / "Carbon-neutral ship" → "Designed in Canada" / "Ships to US & CA".
- About page: removed "small workshop in central Europe" claim; replaced with honest Canadian-origin copy.
- Shipping & returns page: rewritten with US + Canada-specific delivery windows (Canada Post + USPS for standard; UPS/FedEx for express). Customs note added for US-bound orders under $800 USD de minimis.
- Product page Shipping & returns accordion: dropped "carbon-neutral" claim; clarified "ships from Canada."

---

## 2026-06-19

### sec — Hardened security across the stack
- **XSS via tracking pixel IDs** patched. The admin-saved pixel IDs (GA4, Meta, TikTok, Hotjar, Clarity, GTM) are now validated against strict regex patterns before being interpolated into inline `<script>` tags. Malformed IDs are silently dropped.
- **Open redirect on OAuth callback** closed. The `?redirect=` param now rejects anything that isn't a relative `/admin/*` path.
- **Order + product IDs are now cryptographically random** (`crypto.randomBytes`). Old format: 6-digit `MAR-100231` (only 900k possible, easy to enumerate). New format: `VL-` + 10 hex chars (over 1 trillion possible).
- **Supabase RLS deny-all policies** added to every table (`orders`, `products`, `categories`, `tickets`, `site_settings`, `newsletter_subscribers`). If the anon key is ever accidentally used, queries fail loudly instead of silently leaking.
- **Every server action now calls `requireAdmin()`** at its top. Defence-in-depth — even if a server action URL leaks, it can't be invoked without a valid admin session.
- **Input length limits** added across all admin forms (product name 120 chars, description 5000 chars, etc.) to prevent DB bloat and obvious abuse.

### fix — E-commerce essentials
- **Stock is now decremented on order placement.** Previously orders could be created infinitely against the same SKU.
- **Checkout idempotency** — a `useRef` guard prevents duplicate orders from rapid double-clicks before the disabled state takes effect.
- **Newsletter is now real**: writes to a new `newsletter_subscribers` Supabase table, dedupes by email, returns a friendly "already subscribed" message on repeat.
- **Storefront `productId` is now passed through to order line items**, so stock decrement can locate the right SKU even if the product name changes.

### feat — Storefront content
- Stub pages added: `/pages/shipping-returns`, `/pages/warranty`, `/pages/specs`, `/pages/contact`, `/pages/about`, `/pages/privacy`, `/pages/terms`. Required for payment processor onboarding (Stripe/Razorpay won't approve without privacy + terms). Real legal copy still needs lawyer review.
- Footer + header `href="#"` dead links replaced with the new stub pages.
- `app/robots.ts` and `app/sitemap.ts` added so Google can crawl and index correctly. Admin is disallowed.

### feat — Admin
- This changelog page exists at `/admin/changelog` so non-engineers can see what's shipped.

---

## 2026-06-18 (later)

### feat — White + orange theme everywhere
- Storefront flipped from a mostly-black canvas to white + `#ff5c28` orange accents per design direction.
- Root `<body>` was the smoking gun — was `bg-ink` (black), now `bg-paper` (white). Every section that wasn't explicitly white was inheriting black.
- Home manifesto band became `bg-accent-soft` (peach), kept the orange "Built to last." accent.
- All CTAs (`Shop the collection`, `Add to bag`, `Subscribe`, `Place order`, `Checkout`) now use `bg-accent` (orange) with `bg-accent-hover` (darker orange) on hover.
- Shop filter pills, size selectors, sold-out chip, success-page step numbers, 404 page — all converted.
- `bg-clay` references that were silently no-op (never defined in Tailwind) now resolve as an alias of accent during the migration.

### perf — Storefront feels faster
- Added `loading.tsx` for storefront and product pages so navigation streams a skeleton immediately instead of waiting on the server roundtrip.
- Middleware now uses `supabase.auth.getClaims()` (local JWT verification via cached JWKS) instead of `getUser()` (network call to Auth API). On modern Supabase projects this drops the admin auth check from ~150ms to ~5ms.

---

## 2026-06-18 (earlier)

### perf — Admin nav lag fixed
- Removed the duplicate `supabase.auth.getUser()` call in the admin layout. Middleware now stamps the validated email into an `x-admin-email` request header, layout reads it locally (synchronous). Saves a Supabase Auth roundtrip on every admin page render.
- Added `app/admin/loading.tsx` for instant streaming on admin navigations.

### fix — Admin login + UI
- **Login-twice bug**: replaced `router.replace()` (soft nav) with `window.location.assign()` (hard nav) after sign-in so cookies are present on the next request. Previously the soft nav raced the cookie flush and bounced you back to login on the first try.
- **Login UI redesigned**: brand mark, gradient background, friendly error messages, spinner, proper "denied" + "oauth_failed" banners.
- **Login page no longer renders inside admin chrome** when you're already signed in — middleware now redirects authenticated users from `/admin/login` to `/admin`.
- **Admin sidebar** cleaned up: removed dead "Marketing" and "Discounts" entries until those pages do real work.
- **Mobile hamburger + slide-over drawer** added to the admin layout. Was unusable on mobile before.

### fix — Analytics + data wiring
- `/admin/analytics` no longer 500s — recharts downgraded from 3.x (broken on React 18) to 2.x.
- `customers` are now derived from `orders` (one row per email, rolled-up totals + first-order date), not hardcoded seed data.
- `tickets` moved from in-memory seed to a real Supabase table with graceful fallback if the table doesn't exist yet.
- `stock` consolidated onto the `products.stock` column (was previously a separate in-memory map that drifted).
- `site_settings` table created — Settings page no longer silently fails to save.

---

## 2026-06-17

### feat — Vionlabs branding + admin
- Storefront switched to light theme, marquee ticker dropped.
- Admin Settings + Apps (tracking pixels) wired with `site_settings` table.
- Vionlabs branding rolled out across admin: Shopify-style sidebar, analytics dashboard, image upload for products.

### feat — Catalog on Supabase
- Mouse-pad catalog migrated from in-memory demo data to Supabase `products` and `categories` tables.
- Admin Products manager: create/edit/delete + image upload to Supabase Storage (`product-images` bucket).
- Google OAuth gate via Supabase Auth + `ADMIN_ALLOWED_EMAILS` allowlist.

---

## How this works

This file (`CHANGELOG.md`) is the source of truth. The admin's `/admin/changelog`
page reads it from the repo at build time and renders it nicely. To add an
entry: open this file in a PR, add a section at the top with today's date, and
push. The next deploy picks it up.

Tag prefixes:
- `fix` — bug fix
- `feat` — new feature
- `sec` — security hardening
- `perf` — performance improvement
- `chore` — internal/tooling change with no user-facing effect
