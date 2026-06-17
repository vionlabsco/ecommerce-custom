// Gate every /admin/* route behind Supabase Auth + email allowlist.
//
// Exemptions (these stay reachable without a session):
//   /admin/login           — the sign-in page itself
//   /admin/auth/callback   — receives the OAuth code from Supabase
//
// Anyone not signed in is sent to /admin/login. Anyone signed in but not on the
// ADMIN_ALLOWED_EMAILS list is signed out and redirected with ?denied=1.

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isAllowedAdmin } from '@/lib/auth/admin'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/admin/login' || pathname.startsWith('/admin/auth/')) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    if (pathname !== '/admin') url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (!isAllowedAdmin(user.email)) {
    await supabase.auth.signOut()
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('denied', '1')
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
