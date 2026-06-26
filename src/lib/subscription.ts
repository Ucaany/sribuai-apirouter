import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const TIER_TOKEN_POOL: Record<string, number> = {
  starter: 40_000_000,
  pro:     80_000_000,
  ultra:   150_000_000,
}

export async function activatePayment(
  supabase: SupabaseClient<Database>,
  transaction: Database['public']['Tables']['transactions']['Row'],
  paidAt: string,
  { skipTransactionUpdate = false }: { skipTransactionUpdate?: boolean } = {}
) {
  if (!skipTransactionUpdate) {
    const { error: txError } = await supabase
      .from('transactions')
      .update({ status: 'success', paid_at: paidAt })
      .eq('id', transaction.id)

    if (txError) throw new Error(`Failed to update transaction: ${txError.message}`)
  }

  const meta = transaction.metadata as Record<string, string> | null
  const tier = meta?.tier
  if (!tier || !TIER_TOKEN_POOL[tier]) return

  const tokenPool = TIER_TOKEN_POOL[tier]
  const now = new Date()
  const paidAtDate = new Date(paidAt)
  const startedAt = paidAtDate > now ? paidAtDate : now
  const expiresAt = new Date(startedAt.getTime() + 24 * 60 * 60 * 1000)

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      tier: tier as 'starter' | 'pro' | 'ultra',
      subscription_status: 'active',
      subscription_started_at: startedAt.toISOString(),
      subscription_expires_at: expiresAt.toISOString(),
      token_pool_total: tokenPool,
      token_pool_used: 0,
      token_pool_remaining: tokenPool,
      updated_at: new Date().toISOString(),
    })
    .eq('id', transaction.user_id)

  if (profileError) throw new Error(`Failed to update profile: ${profileError.message}`)

  const { error: subError } = await supabase
    .from('subscriptions')
    .insert({
      user_id: transaction.user_id,
      tier: tier as 'starter' | 'pro' | 'ultra',
      status: 'active',
      started_at: startedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      token_pool_total: tokenPool,
      token_pool_used: 0,
      amount_idr: transaction.amount_idr,
    })

  if (subError) throw new Error(`Failed to insert subscription: ${subError.message}`)
}
