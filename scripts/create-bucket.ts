// One-off: create the product-images Storage bucket (public-read) so admin
// image upload works. Idempotent — safe to re-run.
//
// Run with: npx tsx scripts/create-bucket.ts

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
  const BUCKET = 'product-images'

  // Check if it already exists
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets()
  if (listErr) throw listErr

  const existing = buckets?.find((b) => b.name === BUCKET)
  if (existing) {
    console.log(`✓ Bucket "${BUCKET}" already exists (public: ${existing.public})`)
    // If it's not public, update it
    if (!existing.public) {
      const { error: updErr } = await supabase.storage.updateBucket(BUCKET, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5 MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      })
      if (updErr) throw updErr
      console.log('  → flipped to public + added size/type limits')
    }
  } else {
    const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    })
    if (createErr) throw createErr
    console.log(`✓ Created bucket "${BUCKET}" (public, 5MB max, images only)`)
  }

  // Final state
  const { data: final } = await supabase.storage.listBuckets()
  console.log('\nAll buckets:')
  for (const b of final ?? []) {
    console.log(`  ${b.name.padEnd(20)} public=${b.public}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
