import { adminGuard } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const guard = await adminGuard()
  if (guard) return guard

  const db = createServiceClient()
  const { data, error } = await db.from('model_configs').select('*').order('sort_order', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ models: data ?? [] })
}

export async function POST(request: Request) {
  const guard = await adminGuard()
  if (guard) return guard

  const db = createServiceClient()
  const body = await request.json()

  const { data, error } = await db.from('model_configs').insert({
    model_id: body.model_id,
    model_name: body.model_name,
    provider: body.provider,
    router_model_id: body.router_model_id,
    context_window: body.context_window,
    supports_streaming: body.supports_streaming ?? true,
    is_active: body.is_active ?? true,
    sort_order: body.sort_order ?? 0,
    description: body.description ?? null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ model: data })
}
