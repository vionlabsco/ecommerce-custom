// Route-by-hostname + admin auth gate.
//
// Two faces of the same Next.js app, separated by the request's Host header:
//   • storefront host (vionlabs.co, ecommerce-custom-iota.vercel.app, …)
//     → /admin/* is hidden (404). Everything else passes.
//   • admin host (app.vionlabs.co, or any host listed in ADMIN_HOSTS)
//     → only /admin/* is reachable. Root '/' redirects to /admin.
//   • localhost → both faces work; only the auth gate applies.
//
// The admin auth gate on /admin/* (login, allowlist) is unchanged from before.

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isAllowedAdmin } from '@/lib/auth/admin'

const ADMIN_HOSTS = new Set(
  (process.env.ADMIN_HOSTS ?? 'app.vionlabs.co')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
)

type HostRole = 'local' | 'admin' | 'storefront'

function classify(host: string | null): HostRole {
  if (!host) return 'storefront'
  const h = host.split(':')[0].toLowerCase()
  if (h === 'localhost' || h === '127.0.0.1') return 'local'
  // Vercel preview URLs bypass the hostname filter so both storefront AND
  // admin routes are reachable while the custom domain DNS is still
  // propagating. Once DNS lands, vionlabs.co + app.vionlabs.co split cleanly.
  if (h.endsWith('.vercel.app')) return 'local'
  return ADMIN_HOSTS.has(h) ? 'admin' : 'storefront'
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const role = classify(request.headers.get('host'))
  const isAdminPath = pathname.startsWith('/admin')

  // Storefront host: /admin/* is invisible.
  if (role === 'storefront' && isAdminPath) {
    return NextResponse.rewrite(new URL('/not-found', request.url))
  }

  // Admin host: only /admin/* is reachable; root bounces to /admin.
  if (role === 'admin') {
    if (pathname === '/' || pathname === '') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    if (!isAdminPath) {
      return NextResponse.rewrite(new URL('/not-found', request.url))
    }
  }

  // Non-admin paths beyond this point are storefront pages — let them through.
  if (!isAdminPath) return NextResponse.next()

  // Public admin endpoints: the login page itself and the OAuth callback/signout.
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
  // Run on every page request EXCEPT Next.js internals and common static assets.
  // This is broader than the previous /admin-only matcher because hostname
  // routing has to apply to non-/admin paths too (e.g. block /shop on admin host).
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|.*\\.(?:png|jpg|jpeg|webp|gif|svg|ico)$).*)',
  ],
}
