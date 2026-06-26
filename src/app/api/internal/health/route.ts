import { NextResponse } from 'next/server'

export async function GET() {
  const checks: Record<string, string> = {}

  try {
    const res = await fetch(
      `${process.env.NINEROUTER_BASE_URL}/health`,
      { signal: AbortSignal.timeout(3000) }
    )
    checks['9router'] = res.ok ? 'ok' : 'degraded'
  } catch {
    checks['9router'] = 'down'
  }

  const allOk = Object.values(checks).every(v => v === 'ok')

  return NextResponse.json(
    { status: allOk ? 'ok' : 'degraded', checks, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 503 }
  )
}
