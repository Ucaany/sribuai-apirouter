import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { token } = await request.json()

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
  formData.append('remoteip', request.headers.get('x-forwarded-for')?.split(',')[0] ?? '')

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()
  if (!data.success) {
    return NextResponse.json({ success: false, error: 'Verifikasi gagal' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
