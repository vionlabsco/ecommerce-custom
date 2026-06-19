import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/supabase/auth-server'

export async function POST(request: Request) {
  const supabase = createAuthClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/', request.url), { status: 303 })
}
