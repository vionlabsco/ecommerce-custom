// Route-by-hostname + auth gates for /admin/* and /account/*.
//
// Two faces of the same Next.js app, separated by the request's Host header:
//   • storefront host (vionlabs.co, ecommerce-custom-iota.vercel.app, …)
//     → /admin/* is hidden (404). /account/* is reachable. Everything else passes.
//   • admin host (app.vionlabs.co, or any host listed in ADMIN_HOSTS)
//     → only /admin/* is reachable. Root '/' redirects to /admin.
//   • localhost → both faces work; only the auth gates apply.
//
// Two auth gates inside this middleware:
//   - /admin/*    requires sign-in AND email in ADMIN_ALLOWED_EMAILS
//   - /account/*  requires sign-in (any authenticated user)

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
  if (h.endsWith('.vercel.app')) return 'local'
  return ADMIN_HOSTS.has(h) ? 'admin' : 'storefront'
}

// Auth subroutes (callback, signout) for either surface — always pass.
function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith('/admin/auth/') || pathname.startsWith('/account/auth/')
}

// Customer-account paths that don't require sign-in.
function isPublicAccountPath(pathname: string): boolean {
  return (
    pathname === '/account/login' ||
    pathname === '/account/signup' ||
    pathname.startsWith('/account/auth/')
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const role = classify(request.headers.get('host'))
  const isAdminPath = pathname.startsWith('/admin')
  const isAccountPath = pathname.startsWith('/account')

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

  // OAuth callback + signout always pass through untouched.
  if (isAuthRoute(pathname)) {
    return NextResponse.next()
  }

  // Storefront paths that don't need a session — let them through fast.
  if (!isAdminPath && !isAccountPath) {
    return NextResponse.next()
  }

  // From here on, we need to know whether the request is authenticated.
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

  // Verify the session locally via JWT claims (cached JWKS) when available —
  // avoids the ~150-400ms network roundtrip of supabase.auth.getUser() on
  // every request. Falls back to getUser() on older symmetric-key projects.
  let userEmail: string | null = null
  try {
    const { data, error } = await supabase.auth.getClaims()
    if (!error && data?.claims) {
      const claims = data.claims as { email?: string }
      userEmail = claims.email ?? null
    }
  } catch {
    // getClaims missing or threw — fall back to getUser below.
  }
  if (!userEmail) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    userEmail = user?.email ?? null
  }

  // ── /account/* (customer surface) ────────────────────────────────────────
  if (isAccountPath) {
    // Pass the email to downstream Server Components — separate header from
    // admin so a logged-in customer reading /account/page.tsx can't be
    // confused with a logged-in admin.
    if (userEmail) {
      const headers = new Headers(request.headers)
      headers.set('x-customer-email', userEmail)
      response = NextResponse.next({ request: { headers } })
    }

    if (isPublicAccountPath(pathname)) {
      // Already signed in? Bounce to dashboard instead of showing login form.
      if (userEmail && (pathname === '/account/login' || pathname === '/account/signup')) {
        return NextResponse.redirect(new URL('/account', request.url))
      }
      return NextResponse.next()
    }

    // Protected account path — require sign-in.
    if (!userEmail) {
      const url = request.nextUrl.clone()
      url.pathname = '/account/login'
      if (pathname !== '/account') url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    return response
  }

  // ── /admin/* (staff surface) ─────────────────────────────────────────────
  if (userEmail) {
    const headers = new Headers(request.headers)
    headers.set('x-admin-email', userEmail)
    response = NextResponse.next({ request: { headers } })
  }

  if (pathname === '/admin/login') {
    if (userEmail && isAllowedAdmin(userEmail)) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  if (!userEmail) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    if (pathname !== '/admin') url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (!isAllowedAdmin(userEmail)) {
    await supabase.auth.signOut()
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('denied', '1')
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|.*\\.(?:png|jpg|jpeg|webp|gif|svg|ico)$).*)',
  ],
}
