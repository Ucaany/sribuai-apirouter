'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { CheckCircleIcon, AlertCircleIcon } from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6']

type UsageData = {
  totalRequests: number
  totalTokens: number
  errorRate: string
  avgLatency: number
  dailyChart: { date: string; count: number }[]
  modelChart: { model: string; count: number }[]
  errorChart: { code: string; count: number }[]
  providerHealth: { provider: string; requests: number; errorRate: string; avgLatency: number }[]
}

export default function AdminUsagePage() {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState('30')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/usage?days=${days}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }, [days])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Usage Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Statistik penggunaan platform</p>
        </div>
        <Select value={days} onValueChange={(v) => { if (v) setDays(v) }}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 hari</SelectItem>
            <SelectItem value="30">30 hari</SelectItem>
            <SelectItem value="90">90 hari</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Request', value: data?.totalRequests.toLocaleString() ?? 0 },
          { label: 'Total Token', value: data ? (data.totalTokens >= 1_000_000 ? `${(data.totalTokens / 1_000_000).toFixed(1)}M` : data.totalTokens.toLocaleString()) : 0 },
          { label: 'Error Rate', value: `${data?.errorRate ?? 0}%` },
          { label: 'Avg Latency', value: `${data?.avgLatency ?? 0}ms` },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{loading ? '...' : s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Request per Hari</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" /></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.dailyChart ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Requests" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Model Populer</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" /></div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data?.modelChart ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="model" type="category" tick={{ fontSize: 9 }} width={110} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" name="Requests" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Error Analysis</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" /></div>
            ) : (data?.errorChart.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data?.errorChart} dataKey="count" nameKey="code" cx="50%" cy="50%" outerRadius={80}>
                    {(data?.errorChart ?? []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-16 flex items-center justify-center gap-2"><CheckCircleIcon className="size-4 text-green-500" /> Tidak ada error pada periode ini.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Provider Health</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" /></div>
          ) : (data?.providerHealth.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada data provider.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-4">Provider</th>
                    <th className="text-right py-2 pr-4">Requests</th>
                    <th className="text-right py-2 pr-4">Error Rate</th>
                    <th className="text-right py-2 pr-4">Avg Latency</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.providerHealth.map((p) => (
                    <tr key={p.provider} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{p.provider}</td>
                      <td className="py-2 pr-4 text-right">{p.requests.toLocaleString()}</td>
                      <td className="py-2 pr-4 text-right">
                        <span className={parseFloat(p.errorRate) > 5 ? 'text-red-600' : 'text-muted-foreground'}>
                          {p.errorRate}%
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-right text-muted-foreground">{p.avgLatency}ms</td>
                      <td className="py-2">
                        {parseFloat(p.errorRate) > 5 ? (
                          <div className="flex items-center gap-1 text-yellow-600 text-xs">
                            <AlertCircleIcon className="size-3" /> Degraded
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-green-600 text-xs">
                            <CheckCircleIcon className="size-3" /> Online
                          </div>
                        )}
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
