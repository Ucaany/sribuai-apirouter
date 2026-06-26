import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

interface LogUsageParams {
  userId: string
  apiKeyId?: string
  model: string
  provider: string
  endpoint: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  statusCode: number
  responseTimeMs: number
  isStreaming: boolean
  errorMessage?: string
  ipAddress?: string
  userAgent?: string
}

export async function logUsage(
  supabase: SupabaseClient<Database>,
  params: LogUsageParams
) {
  try {
    await supabase.from('usage_logs').insert({
      user_id: params.userId,
      api_key_id: params.apiKeyId ?? null,
      model: params.model,
      provider: params.provider,
      endpoint: params.endpoint,
      prompt_tokens: params.promptTokens,
      completion_tokens: params.completionTokens,
      total_tokens: params.totalTokens,
      status_code: params.statusCode,
      response_time_ms: params.responseTimeMs,
      is_streaming: params.isStreaming,
      error_message: params.errorMessage ?? null,
      ip_address: params.ipAddress ?? null,
      user_agent: params.userAgent ?? null,
    })

    if (params.totalTokens > 0) {
      await supabase.rpc('increment_token_count', {
        p_user_id: params.userId,
        p_tokens: params.totalTokens,
      } as never)
    }

    if (params.apiKeyId) {
      await supabase.rpc('increment_api_key_usage', {
        p_api_key_id: params.apiKeyId,
      } as never)
    }
  } catch (err) {
    console.error('[usage-logger] Failed to log usage:', err)
  }
}
