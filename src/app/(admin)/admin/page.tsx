'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { UsersIcon, CreditCardIcon, ZapIcon, TrendingUpIcon, CheckCircleIcon } from 'lucide-react'
import Link from 'next/link'

type StatsData = {
  totalUsers: number
  activeSubs: number
  monthRevenue: number
  totalRevenue: number
  todayRequests: number
  revenueChart: { date: string; amount: number }[]
  recentTransactions: { id: string; type: string; amount_idr: number; status: string; created_at: string; metadata: Record<string, string> }[]
}

export default function AdminPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Ringkasan platform realtime</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold mt-1">{stats?.totalUsers.toLocaleString() ?? 0}</p>
              </div>
              <UsersIcon className="size-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Subs</p>
                <p className="text-2xl font-bold mt-1">{stats?.activeSubs ?? 0}</p>
              </div>
              <CreditCardIcon className="size-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Revenue Bulan Ini</p>
                <p className="text-2xl font-bold mt-1 text-sm">
                  Rp {((stats?.monthRevenue ?? 0) / 1000).toFixed(0)}K
                </p>
              </div>
              <TrendingUpIcon className="size-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Requests Hari Ini</p>
                <p className="text-2xl font-bold mt-1">{stats?.todayRequests.toLocaleString() ?? 0}</p>
              </div>
              <ZapIcon className="size-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue 30 Hari Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats?.revenueChart ?? []}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => `Rp ${v.toLocaleString('id-ID')}`} />
              <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={false} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 text-sm">
            {[
              { label: 'Supabase', status: 'Online' },
              { label: 'Payment Gateway', status: 'Online' },
              { label: 'API Proxy', status: 'Online' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-muted-foreground">{s.label}</span>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="size-4 text-green-500" />
                  <span className="text-green-600 text-xs">{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Transaksi Terbaru</CardTitle>
          <Button variant="ghost" size="sm" render={<Link href="/admin/transactions" />} nativeButton={false}>
            Lihat semua
          </Button>
        </CardHeader>
        <CardContent>
          {!stats?.recentTransactions.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">Belum ada transaksi.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-4">ID</th>
                    <th className="text-left py-2 pr-4">Tipe</th>
                    <th className="text-right py-2 pr-4">Jumlah</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-left py-2">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{tx.id.slice(0, 8)}...</td>
                      <td className="py-2 pr-4 capitalize">{tx.type}</td>
                      <td className="py-2 pr-4 text-right">Rp {tx.amount_idr.toLocaleString('id-ID')}</td>
                      <td className="py-2 pr-4">
                        <Badge variant="outline" className="text-xs text-green-600 border-green-600">{tx.status}</Badge>
                      </td>
                      <td className="py-2 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
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
