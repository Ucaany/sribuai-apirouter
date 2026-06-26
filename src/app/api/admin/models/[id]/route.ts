import { adminGuard } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const guard = await adminGuard()
  if (guard) return guard

  const db = createServiceClient()
  const body = await request.json()

  const allowed = ['model_name', 'router_model_id', 'context_window', 'supports_streaming', 'is_active', 'sort_order', 'description']
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  const { data, error } = await db.from('model_configs').update(update).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ model: data })
}
