'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  ZapIcon,
  KeyIcon,
  ClockIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  CircleIcon,
  ShoppingCartIcon,
} from 'lucide-react'
import Link from 'next/link'

type Profile = Database['public']['Tables']['profiles']['Row']
type UsageLog = Database['public']['Tables']['usage_logs']['Row']

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function formatTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} jam lalu`
  return `${Math.floor(hrs / 24)} hari lalu`
}

function formatCountdown(expiresAt: string | null): string {
  if (!expiresAt) return '-'
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const hrs = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  return `${hrs}j ${mins}m lagi`
}

function getProgressColor(pct: number): string {
  if (pct >= 90) return 'bg-red-500'
  if (pct >= 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [recentLogs, setRecentLogs] = useState<UsageLog[]>([])
  const [apiKeyCount, setApiKeyCount] = useState(0)
  const [chartData, setChartData] = useState<{ date: string; requests: number; tokens: number }[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, logsRes, keysRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase
        .from('usage_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('api_keys')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true),
    ])

    if (profileRes.data) setProfile(profileRes.data)
    if (logsRes.data) setRecentLogs(logsRes.data)
    if (keysRes.count !== null) setApiKeyCount(keysRes.count)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: chartLogs } = await supabase
      .from('usage_logs')
      .select('created_at, total_tokens')
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString())

    if (chartLogs) {
      const grouped: Record<string, { requests: number; tokens: number }> = {}
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })
        grouped[key] = { requests: 0, tokens: 0 }
      }
      for (const log of chartLogs) {
        const key = new Date(log.created_at).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })
        if (grouped[key]) {
          grouped[key].requests += 1
          grouped[key].tokens += log.total_tokens
        }
      }
      setChartData(Object.entries(grouped).map(([date, v]) => ({ date, ...v })))
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()

    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      channel = supabase
        .channel('dashboard-profile')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
          (payload) => {
            setProfile(payload.new as Profile)
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'usage_logs', filter: `user_id=eq.${user.id}` },
          () => { fetchData() }
        )
        .subscribe()
    })

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    )
  }

  const hasActiveSubscription = profile?.subscription_status === 'active'
  const tokenPct = profile && profile.token_pool_total > 0
    ? Math.round((profile.token_pool_used / profile.token_pool_total) * 100)
    : 0
  const hasApiKey = apiKeyCount > 0
  const hasRequest = (profile?.total_requests_lifetime ?? 0) > 0
  const isNewUser = !hasApiKey || !hasRequest

  return (
      <div className="flex flex-col gap-4 w-full max-w-full">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Selamat datang kembali, {profile?.full_name?.split(' ')[0] || 'User'}
        </p>
      </div>

      {isNewUser && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Mulai dalam 3 langkah</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="text-green-500 size-5 shrink-0" />
                <span className="text-sm text-muted-foreground line-through">Buat akun</span>
              </div>
              <div className="flex items-center gap-3">
                {hasApiKey
                  ? <CheckCircleIcon className="text-green-500 size-5 shrink-0" />
                  : <CircleIcon className="text-muted-foreground size-5 shrink-0" />}
                <span className={`text-sm ${hasApiKey ? 'text-muted-foreground line-through' : ''}`}>
                  <Link href="/dashboard/api-keys" className="underline underline-offset-4">Buat API key pertama</Link>
                </span>
              </div>
              <div className="flex items-center gap-3">
                {hasRequest
                  ? <CheckCircleIcon className="text-green-500 size-5 shrink-0" />
                  : <CircleIcon className="text-muted-foreground size-5 shrink-0" />}
                <span className={`text-sm ${hasRequest ? 'text-muted-foreground line-through' : ''}`}>
                  Buat request pertama
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Token Terpakai</p>
                <p className="text-2xl font-bold mt-1">{formatTokens(profile?.token_pool_used ?? 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">dari {formatTokens(profile?.token_pool_total ?? 0)}</p>
              </div>
              <ZapIcon className="size-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Token Tersisa</p>
                <p className="text-2xl font-bold mt-1">{formatTokens(profile?.token_pool_remaining ?? 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">tersisa di pool</p>
              </div>
              <TrendingUpIcon className="size-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Waktu Berakhir</p>
                <p className="text-2xl font-bold mt-1 leading-tight">
                  {hasActiveSubscription ? formatCountdown(profile.subscription_expires_at) : '-'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {hasActiveSubscription ? 'countdown timer' : 'Tidak ada paket'}
                </p>
              </div>
              <ClockIcon className="size-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">API Keys Aktif</p>
                <p className="text-2xl font-bold mt-1">{apiKeyCount}</p>
                <p className="text-xs text-muted-foreground mt-1">keys aktif</p>
              </div>
              <KeyIcon className="size-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-medium leading-none">
                Token Pool{profile?.tier && profile.tier !== 'none' ? ` (${profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)})` : ''}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                {formatTokens(profile?.token_pool_used ?? 0)} dari {formatTokens(profile?.token_pool_total ?? 0)} token terpakai
              </p>
            </div>
            {hasActiveSubscription ? (
              <Badge variant="outline" className="text-green-600 border-green-600 whitespace-nowrap shrink-0">
                Aktif: {new Date(profile.subscription_expires_at!).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} WIB
              </Badge>
            ) : (
              <Badge variant="destructive" className="shrink-0">Tidak aktif</Badge>
            )}
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all ${getProgressColor(tokenPct)}`}
              style={{ width: `${tokenPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{tokenPct}% terpakai</p>
          {!hasActiveSubscription && (
            <Button className="mt-4" size="sm" render={<Link href="/dashboard/topup" />} nativeButton={false}>
              <ShoppingCartIcon className="mr-2 size-4" />Beli Paket
            </Button>
          )}
        </CardContent>
      </Card>

      {!hasActiveSubscription && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { name: 'Starter', tokens: '40M', price: 'Rp 10.000', tier: 'starter' },
            { name: 'Pro', tokens: '80M', price: 'Rp 15.900', tier: 'pro', popular: true },
            { name: 'Ultra', tokens: '150M', price: 'Rp 20.000', tier: 'ultra' },
          ].map((p) => (
            <Card key={p.tier} className={p.popular ? 'border-primary' : ''}>
              <CardContent className="pt-6 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold">{p.name}</p>
                  {p.popular
                    ? <Badge className="text-xs px-2 py-0.5">Populer</Badge>
                    : <span className="h-5" />}
                </div>
                <p className="text-2xl font-bold leading-none">{p.tokens} Token</p>
                <p className="text-sm text-muted-foreground mt-1.5">{p.price} / 24 jam</p>
                <Button className="w-full mt-4 justify-center" variant="default" size="sm" render={<Link href={`/dashboard/topup?tier=${p.tier}`} />} nativeButton={false}>
                  Beli Sekarang
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Aktivitas 7 Hari Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                cursor={{ fill: 'currentColor', fillOpacity: 0.05 }}
              />
              <Bar dataKey="requests" fill="#3b82f6" name="Requests" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
          <Button variant="ghost" size="sm" render={<Link href="/dashboard/usage" />} nativeButton={false}>
            Lihat semua
          </Button>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada request.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-4">Waktu</th>
                    <th className="text-left py-2 pr-4">Model</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-right py-2 pr-4">Token</th>
                    <th className="text-right py-2">Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="py-2 pr-4 text-muted-foreground whitespace-nowrap">{formatTime(log.created_at)}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{log.model}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={log.status_code < 300 ? 'outline' : 'destructive'} className="text-xs">
                          {log.status_code}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4 text-right">{log.total_tokens.toLocaleString()}</td>
                      <td className="py-2 text-right text-muted-foreground">{log.response_time_ms}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
