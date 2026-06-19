// One-off: create send.vionlabs.co as a sending domain on Resend, then print
// the DNS records the registrar (Namecheap / wherever vionlabs.co is hosted)
// needs.  Idempotent — re-runnable to re-print the records.
//
// Run with: npx tsx scripts/resend-add-domain.ts

import { readFileSync } from 'fs'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] = m[2]
}

const KEY = process.env.RESEND_API_KEY
const DOMAIN = 'send.vionlabs.co'
const REGION = 'eu-west-1' // Resend region — pick closest to your customers
                            // ('us-east-1' / 'eu-west-1' / 'sa-east-1' / 'ap-northeast-1')

async function main() {
  if (!KEY) {
    console.error('RESEND_API_KEY missing')
    process.exit(1)
  }

  // Check if it already exists
  const listRes = await fetch('https://api.resend.com/domains', {
    headers: { Authorization: `Bearer ${KEY}` },
  })
  const list = await listRes.json()
  let existing = list.data?.find((d: any) => d.name === DOMAIN)

  if (!existing) {
    console.log(`Creating ${DOMAIN} in region ${REGION}…`)
    const createRes = await fetch('https://api.resend.com/domains', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: DOMAIN, region: REGION }),
    })
    existing = await createRes.json()
    if (!createRes.ok) {
      console.error('Resend rejected the create call:', existing)
      process.exit(1)
    }
    console.log(`✓ Created. Domain id: ${existing.id}`)
  } else {
    console.log(`✓ ${DOMAIN} already exists. Status: ${existing.status}`)
  }

  // Pull full record list
  const detailRes = await fetch(`https://api.resend.com/domains/${existing.id}`, {
    headers: { Authorization: `Bearer ${KEY}` },
  })
  const detail = await detailRes.json()

  console.log('\n=== DNS records to add at your registrar ===\n')
  for (const r of detail.records ?? []) {
    console.log(`Type:  ${r.record}`)
    console.log(`Name:  ${r.name}`)
    console.log(`Value: ${r.value}`)
    if (r.ttl) console.log(`TTL:   ${r.ttl}`)
    if (r.priority !== undefined) console.log(`Priority: ${r.priority}`)
    console.log(`Status: ${r.status}\n`)
  }

  console.log(`Current verification status: ${detail.status}`)
  console.log('Once DNS propagates, re-run this script to see status flip to "verified".')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
