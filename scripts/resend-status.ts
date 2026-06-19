// Inspect the Resend account: list verified sending domains + recently sent
// emails. Tells us if send.vionlabs.co is set up or still needs DNS.

import { readFileSync } from 'fs'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] = m[2]
}

async function main() {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.error('RESEND_API_KEY not set')
    process.exit(1)
  }

  // List domains
  const dRes = await fetch('https://api.resend.com/domains', {
    headers: { Authorization: `Bearer ${key}` },
  })
  const domains = await dRes.json()
  console.log('=== Domains ===')
  if (!domains.data || domains.data.length === 0) {
    console.log('  (none added yet)')
  } else {
    for (const d of domains.data) {
      console.log(`  ${d.name.padEnd(30)} status=${d.status}  region=${d.region}`)
    }
  }

  // List recent emails (last 10) to see if anything reached Resend
  const eRes = await fetch('https://api.resend.com/emails?limit=10', {
    headers: { Authorization: `Bearer ${key}` },
  })
  const emails = await eRes.json()
  console.log('\n=== Recent emails ===')
  if (!emails.data || emails.data.length === 0) {
    console.log('  (none yet)')
  } else {
    for (const e of emails.data.slice(0, 10)) {
      console.log(`  ${e.created_at}  ${e.last_event?.padEnd(10) ?? '—'}  ${e.to?.join(',')}  →  ${e.subject ?? '(no subject)'}`)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
