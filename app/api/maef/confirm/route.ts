import { NextRequest, NextResponse } from 'next/server'
import { verifyComplete } from '@/lib/maef'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// The parent calls this after payment with ?maef_complete=<base64(json)>&sig=<hmac>,
// both as a server-to-server GET (header X-MAEF-Async: 1) and as a browser
// redirect. The order itself was already created + emailed on the child side at
// checkout, so here we only verify the signature, acknowledge the async ping,
// and land the shopper on the success page.
function handle(req: NextRequest): NextResponse {
  const url = new URL(req.url)
  const maefComplete = url.searchParams.get('maef_complete') || ''
  const sig = url.searchParams.get('sig') || ''
  const isAsync = req.headers.get('x-maef-async') === '1'

  const decoded = maefComplete && sig ? verifyComplete(maefComplete, sig) : null

  // Server-to-server acknowledgement: confirm signature and return JSON.
  if (isAsync) {
    if (!decoded) return NextResponse.json({ ok: false, error: 'bad signature' }, { status: 401 })
    return NextResponse.json({ ok: true })
  }

  // Browser return: never show a paying customer an error. Carry the total
  // through to the success page when we can verify it.
  const success = new URL('/checkout/success', url.origin)
  if (decoded?.original_payload?.total) {
    success.searchParams.set('total', String(Math.round(decoded.original_payload.total * 100)))
  }
  return NextResponse.redirect(success, 303)
}

export async function GET(req: NextRequest) {
  return handle(req)
}

export async function POST(req: NextRequest) {
  return handle(req)
}
