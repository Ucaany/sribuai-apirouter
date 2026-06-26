import { createHash, randomBytes } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const API_KEY_PREFIX = 'sk-sri-'

export function generateApiKey(): { key: string; hash: string; preview: string } {
  const raw = randomBytes(32).toString('hex')
  const key = `${API_KEY_PREFIX}${raw}`
  const hash = hashApiKey(key)
  const preview = `${API_KEY_PREFIX}${raw.substring(0, 8)}...`
  return { key, hash, preview }
}

export function hashApiKey(key: string): string {
  return createHash('sha256')
    .update(key + (process.env.API_KEY_ENCRYPTION_SECRET ?? ''))
    .digest('hex')
}

export async function validateApiKey(
  key: string,
  supabase: SupabaseClient<Database>
): Promise<
  | { valid: false; error: string }
  | { valid: true; apiKeyId: string; userId: string; profile: Database['public']['Tables']['profiles']['Row'] }
> {
  if (!key.startsWith(API_KEY_PREFIX)) {
    return { valid: false, error: 'Invalid API key format' }
  }

  const hash = hashApiKey(key)

  const { data: apiKey } = await supabase
    .from('api_keys')
    .select(`
      id,
      user_id,
      is_active,
      expires_at,
      profiles!inner(
        id, email, full_name, avatar_url, tier, subscription_status,
        subscription_started_at, subscription_expires_at,
        token_pool_total, token_pool_used, token_pool_remaining,
        total_requests_lifetime, total_tokens_lifetime, last_request_at,
        is_banned, ban_reason, is_admin, created_at, updated_at
      )
    `)
    .eq('key_hash', hash)
    .single()

  if (!apiKey) return { valid: false, error: 'Invalid API key' }

  if (!apiKey.is_active) return { valid: false, error: 'API key is disabled' }

  if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
    return { valid: false, error: 'API key has expired' }
  }

  const profile = (Array.isArray(apiKey.profiles)
    ? apiKey.profiles[0]
    : apiKey.profiles) as unknown as Database['public']['Tables']['profiles']['Row']

  if (profile.is_banned) {
    return { valid: false, error: profile.ban_reason || 'Account suspended' }
  }

  if (profile.subscription_status !== 'active') {
    return { valid: false, error: 'Subscription inactive' }
  }

  return { valid: true, apiKeyId: apiKey.id, userId: apiKey.user_id, profile }
}
