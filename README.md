# Sribuai APIRouter

Platform AI API Gateway berbasis Next.js 14 dengan sistem billing 24 jam dan integrasi KlikQRIS.

## Setup Development

### Prerequisites

- Node.js 18+
- Supabase account
- 9router instance (VPS/Docker)
- KlikQRIS merchant account

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Buat project di [supabase.com](https://supabase.com)
2. Copy project URL dan keys ke `.env.local`
3. Jalankan migrations SQL:

#### Database Schema

Buka SQL Editor di Supabase Dashboard, lalu jalankan SQL dari file:
- `../prd/01-database-schema.md` (copy semua SQL queries)

Atau jalankan satu per satu:

```sql
-- 1. Buat table profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  tier text not null default 'none' check (tier in ('none', 'starter', 'pro', 'ultra')),
  subscription_status text not null default 'inactive' check (subscription_status in ('active', 'inactive', 'expired', 'suspended')),
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

create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

create index profiles_tier_idx on public.profiles(tier);
create index profiles_subscription_status_idx on public.profiles(subscription_status);
create index profiles_is_admin_idx on public.profiles(is_admin);
```

**Lanjutkan dengan table lain:** api_keys, usage_logs, subscriptions, transactions, model_configs, admin_settings

#### Database Functions

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

**Lengkapi dengan functions:** check_and_use_quota, update_updated_at triggers

### 3. Setup Environment Variables

Copy `.env.local` dan isi dengan credentials Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

NINEROUTER_BASE_URL=http://your-vps:20128
NINEROUTER_API_KEY=sk_9router

KLIKQRIS_API_KEY=your_key
KLIKQRIS_MERCHANT_ID=your_id
KLIKQRIS_WEBHOOK_SECRET=your_secret

NEXT_PUBLIC_APP_URL=http://localhost:3000
API_KEY_ENCRYPTION_SECRET=generate-random-32-chars
CRON_SECRET=generate-random-string
```

### 4. Setup 9router

Ikuti [9router README](https://github.com/decolua/9router):

```bash
# Clone 9router
git clone https://github.com/decolua/9router.git
cd 9router

# Install & run
npm install
npm run build
PORT=20128 npm run start
```

Atau via Docker:

```bash
docker run -d -p 20128:20128 decolua/9router:latest
```

### 5. Run Development Server

```bash
npm run dev
```

Akses:
- Frontend: http://localhost:3000
- API: http://localhost:3000/api/v1/chat/completions

### 6. Setup Admin User

Setelah register user pertama via `/register`, set sebagai admin:

```sql
update public.profiles set is_admin = true where email = 'your@email.com';
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, register, forgot password
│   ├── (dashboard)/         # User dashboard (7 pages)
│   ├── (admin)/             # Admin dashboard (9 pages)
│   ├── (marketing)/         # Landing, docs, bantuan
│   ├── api/
│   │   ├── v1/[...path]/    # AI API proxy ke 9router
│   │   ├── payment/         # KlikQRIS payment flow
│   │   ├── webhooks/        # KlikQRIS webhook handler
│   │   └── cron/            # Quota reset cron
│   └── auth/callback/       # OAuth callback
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── marketing/           # Landing page components
│   ├── dashboard/           # Dashboard components
│   └── admin/               # Admin components
├── lib/
│   ├── supabase/            # Supabase client
│   ├── api-key.ts           # API key hashing
│   ├── klikqris.ts          # KlikQRIS client
│   ├── subscription.ts      # Subscription activation
│   ├── usage-logger.ts      # Usage logging
│   └── rate-limiter.ts      # Rate limiting
└── types/
    └── database.ts          # Supabase types
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **UI:** shadcn/ui + Tailwind CSS + Efferd registry
- **Database:** Supabase (PostgreSQL + Auth + Realtime)
- **State:** React Query + Zustand
- **AI Routing:** 9router
- **Payment:** KlikQRIS
- **Deploy:** Vercel

## PRD Documentation

Lihat folder `../prd/` untuk dokumentasi lengkap:
- `00-overview.md` - Overview & arsitektur
- `01-database-schema.md` - Database schema lengkap
- `02-authentication.md` - Auth flow & middleware
- `03-landing-page.md` - Landing page spec
- `04-dashboard-user.md` - User dashboard spec
- `05-dashboard-admin.md` - Admin dashboard spec
- `06-api-proxy.md` - API proxy implementation
- `07-payment-integration.md` - KlikQRIS integration
- `08-documentation.md` - Docs pages

## Next Steps

1. ✅ Project setup complete
2. ⬜ Implement authentication pages (login, register)
3. ⬜ Build landing page
4. ⬜ Build user dashboard
5. ⬜ Implement payment flow
6. ⬜ Build admin dashboard
7. ⬜ Write documentation pages
8. ⬜ Deploy to Vercel

## Development Checklist

Lihat setiap file PRD untuk checklist detail per fase implementasi.

## License

Private - All Rights Reserved
