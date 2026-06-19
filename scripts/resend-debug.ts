// Verbose Resend account dump — see exactly what the API key is authorized
// for and what it can see.

import { readFileSync } from 'fs'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] = m[2]
}

async function main() {
  const key = process.env.RESEND_API_KEY!
  console.log(`API key prefix: ${key.slice(0, 8)}…${key.slice(-4)} (length ${key.length})`)
  console.log(`RESEND_FROM:    ${process.env.RESEND_FROM}\n`)

  console.log('--- GET /domains ---')
  const dRes = await fetch('https://api.resend.com/domains', {
    headers: { Authorization: `Bearer ${key}` },
  })
  console.log(`HTTP ${dRes.status}`)
  console.log(JSON.stringify(await dRes.json(), null, 2))

  console.log('\n--- GET /api-keys ---')
  const kRes = await fetch('https://api.resend.com/api-keys', {
    headers: { Authorization: `Bearer ${key}` },
  })
  console.log(`HTTP ${kRes.status}`)
  console.log(JSON.stringify(await kRes.json(), null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
