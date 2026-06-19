// One-off: list current products + categories so I can see what to fix.
// Uses the service-role key from .env.local. Run with `npx tsx scripts/inspect-products.ts`.

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load .env.local manually (this script runs outside Next, which usually
// auto-loads env files).
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] = m[2]
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

async function main() {
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, slug, name, category, price_cents')
  if (pErr) throw pErr
  console.log('\n=== Products ===')
  for (const p of products ?? []) {
    console.log(`  ${p.id}  |  ${p.slug.padEnd(20)}  |  ${p.name.padEnd(28)}  |  ${p.category.padEnd(10)}  |  $${(p.price_cents / 100).toFixed(2)}`)
  }

  const { data: cats, error: cErr } = await supabase
    .from('categories')
    .select('id, name, position')
    .order('position')
  if (cErr) throw cErr
  console.log('\n=== Categories ===')
  for (const c of cats ?? []) {
    console.log(`  ${c.id.padEnd(15)}  |  ${c.name}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
