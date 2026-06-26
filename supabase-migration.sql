-- ============================================
-- Sribuai APIRouter - Full Database Migration
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. TABLE: profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  tier text not null default 'none'
    check (tier in ('none', 'starter', 'pro', 'ultra')),
  subscription_status text not null default 'inactive'
    check (subscription_status in ('active', 'inactive', 'expired', 'suspended')),
  subscription_started_at timestamptz,
  subscription_expires_at timestamptz,
  token_pool_total bigint not null default 0,
  token_pool_used bigint not null default 0,
  token_pool_remaining bigint not null default 0,
  total_requests_lifetime bigint not null default 0,
  total_tokens_lifetime bigint not null default 0,
  last_request_at timestamptz,
  is_banned boolean not null default false,
  ban_reason text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users view own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

create index if not exists profiles_tier_idx on public.profiles(tier);
create index if not exists profiles_subscription_status_idx on public.profiles(subscription_status);
create index if not exists profiles_is_admin_idx on public.profiles(is_admin);

-- 2. TABLE: api_keys
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  key_hash text unique not null,
  key_preview text not null,
  is_active boolean not null default true,
  last_used_at timestamptz,
  usage_count bigint not null default 0,
  allowed_ips text[],
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint api_keys_name_user_unique unique (user_id, name)
);

alter table public.api_keys enable row level security;

drop policy if exists "Users manage own api keys" on public.api_keys;
create policy "Users manage own api keys" on public.api_keys for all using (auth.uid() = user_id);

create index if not exists api_keys_key_hash_idx on public.api_keys(key_hash);
create index if not exists api_keys_user_id_idx on public.api_keys(user_id);

-- 3. TABLE: usage_logs
create table if not exists public.usage_logs (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  api_key_id uuid references public.api_keys(id) on delete set null,
  model text not null,
  provider text not null,
  endpoint text not null,
  prompt_tokens integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens integer not null default 0,
  status_code integer not null,
  response_time_ms integer not null,
  is_streaming boolean not null default false,
  error_message text,
  ip_address inet,
  user_agent text,
  request_id text,
  created_at timestamptz not null default now()
);

alter table public.usage_logs enable row level security;

drop policy if exists "Users view own logs" on public.usage_logs;
create policy "Users view own logs" on public.usage_logs for select using (auth.uid() = user_id);

create index if not exists usage_logs_user_id_idx on public.usage_logs(user_id);
create index if not exists usage_logs_created_at_idx on public.usage_logs(created_at desc);
create index if not exists usage_logs_model_idx on public.usage_logs(model);
create index if not exists usage_logs_status_code_idx on public.usage_logs(status_code);

-- 4. TABLE: subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  tier text not null check (tier in ('starter', 'pro', 'ultra')),
  status text not null check (status in ('active', 'expired')),
  started_at timestamptz not null,
  expires_at timestamptz not null,
  token_pool_total bigint not null,
  token_pool_used bigint not null default 0,
  amount_idr integer not null,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "Users view own subscription" on public.subscriptions;
create policy "Users view own subscription" on public.subscriptions for select using (auth.uid() = user_id);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_expires_at_idx on public.subscriptions(expires_at);
create index if not exists subscriptions_status_idx on public.subscriptions(status);

-- 5. TABLE: transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('subscription', 'refund')),
  status text not null check (status in ('pending', 'success', 'failed', 'expired')),
  amount_idr integer not null,
  description text,
  payment_method text not null default 'qris',
  gateway_transaction_id text unique,
  gateway_qr_string text,
  gateway_payment_url text,
  metadata jsonb default '{}',
  paid_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

drop policy if exists "Users view own transactions" on public.transactions;
create policy "Users view own transactions" on public.transactions for select using (auth.uid() = user_id);

create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists transactions_gateway_id_idx on public.transactions(gateway_transaction_id);
create index if not exists transactions_status_idx on public.transactions(status);
create index if not exists transactions_created_at_idx on public.transactions(created_at desc);

