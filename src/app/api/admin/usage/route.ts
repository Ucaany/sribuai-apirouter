import { adminGuard } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const guard = await adminGuard()
  if (guard) return guard

  const db = createServiceClient()
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') ?? '30')
  const from = new Date()
  from.setDate(from.getDate() - days)

  const { data: logs } = await db
    .from('usage_logs')
    .select('model, provider, status_code, total_tokens, response_time_ms, created_at')
    .gte('created_at', from.toISOString())
    .order('created_at', { ascending: false })
    .limit(10000)

  const allLogs = logs ?? []

  const totalRequests = allLogs.length
  const totalTokens = allLogs.reduce((s, l) => s + l.total_tokens, 0)
  const errorCount = allLogs.filter(l => l.status_code !== 200).length
  const errorRate = totalRequests ? ((errorCount / totalRequests) * 100).toFixed(1) : '0.0'
  const avgLatency = totalRequests
    ? Math.round(allLogs.reduce((s, l) => s + l.response_time_ms, 0) / totalRequests)
    : 0

  const dailyMap: Record<string, number> = {}
  allLogs.forEach(l => {
    const day = l.created_at.slice(0, 10)
    dailyMap[day] = (dailyMap[day] ?? 0) + 1
  })
  const dailyChart = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date: date.slice(5), count }))

  const modelMap: Record<string, number> = {}
  allLogs.forEach(l => { modelMap[l.model] = (modelMap[l.model] ?? 0) + 1 })
  const modelChart = Object.entries(modelMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([model, count]) => ({ model, count }))

  const errorMap: Record<string, number> = {}
  allLogs.filter(l => l.status_code !== 200).forEach(l => {
    const code = String(l.status_code)
    errorMap[code] = (errorMap[code] ?? 0) + 1
  })
  const errorChart = Object.entries(errorMap).map(([code, count]) => ({ code, count }))

  const providerMap: Record<string, { requests: number; errors: number; totalLatency: number }> = {}
  allLogs.forEach(l => {
    if (!providerMap[l.provider]) providerMap[l.provider] = { requests: 0, errors: 0, totalLatency: 0 }
    providerMap[l.provider].requests++
    if (l.status_code !== 200) providerMap[l.provider].errors++
    providerMap[l.provider].totalLatency += l.response_time_ms
  })
  const providerHealth = Object.entries(providerMap).map(([provider, v]) => ({
    provider,
    requests: v.requests,
    errorRate: v.requests ? ((v.errors / v.requests) * 100).toFixed(1) : '0.0',
    avgLatency: v.requests ? Math.round(v.totalLatency / v.requests) : 0,
  }))

  return NextResponse.json({
    totalRequests, totalTokens, errorRate, avgLatency,
    dailyChart, modelChart, errorChart, providerHealth,
  })
}
