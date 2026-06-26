import { adminGuard } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const guard = await adminGuard()
  if (guard) return guard

  const db = createServiceClient()
  const { data, error } = await db
    .from('ip_blacklist')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ blacklist: data ?? [] })
}

export async function POST(request: Request) {
  const guard = await adminGuard()
  if (guard) return guard

  const { ip, reason } = await request.json()
  if (!ip) return NextResponse.json({ error: 'IP required' }, { status: 400 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('ip_blacklist')
    .insert({ ip: String(ip).trim(), reason: reason ?? null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, blacklisted: data })
}

export async function DELETE(request: Request) {
  const guard = await adminGuard()
  if (guard) return guard

  const { ip } = await request.json()
  if (!ip) return NextResponse.json({ error: 'IP required' }, { status: 400 })

  const db = createServiceClient()
  const { error } = await db
    .from('ip_blacklist')
    .delete()
    .eq('ip', String(ip).trim())

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, removed: ip })
}
