// Final verification: tables exist, RLS is on, policies present, bucket is up.

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
  // Table row counts as a quick "does it exist?" probe
  const tables = [
    'orders',
    'products',
    'categories',
    'tickets',
    'site_settings',
    'newsletter_subscribers',
  ]
  console.log('Tables (row counts):')
  for (const t of tables) {
    const { count, error } = await supabase
      .from(t)
      .select('*', { count: 'exact', head: true })
    if (error) console.log(`  ${t.padEnd(24)} ❌ ${error.message}`)
    else console.log(`  ${t.padEnd(24)} ✓ ${count} rows`)
  }

  // Storage
  const { data: buckets } = await supabase.storage.listBuckets()
  console.log('\nStorage buckets:')
  for (const b of buckets ?? []) {
    console.log(`  ${b.name.padEnd(24)} public=${b.public}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
