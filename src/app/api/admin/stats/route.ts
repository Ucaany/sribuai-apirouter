import { adminGuard } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const guard = await adminGuard()
  if (guard) return guard

  const db = createServiceClient()

  const [
    { count: totalUsers },
    { count: activeSubs },
    { data: revenueData },
    { data: todayUsage },
    { data: recentTx },
  ] = await Promise.all([
    db.from('profiles').select('*', { count: 'exact', head: true }),
    db.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    db.from('transactions').select('amount_idr, created_at').eq('status', 'success'),
    db.from('usage_logs').select('id', { count: 'exact', head: true }).gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
    db.from('transactions').select('id, user_id, type, amount_idr, status, created_at, metadata').eq('status', 'success').order('created_at', { ascending: false }).limit(5),
  ])

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthRevenue = (revenueData ?? [])
    .filter(t => t.created_at >= monthStart)
    .reduce((s, t) => s + t.amount_idr, 0)

  const totalRevenue = (revenueData ?? []).reduce((s, t) => s + t.amount_idr, 0)

  const dailyRevenue: Record<string, number> = {}
  ;(revenueData ?? []).forEach(t => {
    const day = t.created_at.slice(0, 10)
    dailyRevenue[day] = (dailyRevenue[day] ?? 0) + t.amount_idr
  })
  const revenueChart = Object.entries(dailyRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, amount]) => ({ date: date.slice(5), amount }))

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    activeSubs: activeSubs ?? 0,
    monthRevenue,
    totalRevenue,
    todayRequests: todayUsage ?? 0,
    revenueChart,
    recentTransactions: recentTx ?? [],
  })
}
