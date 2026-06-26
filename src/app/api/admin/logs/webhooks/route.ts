import { adminGuard } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const guard = await adminGuard()
  if (guard) return guard

  const db = createServiceClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'all'
  const from = searchParams.get('from') ?? ''
  const to = searchParams.get('to') ?? ''

  let q = db
    .from('webhook_logs')
    .select('id, source, event_type, payload, status, error_message, transaction_id, processed_at, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (status !== 'all') q = q.eq('status', status)
  if (from) q = q.gte('created_at', from)
  if (to) q = q.lte('created_at', to)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ logs: data ?? [] })
}
