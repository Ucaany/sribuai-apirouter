# Deployment Checklist - Sribuai APIRouter

## 1. Supabase Setup

- [ ] Buat project baru di [supabase.com](https://supabase.com)
- [ ] Jalankan SQL migration dari `supabase-migration.sql` di SQL Editor
- [ ] Copy credentials:
  - `NEXT_PUBLIC_SUPABASE_URL` → Project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon public key
  - `SUPABASE_SERVICE_ROLE_KEY` → service_role key
- [ ] Setup Email Auth di Authentication > Providers
- [ ] Tambah domain ke Authentication > URL Configuration

## 2. 9router Setup

- [ ] Deploy 9router di VPS/Railway
- [ ] Generate API key
- [ ] Set env vars:
  - `NINEROUTER_BASE_URL` → URL 9router instance
  - `NINEROUTER_API_KEY` → API key

## 3. KlikQRIS Setup

- [ ] Daftar merchant di KlikQRIS
- [ ] Dapatkan credentials:
  - `KLIKQRIS_API_KEY`
  - `KLIKQRIS_MERCHANT_ID`
  - `KLIKQRIS_WEBHOOK_SECRET`
- [ ] Set webhook URL: `https://yourdomain.com/api/webhooks/klikqris`

## 4. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd sribuai-apirouter
vercel --prod
```

### Environment Variables di Vercel

Set semua env vars dari `.env.example` di Vercel Dashboard > Settings > Environment Variables.

## 5. Post-Deployment

- [ ] Test register flow
- [ ] Test login flow
- [ ] Test API key creation
- [ ] Test topup via QRIS
- [ ] Test API call dengan API key
- [ ] Set cron job secret untuk reset quota
- [ ] Setup admin user manual di database

## 6. Set Admin User

```sql
-- Di Supabase SQL Editor
UPDATE profiles SET is_admin = true WHERE email = 'admin@sribuai.my.id';
```

## 7. Custom Domain (Optional)

Di Vercel Dashboard:
1. Add Domain
2. Update DNS records
3. Update `NEXT_PUBLIC_APP_URL` dan `NEXT_PUBLIC_API_URL`

## Troubleshooting

### API returns 401
- Check API key valid
- Check subscription status = 'active'
- Check token_pool_remaining > 0

### Webhook tidak diterima
- Check webhook URL accessible
- Check signature verification
- Check webhook_logs table

### Cron job gagal
- Check CRON_SECRET match
- Check Vercel logs
