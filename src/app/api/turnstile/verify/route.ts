import { NextRequest, NextResponse } from 'next/server'

const BLOCKED_USER_AGENTS = [
  /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i,
  /python/i, /java/i, /php/i, /ruby/i, /go-http-client/i,
  /postman/i, /insomnia/i, /httpclient/i, /axios/i, /fetch/i,
]

const BLOCKED_IPS = new Set<string>()

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const userAgent = request.headers.get('user-agent') || ''
  const referer = request.headers.get('referer') || ''
  const origin = request.headers.get('origin') || ''

  if (BLOCKED_IPS.has(clientIp)) {
    return NextResponse.json({ success: false, error: 'IP blocked' }, { status: 403 })
  }

  const isBot = BLOCKED_USER_AGENTS.some(pattern => pattern.test(userAgent))
  if (isBot && !referer && !origin) {
    return NextResponse.json({ success: false, error: 'Automated requests not allowed' }, { status: 403 })
  }

  const body = await request.json()
  const token = body.token
  const action = body.action
  const cdata = body.cdata

  if (!token) {
    return NextResponse.json({ success: false, error: 'Token required' }, { status: 400 })
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json({ success: false, error: 'Turnstile not configured' }, { status: 500 })
  }

  const formData = new FormData()
  formData.append('secret', secretKey)
  formData.append('response', token)
  formData.append('remoteip', clientIp)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  let res: Response
  try {
    res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
  } catch {
    clearTimeout(timeoutId)
    return NextResponse.json({ success: false, error: 'Verification timeout' }, { status: 408 })
  }

  const data = await res.json()

  if (action && data.action !== action) {
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  }

  if (cdata && data.cdata !== cdata) {
    return NextResponse.json({ success: false, error: 'Invalid challenge data' }, { status: 400 })
  }

  if (!data.success) {
    const errorCodes = data['error-codes'] || []
    const suspiciousCodes = ['timeout-or-duplicate', 'invalid-secret', 'invalid-response']
    if (errorCodes.some((code: string) => suspiciousCodes.includes(code))) {
      if (clientIp !== 'unknown') BLOCKED_IPS.add(clientIp)
    }
    return NextResponse.json({ 
      success: false, 
      error: 'Verifikasi gagal', 
      codes: errorCodes,
      ...(process.env.NODE_ENV === 'development' && { debug: data })
    }, { status: 400 })
  }

  return NextResponse.json({ success: true, challenge_ts: data.challenge_ts })
}
