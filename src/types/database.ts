export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          tier: 'none' | 'starter' | 'pro' | 'ultra'
          subscription_status: 'active' | 'inactive' | 'expired' | 'suspended'
          subscription_started_at: string | null
          subscription_expires_at: string | null
          token_pool_total: number
          token_pool_used: number
          token_pool_remaining: number
          total_requests_lifetime: number
          total_tokens_lifetime: number
          last_request_at: string | null
          is_banned: boolean
          ban_reason: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          tier?: 'none' | 'starter' | 'pro' | 'ultra'
          subscription_status?: 'active' | 'inactive' | 'expired' | 'suspended'
          subscription_started_at?: string | null
          subscription_expires_at?: string | null
          token_pool_total?: number
          token_pool_used?: number
          token_pool_remaining?: number
          total_requests_lifetime?: number
          total_tokens_lifetime?: number
          last_request_at?: string | null
          is_banned?: boolean
          ban_reason?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          name: string
          key_hash: string
          key_preview: string
          is_active: boolean
          last_used_at: string | null
          usage_count: number
          allowed_ips: string[] | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          key_hash: string
          key_preview: string
          is_active?: boolean
          last_used_at?: string | null
          usage_count?: number
          allowed_ips?: string[] | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['api_keys']['Insert']>
      }
      usage_logs: {
        Row: {
          id: number
          user_id: string
          api_key_id: string | null
          model: string
          provider: string
          endpoint: string
          prompt_tokens: number
          completion_tokens: number
          total_tokens: number
          status_code: number
          response_time_ms: number
          is_streaming: boolean
          error_message: string | null
          ip_address: string | null
          user_agent: string | null
          request_id: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          api_key_id?: string | null
          model: string
          provider: string
          endpoint: string
          prompt_tokens?: number
          completion_tokens?: number
          total_tokens?: number
          status_code: number
          response_time_ms: number
          is_streaming?: boolean
          error_message?: string | null
          ip_address?: string | null
          user_agent?: string | null
          request_id?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['usage_logs']['Insert']>
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          tier: 'starter' | 'pro' | 'ultra'
          status: 'active' | 'expired'
          started_at: string
          expires_at: string
          token_pool_total: number
          token_pool_used: number
          amount_idr: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier: 'starter' | 'pro' | 'ultra'
          status?: 'active' | 'expired'
          started_at: string
          expires_at: string
          token_pool_total: number
          token_pool_used?: number
          amount_idr: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'subscription' | 'refund'
          status: 'pending' | 'success' | 'failed' | 'expired'
          amount_idr: number
          description: string | null
          payment_method: string
          gateway_transaction_id: string | null
          gateway_qr_string: string | null
          gateway_payment_url: string | null
          metadata: Json
          paid_at: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'subscription' | 'refund'
          status?: 'pending' | 'success' | 'failed' | 'expired'
          amount_idr: number
          description?: string | null
          payment_method?: string
          gateway_transaction_id?: string | null
          gateway_qr_string?: string | null
          gateway_payment_url?: string | null
          metadata?: Json
          paid_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>
      }
      webhook_logs: {
        Row: {
          id: string
          source: string
          event_type: string
          payload: Json
          status: 'processing' | 'success' | 'failed'
          transaction_id: string | null
          error_message: string | null
          processed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          source: string
          event_type: string
          payload: Json
          status?: 'processing' | 'success' | 'failed'
          transaction_id?: string | null
          error_message?: string | null
          processed_at?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['webhook_logs']['Insert']>
      }
      model_configs: {
        Row: {
          id: string
          model_id: string
          model_name: string
          provider: string
          router_model_id: string
          context_window: number
          supports_streaming: boolean
          is_active: boolean
          sort_order: number
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          model_id: string
          model_name: string
          provider: string
          router_model_id: string
          context_window: number
          supports_streaming?: boolean
          is_active?: boolean
          sort_order?: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['model_configs']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'warning' | 'success' | 'error'
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'info' | 'warning' | 'success' | 'error'
          is_read?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
    }
    Functions: {
      check_and_use_quota: {
        Args: { p_user_id: string; p_tokens_requested: number }
        Returns: Json
      }
      reset_daily_quotas: {
        Args: Record<string, never>
        Returns: void
      }
    }
  }
}
