import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServiceClient()

  const { data: models } = await supabase
    .from('model_configs')
    .select('model_id, model_name, provider, context_window, supports_streaming')
    .eq('is_active', true)
    .order('sort_order')

  return NextResponse.json({
    object: 'list',
    data: (models ?? []).map(m => ({
      id: m.model_id,
      object: 'model',
      created: 1700000000,
      owned_by: m.provider.toLowerCase(),
      context_window: m.context_window,
    })),
  })
}

export const dynamic = 'force-dynamic'
