import { adminGuard } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const guard = await adminGuard()
  if (guard) return guard

  const db = createServiceClient()
  const { data, error } = await db
    .from('promos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ promos: data ?? [] })
}

export async function POST(request: Request) {
  const guard = await adminGuard()
  if (guard) return guard

  const body = await request.json()
  const { code, discount_percent, max_uses, expires_at } = body

  if (!code || !discount_percent) {
    return NextResponse.json({ error: 'code dan discount_percent wajib diisi' }, { status: 400 })
  }

  const db = createServiceClient()
  const { data, error } = await db
    .from('promos')
    .insert({
      code: String(code).toUpperCase().trim(),
      discount_percent: Number(discount_percent),
      max_uses: Number(max_uses ?? 1),
      expires_at: expires_at ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ promo: data }, { status: 201 })
}
