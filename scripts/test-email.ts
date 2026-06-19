// Smoke test: send a real order email and SHOW the actual Resend API response
// (success or failure), not just "done".
//
// Run with:  npx tsx scripts/test-email.ts you@example.com

import { readFileSync } from 'fs'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] = m[2]
}

async function main() {
  const recipient = process.argv[2]
  if (!recipient || !recipient.includes('@')) {
    console.error('Usage: npx tsx scripts/test-email.ts you@example.com')
    process.exit(1)
  }

  const key = process.env.RESEND_API_KEY!
  const from = process.env.RESEND_FROM!

  // Send via Resend REST API directly so we see the raw response.
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: recipient,
      subject: 'Vionlabs — order email smoke test',
      html: `<p>Hi! This is a smoke test from the Vionlabs storefront. If you got this, the wiring is working end to end.</p><p>— Sent ${new Date().toISOString()}</p>`,
      text: `Smoke test from the Vionlabs storefront. If you got this, the wiring is working. Sent ${new Date().toISOString()}.`,
    }),
  })

  console.log(`HTTP ${res.status}`)
  const body = await res.json()
  console.log(JSON.stringify(body, null, 2))

  if (res.ok) {
    console.log(`\n✓ Email accepted by Resend. ID: ${body.id}`)
    console.log(`  Check ${recipient}'s inbox (and spam folder).`)
  } else {
    console.error('\n✗ Resend rejected the send.')
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
