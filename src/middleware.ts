import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

const SUSPICIOUS_USER_AGENTS = [
  /bot(?!.*google)/i, /crawler/i, /spider/i, /scraper/i,
  /(?:^| )curl(?: |$)/i, /(?:^| )wget(?: |$)/i,
  /python-requests/i, /python-urllib/i,
  /^java\//i, /httpclient/i, /^go-http-client/i,
  /^ruby$/i, /libwww-perl/i,
]

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'X-DNS-Prefetch-Control': 'off',
}

function isSuspiciousRequest(request: NextRequest): { blocked: boolean; reason?: string } {
  const ua = request.headers.get('user-agent') || ''
  const cfBotScore = request.headers.get('cf-bot-score')
  const cfThreatScore = request.headers.get('cf-threat-score')

  for (const pattern of SUSPICIOUS_USER_AGENTS) {
    if (pattern.test(ua)) {
      return { blocked: true, reason: 'Suspicious user agent' }
    }
  }

  if (cfBotScore) {
    const score = parseInt(cfBotScore, 10)
    if (score > 0 && score <= 30) {
      return { blocked: true, reason: 'Bot detected by Cloudflare' }
    }
  }

  if (cfThreatScore) {
    const threat = parseInt(cfThreatScore, 10)
    if (threat >= 50) {
      return { blocked: true, reason: 'High threat score' }
    }
  }

  return { blocked: false }
}

export async function middleware(request: NextRequest) {
  const suspiciousCheck = isSuspiciousRequest(request)
  if (suspiciousCheck.blocked) {
    console.warn(`[middleware] Blocked: ${suspiciousCheck.reason} - IP: ${request.headers.get('x-forwarded-for') || 'unknown'}`)
    return new NextResponse('Forbidden', { status: 403 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[middleware] Missing Supabase env vars')
    return NextResponse.json({ error: 'Service misconfigured' }, { status: 500 })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  const protectedPaths = ['/dashboard', '/admin']
  const isProtected = protectedPaths.some(p => path.startsWith(p))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  if (path === '/dashboard' && user) {
    return supabaseResponse
  }

  const authPaths = ['/login', '/register']
  const isAuthPage = authPaths.some(p => path.startsWith(p))

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (path.startsWith('/admin') && user) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      console.error('[middleware] Missing SUPABASE_SERVICE_ROLE_KEY')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    const serviceClient = createSupabaseClient(supabaseUrl, serviceRoleKey)
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    supabaseResponse.headers.set(key, value)
  }

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' https://challenges.cloudflare.com ${process.env.NEXT_PUBLIC_SUPABASE_URL || ''};
    frame-src https://challenges.cloudflare.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s{2,}/g, ' ').trim()
  supabaseResponse.headers.set('Content-Security-Policy', cspHeader)

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