-- 6. TABLE: webhook_logs
create table if not exists public.webhook_logs (
  id bigserial primary key,
  source text not null,
  event_type text not null,
  payload jsonb not null,
  status text not null check (status in ('received', 'processing', 'success', 'failed')),
  error_message text,
  transaction_id uuid references public.transactions(id) on delete set null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists webhook_logs_status_idx on public.webhook_logs(status);
create index if not exists webhook_logs_transaction_id_idx on public.webhook_logs(transaction_id);
create index if not exists webhook_logs_created_at_idx on public.webhook_logs(created_at desc);

-- 7. TABLE: model_configs
create table if not exists public.model_configs (
  id uuid primary key default gen_random_uuid(),
  model_id text unique not null,
  model_name text not null,
  provider text not null,
  router_model_id text not null,
  context_window integer not null,
  supports_streaming boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.model_configs enable row level security;
drop policy if exists "Anyone can view active models" on public.model_configs;
create policy "Anyone can view active models" on public.model_configs for select using (is_active = true);

create index if not exists model_configs_model_id_idx on public.model_configs(model_id);
create index if not exists model_configs_is_active_idx on public.model_configs(is_active);

-- 8. TABLE: admin_settings
create table if not exists public.admin_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now()
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto update updated_at
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

create or replace trigger api_keys_updated_at before update on public.api_keys
  for each row execute function public.update_updated_at();

create or replace trigger transactions_updated_at before update on public.transactions
  for each row execute function public.update_updated_at();

create or replace trigger model_configs_updated_at before update on public.model_configs
  for each row execute function public.update_updated_at();

-- Auto create profile on register
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Check and use quota (token pool based)
create or replace function public.check_and_use_quota(
  p_user_id uuid,
  p_tokens_requested integer
)
returns jsonb language plpgsql security definer as $$
declare
  v_profile record;
begin
  select * into v_profile from public.profiles where id = p_user_id for update;

  if not found then
    return jsonb_build_object('allowed', false, 'reason', 'User not found');
  end if;

  if v_profile.is_banned then
    return jsonb_build_object('allowed', false, 'reason', coalesce(v_profile.ban_reason, 'Account suspended'));
  end if;

  if v_profile.subscription_status != 'active' then
    return jsonb_build_object('allowed', false, 'reason', 'Subscription inactive. Silakan beli paket.');
  end if;

  if v_profile.subscription_expires_at is null or v_profile.subscription_expires_at < now() then
    update public.profiles set
      subscription_status = 'expired',
      tier = 'none',
      token_pool_remaining = 0,
      updated_at = now()
    where id = p_user_id;
    return jsonb_build_object('allowed', false, 'reason', 'Paket 24 jam telah berakhir. Beli paket baru.');
  end if;

  if v_profile.token_pool_remaining < p_tokens_requested then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'Token pool habis.',
      'token_remaining', v_profile.token_pool_remaining,
      'tier', v_profile.tier
    );
  end if;

  update public.profiles set
    token_pool_used = token_pool_used + p_tokens_requested,
    token_pool_remaining = token_pool_remaining - p_tokens_requested,
    total_requests_lifetime = total_requests_lifetime + 1,
    total_tokens_lifetime = total_tokens_lifetime + p_tokens_requested,
    last_request_at = now(),
    updated_at = now()
  where id = p_user_id;

  return jsonb_build_object(
    'allowed', true,
    'token_remaining', v_profile.token_pool_remaining - p_tokens_requested,
    'expires_at', v_profile.subscription_expires_at
  );
end;
$$;

-- Reset daily quotas (kept for cron compatibility)
create or replace function public.reset_daily_quotas()
returns void language plpgsql security definer as $$
begin
  -- Expire subscriptions yang sudah lewat waktu
  update public.profiles
  set
    subscription_status = 'expired',
    tier = 'none',
    token_pool_remaining = 0,
    updated_at = now()
  where
    subscription_status = 'active'
    and subscription_expires_at < now();
end;
$$;

-- ============================================
-- SEED DATA
-- ============================================

-- Model configs
insert into public.model_configs
  (model_id, model_name, provider, router_model_id, context_window, supports_streaming, description, sort_order)
values
  ('claude-sonnet-4-5', 'Claude Sonnet 4.5', 'Anthropic', 'cc/claude-sonnet-4-5', 200000, true, 'Model terbaru Anthropic dengan kemampuan reasoning tinggi', 1),
  ('claude-opus-4-7', 'Claude Opus 4.7', 'Anthropic', 'cc/claude-opus-4-7', 200000, true, 'Model paling powerful dari Anthropic', 2),
  ('claude-3-5-haiku', 'Claude 3.5 Haiku', 'Anthropic', 'cc/claude-3-5-haiku', 200000, true, 'Model cepat dan efisien untuk tugas ringan', 3),
  ('gpt-4o', 'GPT-4o', 'OpenAI', 'oc/gpt-4o', 128000, true, 'Model flagship OpenAI dengan multimodal', 4),
  ('gpt-4o-mini', 'GPT-4o Mini', 'OpenAI', 'oc/gpt-4o-mini', 128000, true, 'Versi ringan GPT-4o, cepat dan murah', 5),
  ('gpt-4', 'GPT-4', 'OpenAI', 'cx/gpt-5.4', 128000, true, 'GPT-4 dengan performa tinggi', 6),
  ('gpt-3-5-turbo', 'GPT-3.5 Turbo', 'OpenAI', 'oc/gpt-3.5-turbo', 16384, true, 'Cepat dan hemat untuk tugas ringan', 7),
  ('gemini-pro', 'Gemini Pro', 'Google', 'oc/gemini-pro', 32768, true, 'Model Google Gemini Pro', 8),
  ('gemini-1-5-pro', 'Gemini 1.5 Pro', 'Google', 'oc/gemini-1.5-pro', 1000000, true, 'Model Google dengan context window 1M token', 9),
  ('gemini-flash', 'Gemini Flash', 'Google', 'oc/gemini-flash', 1000000, true, 'Model cepat dari Google untuk tugas ringan', 10),
  ('deepseek-v3', 'DeepSeek V3', 'DeepSeek', 'oc/deepseek-v3', 128000, true, 'Model open-source dengan performa tinggi', 11),
  ('deepseek-r1', 'DeepSeek R1', 'DeepSeek', 'oc/deepseek-r1', 128000, true, 'Model reasoning dari DeepSeek', 12),
  ('llama-3-1-70b', 'Llama 3.1 70B', 'Meta', 'oc/llama-3.1-70b', 128000, true, 'Model open-source dari Meta', 13),
  ('llama-3-1-8b', 'Llama 3.1 8B', 'Meta', 'oc/llama-3.1-8b', 128000, true, 'Model ringan untuk deployment lokal', 14),
  ('mistral-large', 'Mistral Large', 'Mistral', 'oc/mistral-large', 128000, true, 'Model flagship dari Mistral AI', 15),
  ('mistral-medium', 'Mistral Medium', 'Mistral', 'oc/mistral-medium', 128000, true, 'Model seimbang dari Mistral AI', 16),
  ('qwen-2-5-72b', 'Qwen 2.5 72B', 'Alibaba', 'oc/qwen-2.5-72b', 128000, true, 'Model dari Alibaba Cloud', 17),
  ('yi-large', 'Yi Large', 'Yi', 'oc/yi-large', 200000, true, 'Model dari Yi dengan context panjang', 18)
on conflict (model_id) do nothing;

-- Admin settings
insert into public.admin_settings (key, value, description) values
  ('tier_pricing_idr',
   '{"starter": 10000, "pro": 15900, "ultra": 20000}',
   'Harga paket per 24 jam dalam IDR'),
  ('tier_token_pool',
   '{"starter": 40000000, "pro": 80000000, "ultra": 150000000}',
   'Token pool per paket (40M, 80M, 150M)'),
  ('subscription_duration_hours',
   '24',
   'Durasi langganan dalam jam'),
  ('maintenance_mode', 'false', 'Aktifkan maintenance mode'),
  ('9router_base_url', '"https://your-9router-production-url.com"', 'Base URL 9router instance')
on conflict (key) do nothing;

-- ============================================
-- 9. TABLE: rate_limits
-- ============================================
create table if not exists public.rate_limits (
  ip text primary key,
  count integer not null default 1,
  reset_at timestamptz not null
);

create index if not exists rate_limits_reset_at_idx on public.rate_limits(reset_at);

-- ============================================
-- 10. TABLE: promos
-- ============================================
create table if not exists public.promos (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percent integer not null check (discount_percent between 1 and 100),
  max_uses integer not null default 1,
  usage_count integer not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists promos_code_idx on public.promos(code);
create index if not exists promos_is_active_idx on public.promos(is_active);

-- ============================================
-- 10. TABLE: ip_blacklist
-- ============================================
create table if not exists public.ip_blacklist (
  id bigserial primary key,
  ip text not null unique,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists ip_blacklist_ip_idx on public.ip_blacklist(ip);

-- ============================================
-- DONE
-- ============================================
select 'Migration completed successfully!' as result;
