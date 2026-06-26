import { adminGuard } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const guard = await adminGuard()
  if (guard) return guard

  const db = createServiceClient()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') ?? ''
  const tier = searchParams.get('tier') ?? 'all'
  const status = searchParams.get('status') ?? 'all'

  let q = db.from('profiles').select('*').order('created_at', { ascending: false })

  if (search) q = q.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
  if (tier !== 'all') q = q.eq('tier', tier)
  if (status === 'banned') q = q.eq('is_banned', true)
  else if (status === 'active') q = q.eq('is_banned', false)

  const { data, error } = await q.limit(200)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: data ?? [] })
}
