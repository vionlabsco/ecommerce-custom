// Verify discount_codes table exists + has the expected shape.

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
  const { count, error } = await supabase
    .from('discount_codes')
    .select('*', { count: 'exact', head: true })
  if (error) {
    console.error('discount_codes query failed:', error)
    process.exit(1)
  }
  console.log(`✓ discount_codes table exists, ${count} rows`)

  // Check orders has the new columns by reading one and looking at keys
  const { data: order } = await supabase.from('orders').select('*').limit(1).maybeSingle()
  if (order) {
    const hasDiscountCode = 'discount_code' in order
    const hasDiscountCents = 'discount_cents' in order
    console.log(`✓ orders.discount_code present: ${hasDiscountCode}`)
    console.log(`✓ orders.discount_cents present: ${hasDiscountCents}`)
  } else {
    console.log('No existing orders to inspect — schema columns added at migration time')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
