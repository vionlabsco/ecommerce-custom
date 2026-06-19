// One-off: clean up the live product data.
//   - "RGB Mousepaf" → "RGB Mouse Pad" (name + slug)
//   - Move from "Glasspad" category → "Glass" (which already exists)
//   - Delete the duplicate "Glasspad" category
//
// Run with: npx tsx scripts/fix-typos.ts

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

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
  // 1. Fix the product name + slug + category
  const { error: updateErr } = await supabase
    .from('products')
    .update({
      name: 'RGB Mouse Pad',
      slug: 'rgb-mouse-pad',
      category: 'Glass',
    })
    .eq('slug', 'rgb-mousepaf')
  if (updateErr) throw updateErr
  console.log('✓ Renamed "RGB Mousepaf" → "RGB Mouse Pad", moved to Glass category')

  // 2. Delete the orphan Glasspad category
  const { error: catErr } = await supabase
    .from('categories')
    .delete()
    .eq('name', 'Glasspad')
  if (catErr) throw catErr
  console.log('✓ Deleted "Glasspad" category')

  // 3. Verify
  const { data: products } = await supabase
    .from('products')
    .select('slug, name, category')
  const { data: cats } = await supabase.from('categories').select('name')
  console.log('\nFinal state:')
  console.log('  Products:', products?.map((p) => `${p.name} (${p.category})`))
  console.log('  Categories:', cats?.map((c) => c.name))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
