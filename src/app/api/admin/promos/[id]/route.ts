import { adminGuard } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const guard = await adminGuard()
  if (guard) return guard

  const db = createServiceClient()
  const { error } = await db
    .from('promos')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, deleted: params.id })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const guard = await adminGuard()
  if (guard) return guard

  const body = await request.json()
  const db = createServiceClient()
  const { data, error } = await db
    .from('promos')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ promo: data })
}
