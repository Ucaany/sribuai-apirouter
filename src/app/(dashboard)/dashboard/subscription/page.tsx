'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ShoppingCartIcon, DownloadIcon, CheckIcon, ZapIcon } from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']
type Transaction = Database['public']['Tables']['transactions']['Row']


function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function formatCountdown(expiresAt: string | null): string {
  if (!expiresAt) return '-'
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const hrs = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  return `${hrs} jam ${mins} menit lagi`
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

const TIERS = [
  { name: 'Starter', tokens: '40M', price: 'Rp 10.000', tier: 'starter', tokenNum: 40_000_000 },
  { name: 'Pro', tokens: '80M', price: 'Rp 15.900', tier: 'pro', tokenNum: 80_000_000, popular: true },
  { name: 'Ultra', tokens: '150M', price: 'Rp 20.000', tier: 'ultra', tokenNum: 150_000_000 },
]

export default function SubscriptionPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, txRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    if (profileRes.data) setProfile(profileRes.data)
    if (txRes.data) setTransactions(txRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    )
  }

  const hasActive = profile?.subscription_status === 'active'
  const tokenPct = profile && profile.token_pool_total > 0
    ? Math.round((profile.token_pool_used / profile.token_pool_total) * 100)
    : 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Subscription</h1>
        <p className="text-muted-foreground text-sm mt-1">Status paket dan riwayat pembelian</p>
      </div>

      {hasActive ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">
                    Paket {profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)}
                  </h2>
                  <Badge className="bg-green-500 hover:bg-green-500">Aktif</Badge>
                </div>
                <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
                  <p>Mulai: {formatDate(profile.subscription_started_at!)}</p>
                  <p>Berakhir: {formatDate(profile.subscription_expires_at!)}</p>
                  <p>Sisa token: {formatTokens(profile.token_pool_remaining)} / {formatTokens(profile.token_pool_total)}</p>
                  <p className="font-medium text-foreground">Countdown: {formatCountdown(profile.subscription_expires_at)}</p>
                </div>
              </div>
              <Button size="sm" render={<Link href="/dashboard/topup" />} nativeButton={false}>
                <ShoppingCartIcon className="mr-2 size-4" /> Beli Paket Lagi
              </Button>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Token terpakai</span>
                <span>{tokenPct}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${
                    tokenPct >= 90 ? 'bg-red-500' : tokenPct >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${tokenPct}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm mb-4">Tidak ada paket aktif.</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mt-4">
              {TIERS.map((t) => (
                <div
                  key={t.tier}
                  className={`relative overflow-visible flex flex-col gap-3 rounded-xl border p-4 transition-shadow hover:shadow-md ${
                    t.popular ? 'border-primary bg-primary/5' : 'bg-card'
                  }`}
                >
                  {t.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground z-10">
                      Populer
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{t.name}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ZapIcon className="size-3" />{t.tokens}
                    </span>
                  </div>
                  <p className="text-lg font-bold">{t.price}<span className="text-xs font-normal text-muted-foreground">/24 jam</span></p>
                  <Button
                    variant={t.popular ? 'default' : 'outline'}
                    className="w-full rounded-lg py-2 text-sm font-medium transition-all hover:scale-[1.02] active:scale-95"
                    render={<Link href={`/dashboard/topup?tier=${t.tier}`} />}
                    nativeButton={false}
                  >
                    <ShoppingCartIcon className="mr-2 size-4" /> Beli Sekarang
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Perbandingan Paket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left py-2 pr-4">Fitur</th>
                  <th className="text-center py-2 pr-4">Starter</th>
                  <th className="text-center py-2 pr-4">Pro</th>
                  <th className="text-center py-2">Ultra</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Harga/24 jam', 'Rp 10.000', 'Rp 15.900', 'Rp 20.000'],
                  ['Token pool', '40M', '80M', '150M'],
                  ['Semua model', 'check', 'check', 'check'],
                  ['Durasi', '24 jam', '24 jam', '24 jam'],
                ].map(([feature, ...values]) => (
                  <tr key={feature} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-muted-foreground">{feature}</td>
                    {values.map((v, i) => (
                      <td key={i} className="text-center py-2 pr-4 font-medium">
                        {v === 'check'
                          ? <CheckIcon className="mx-auto size-4 text-green-500" />
                          : v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Riwayat Pembelian</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada riwayat transaksi.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-4">Tanggal</th>
                    <th className="text-left py-2 pr-4">Paket</th>
                    <th className="text-right py-2 pr-4">Jumlah</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-right py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-muted-foreground text-xs whitespace-nowrap">{formatDate(tx.created_at)}</td>
                      <td className="py-2 pr-4">
                        <span className="capitalize">{tx.type}</span>
                        {tx.description && <span className="text-xs text-muted-foreground ml-1">({tx.description})</span>}
                      </td>
                      <td className="py-2 pr-4 text-right font-medium">
                        Rp {tx.amount_idr.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 pr-4">
                        <Badge
                          variant={
                            tx.status === 'success' ? 'outline'
                              : tx.status === 'pending' ? 'secondary'
                              : 'destructive'
                          }
                          className={`text-xs ${
                            tx.status === 'success' ? 'text-green-600 border-green-600' : ''
                          }`}
                        >
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="py-2 text-right">
                        <Button size="sm" variant="ghost" className="text-xs h-7">
                          <DownloadIcon className="mr-1 size-3" /> Invoice
                        </Button>
                      </td>
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
