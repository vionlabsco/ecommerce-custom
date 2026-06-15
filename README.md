# Marlowe — custom storefront

A fully custom e-commerce storefront built with **Next.js 14 (App Router)**, **TypeScript**,
and **Tailwind CSS**. Physical-product catalog with variants, stock states, a persistent
cart, and a complete checkout flow. Payments are intentionally stubbed for now — there's a
single, clearly-marked integration point ready for Stripe or Lemon Squeezy.

> "Marlowe" is a placeholder brand. Change it in one line — see **Customising** below.

## Run it

```bash
npm install      # already done
npm run dev      # http://localhost:3000
```

Other scripts: `npm run build` (production build), `npm run start` (serve the build).

## What's inside

| Route | Purpose |
| --- | --- |
| `/` | Editorial homepage — hero, featured edit, brand band, categories, full collection |
| `/shop` | All products, filterable by category (`/shop?category=Knitwear`) |
| `/product/[slug]` | Product detail — gallery, colour/size variants, live stock state, related items |
| `/checkout` | Contact + shipping form, delivery options, order summary, payment stub |
| `/checkout/success` | Order confirmation |

The cart lives in a React context (`components/CartProvider.tsx`) and persists to
`localStorage`, so it survives refreshes. It opens as a slide-over drawer from the header.

## Customising

Everything you'll touch first lives in `lib/`:

- **Brand, tagline, shipping thresholds, tax rate, currency** → `lib/site.ts`
  (change `brand` and the whole store re-labels).
- **Products** → `lib/products.ts`. Each product has colours, sizes, price (in **cents**),
  and optional `soldOut` / `lowStock` variant lists that drive the stock UI.

### Product photos

Products render a cohesive, art-directed monogram tile by default (so the store looks
finished and works offline). To use real photography, add an `image` URL to a product in
`lib/products.ts`:

```ts
image: 'https://images.unsplash.com/photo-xxxx?auto=format&fit=crop&w=1100&q=80',
```

`images.unsplash.com` is already allow-listed in `next.config.mjs`. If a photo ever fails to
load, the tile is shown as a fallback.

## Going live

This MVP is deliberately self-contained. Two clean next steps when you're ready:

1. **Payments** — open `components/CheckoutForm.tsx` and find the
   `Payment integration point` comment. Replace the simulated order with a call that creates
   a Stripe Checkout Session (or Lemon Squeezy checkout) and redirect to it. That's the only
   place the order is "placed."
2. **Real catalog / inventory** — `lib/products.ts` exposes simple helpers
   (`getAllProducts`, `getProductBySlug`, `getVariantState`, …). Swap their bodies for
   Supabase queries and the rest of the app keeps working unchanged.

## Deploy

Push to a Git repo and import into **Vercel** — it autodetects Next.js, no config needed.
