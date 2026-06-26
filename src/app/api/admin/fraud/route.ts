import { adminGuard } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const guard = await adminGuard()
  if (guard) return guard

  const db = createServiceClient()

  const { data: flagged } = await db
    .from('profiles')
    .select('id, email, full_name, tier, is_banned, total_requests_lifetime, created_at')
    .eq('is_banned', true)
    .order('created_at', { ascending: false })
    .limit(100)

  return NextResponse.json({ flagged: flagged ?? [] })
}
