import { createServiceClient } from '@/lib/supabase/server'

const WINDOW_MS = 60 * 1000
const MAX_PER_WINDOW = 120

const LOCAL_MAX_PER_WINDOW = 20

const SUSPICIOUS_USER_AGENTS = [
  /bot/i, /crawler/i, /spider/i, /scraper/i,
  /curl/i, /wget/i, /python/i, /java/i,
  /httpclient/i, /go-http-client/i, /libwww-perl/i,
]

const BLOCKED_IPS = new Set<string>()
const IP_FAILED_ATTEMPTS = new Map<string, { count: number; lastAttempt: number }>()

function isSuspiciousUA(userAgent: string): boolean {
  return SUSPICIOUS_USER_AGENTS.some(pattern => pattern.test(userAgent || ''))
}

export function blockIP(ip: string) {
  BLOCKED_IPS.add(ip)
}

export function recordFailedAttempt(ip: string) {
  const existing = IP_FAILED_ATTEMPTS.get(ip) || { count: 0, lastAttempt: 0 }
  existing.count++
  existing.lastAttempt = Date.now()
  IP_FAILED_ATTEMPTS.set(ip, existing)
  if (existing.count >= 5) {
    blockIP(ip)
  }
}

const localCache = new Map<string, { count: number; resetAt: number }>()

export async function checkRateLimit(ip: string, userAgent?: string): Promise<{ allowed: boolean; maxRequests: number; reason?: string }> {
  if (BLOCKED_IPS.has(ip)) {
    return { allowed: false, maxRequests: 0, reason: 'IP blocked' }
  }

  const failedAttempts = IP_FAILED_ATTEMPTS.get(ip)
  if (failedAttempts && failedAttempts.count >= 5) {
    const timeSinceLastAttempt = Date.now() - failedAttempts.lastAttempt
    if (timeSinceLastAttempt < 5 * 60 * 1000) {
      return { allowed: false, maxRequests: 0, reason: 'Too many failed attempts' }
    } else {
      IP_FAILED_ATTEMPTS.delete(ip)
    }
  }

  const maxRequests = isSuspiciousUA(userAgent || '') ? LOCAL_MAX_PER_WINDOW : MAX_PER_WINDOW

  const now = Date.now()
  const resetAt = new Date(now + WINDOW_MS).toISOString()

  const cached = localCache.get(ip)
  if (cached && cached.resetAt > now) {
    if (cached.count >= maxRequests) return { allowed: false, maxRequests, reason: 'Rate limit exceeded' }
    cached.count++
    return { allowed: true, maxRequests }
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
      return { allowed: true, maxRequests }
    }

    if (data.count >= maxRequests) {
      localCache.set(ip, { count: data.count, resetAt: new Date(data.reset_at).getTime() })
      return { allowed: false, maxRequests, reason: 'Rate limit exceeded' }
    }

    await db.from('rate_limits').update({ count: data.count + 1 }).eq('ip', ip)
    localCache.set(ip, { count: data.count + 1, resetAt: new Date(data.reset_at).getTime() })
    return { allowed: true, maxRequests }
  } catch {
    const fallback = localCache.get(ip)
    if (fallback && fallback.resetAt > now) {
      if (fallback.count >= maxRequests) return { allowed: false, maxRequests, reason: 'Rate limit exceeded' }
      fallback.count++
      return { allowed: true, maxRequests }
    }
    localCache.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, maxRequests }
  }
}
