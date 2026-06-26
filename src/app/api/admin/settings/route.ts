import { adminGuard } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const DEFAULT_SETTINGS = {
  pricing: {
    starter: { price: 10000, token_pool: 40000000 },
    pro: { price: 15900, token_pool: 80000000 },
    ultra: { price: 20000, token_pool: 150000000 },
  },
  system: {
    ninerouter_base_url: '',
    maintenance_mode: false,
    max_api_keys: { none: 0, starter: 3, pro: 10, ultra: 100 },
  },
  klikqris: {
    test_mode: true,
  },
}

export async function GET() {
  const guard = await adminGuard()
  if (guard) return guard

  const db = createServiceClient()
  const { data, error } = await db
    .from('admin_settings')
    .select('key, value')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const settings = { ...DEFAULT_SETTINGS }
  for (const row of data ?? []) {
    switch (row.key) {
      case 'tier_pricing_idr': {
        const v = row.value as Record<string, number>
        settings.pricing.starter.price = v.starter ?? settings.pricing.starter.price
        settings.pricing.pro.price = v.pro ?? settings.pricing.pro.price
        settings.pricing.ultra.price = v.ultra ?? settings.pricing.ultra.price
        break
      }
      case 'tier_token_pool': {
        const v = row.value as Record<string, number>
        settings.pricing.starter.token_pool = v.starter ?? settings.pricing.starter.token_pool
        settings.pricing.pro.token_pool = v.pro ?? settings.pricing.pro.token_pool
        settings.pricing.ultra.token_pool = v.ultra ?? settings.pricing.ultra.token_pool
        break
      }
      case 'maintenance_mode':
        settings.system.maintenance_mode = row.value === true || row.value === 'true'
        break
      case '9router_base_url':
        settings.system.ninerouter_base_url = typeof row.value === 'string' ? row.value : ''
        break
    }
  }

  return NextResponse.json({ settings })
}

export async function PATCH(request: Request) {
  const guard = await adminGuard()
  if (guard) return guard

  const body = await request.json()
  const db = createServiceClient()
  const upserts: { key: string; value: unknown; description?: string }[] = []

  if (body.pricing) {
    if (body.pricing.starter || body.pricing.pro || body.pricing.ultra) {
      upserts.push({
        key: 'tier_pricing_idr',
        value: {
          starter: body.pricing.starter?.price,
          pro: body.pricing.pro?.price,
          ultra: body.pricing.ultra?.price,
        },
        description: 'Harga paket per 24 jam dalam IDR',
      })
      upserts.push({
        key: 'tier_token_pool',
        value: {
          starter: body.pricing.starter?.token_pool,
          pro: body.pricing.pro?.token_pool,
          ultra: body.pricing.ultra?.token_pool,
        },
        description: 'Token pool per paket',
      })
    }
  }

  if (body.system) {
    if (body.system.maintenance_mode !== undefined) {
      upserts.push({ key: 'maintenance_mode', value: body.system.maintenance_mode, description: 'Aktifkan maintenance mode' })
    }
    if (body.system.ninerouter_base_url !== undefined) {
      upserts.push({ key: '9router_base_url', value: body.system.ninerouter_base_url, description: 'Base URL 9router instance' })
    }
  }

  if (upserts.length > 0) {
    const { error } = await db
      .from('admin_settings')
      .upsert(upserts, { onConflict: 'key' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
