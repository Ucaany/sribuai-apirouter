import { adminGuard } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const guard = await adminGuard()
  if (guard) return guard

  const db = createServiceClient()
  const { id } = params

  const [{ data: profile }, { data: apiKeys }, { data: transactions }, { data: usageLogs }] = await Promise.all([
    db.from('profiles').select('*').eq('id', id).single(),
    db.from('api_keys').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    db.from('transactions').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    db.from('usage_logs').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(100),
  ])

  return NextResponse.json({ profile, apiKeys, transactions, usageLogs })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const guard = await adminGuard()
  if (guard) return guard

  const db = createServiceClient()
  const { id } = params
  const body = await request.json()

  const allowed = ['is_banned', 'ban_reason', 'tier', 'subscription_status', 'token_pool_remaining', 'is_admin']
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  const { data, error } = await db.from('profiles').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: data })
}
