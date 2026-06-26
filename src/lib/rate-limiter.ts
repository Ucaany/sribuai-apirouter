import { createServiceClient } from '@/lib/supabase/server'

const WINDOW_MS = 60 * 1000
const MAX_PER_WINDOW = 120

const localCache = new Map<string, { count: number; resetAt: number }>()

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean }> {
  const now = Date.now()
  const resetAt = new Date(now + WINDOW_MS).toISOString()

  const cached = localCache.get(ip)
  if (cached && cached.resetAt > now) {
    if (cached.count >= MAX_PER_WINDOW) return { allowed: false }
    cached.count++
    return { allowed: true }
  }

  try {
    const db = createServiceClient()

    const { data, error } = await db
      .from('rate_limits')
      .select('count, reset_at')
      .eq('ip', ip)
      .single()

    if (error || !data || new Date(data.reset_at).getTime() < now) {
      await db.from('rate_limits').upsert({ ip, count: 1, reset_at: resetAt }, { onConflict: 'ip' })
      localCache.set(ip, { count: 1, resetAt: now + WINDOW_MS })
      return { allowed: true }
    }

    if (data.count >= MAX_PER_WINDOW) {
      localCache.set(ip, { count: data.count, resetAt: new Date(data.reset_at).getTime() })
      return { allowed: false }
    }

    await db.from('rate_limits').update({ count: data.count + 1 }).eq('ip', ip)
    localCache.set(ip, { count: data.count + 1, resetAt: new Date(data.reset_at).getTime() })
    return { allowed: true }
  } catch {
    const fallback = localCache.get(ip)
    if (fallback && fallback.resetAt > now) {
      if (fallback.count >= MAX_PER_WINDOW) return { allowed: false }
      fallback.count++
      return { allowed: true }
    }
    localCache.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true }
  }
}
