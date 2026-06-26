'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { DownloadIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

type UsageLog = Database['public']['Tables']['usage_logs']['Row']
type ApiKey = Database['public']['Tables']['api_keys']['Row']

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6']
const PAGE_SIZE = 50

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function UsagePage() {
  const [logs, setLogs] = useState<UsageLog[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const [filterDays, setFilterDays] = useState('7')
  const [filterModel, setFilterModel] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterKeyId, setFilterKeyId] = useState('all')

  const [chartData, setChartData] = useState<{ date: string; success: number; error: number }[]>([])
  const [modelPieData, setModelPieData] = useState<{ name: string; value: number }[]>([])
  const [summary, setSummary] = useState({ totalRequests: 0, totalTokens: 0, errorRate: 0, avgLatency: 0 })

  const [allModels, setAllModels] = useState<string[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - parseInt(filterDays))

    let query = supabase
      .from('usage_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .gte('created_at', daysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (filterModel !== 'all') query = query.eq('model', filterModel)
    if (filterStatus === 'success') query = query.lt('status_code', 300)
    if (filterStatus === 'error') query = query.gte('status_code', 300)
    if (filterKeyId !== 'all') query = query.eq('api_key_id', filterKeyId)

    const { data, count } = await query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (data) {
      setLogs(data)
      setTotalCount(count ?? 0)

      const models = Array.from(new Set(data.map(l => l.model)))
      setAllModels(models)

      const totalReqs = data.length
      const totalToks = data.reduce((a, l) => a + l.total_tokens, 0)
      const errors = data.filter(l => l.status_code >= 300).length
      const avgLat = totalReqs > 0 ? Math.round(data.reduce((a, l) => a + l.response_time_ms, 0) / totalReqs) : 0
      setSummary({
        totalRequests: count ?? totalReqs,
        totalTokens: totalToks,
        errorRate: totalReqs > 0 ? Math.round((errors / totalReqs) * 100 * 10) / 10 : 0,
        avgLatency: avgLat,
      })
    }

    const { data: allLogs } = await supabase
      .from('usage_logs')
      .select('created_at, status_code, model, total_tokens')
      .eq('user_id', user.id)
      .gte('created_at', daysAgo.toISOString())

    if (allLogs) {
      const grouped: Record<string, { success: number; error: number }> = {}
      for (let i = parseInt(filterDays) - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        grouped[key] = { success: 0, error: 0 }
      }
      const modelTokens: Record<string, number> = {}
      for (const log of allLogs) {
        const key = new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        if (grouped[key]) {
          if (log.status_code < 300) grouped[key].success += 1
          else grouped[key].error += 1
        }
        modelTokens[log.model] = (modelTokens[log.model] ?? 0) + log.total_tokens
      }
      setChartData(Object.entries(grouped).map(([date, v]) => ({ date, ...v })))
      setModelPieData(
        Object.entries(modelTokens)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, value]) => ({ name: name.split('/').pop() ?? name, value }))
      )
    }

    const { data: keysData } = await supabase.from('api_keys').select('*').eq('user_id', user.id)
    if (keysData) setApiKeys(keysData)

    setLoading(false)
  }, [filterDays, filterModel, filterStatus, filterKeyId, page])

  useEffect(() => { fetchData() }, [fetchData])

  function exportCsv() {
    const rows = [
      ['Waktu', 'Model', 'API Key ID', 'Prompt Tokens', 'Completion Tokens', 'Total Tokens', 'Status', 'Latency (ms)', 'Error'],
      ...logs.map(l => [
        l.created_at,
        l.model,
        l.api_key_id ?? '',
        l.prompt_tokens,
        l.completion_tokens,
        l.total_tokens,
        l.status_code,
        l.response_time_ms,
        l.error_message ?? '',
      ]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sribuai-usage-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Usage Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Riwayat penggunaan API Anda</p>
        </div>
        <Button size="sm" variant="outline" onClick={exportCsv} disabled={logs.length === 0}>
          <DownloadIcon className="mr-2 size-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <Select value={filterDays} onValueChange={(v) => { if (v) { setFilterDays(v); setPage(0) } }}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Rentang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Hari ini</SelectItem>
            <SelectItem value="7">7 hari</SelectItem>
            <SelectItem value="30">30 hari</SelectItem>
            <SelectItem value="90">90 hari</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterModel} onValueChange={(v) => { if (v) { setFilterModel(v); setPage(0) } }}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Model</SelectItem>
            {allModels.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={(v) => { if (v) { setFilterStatus(v); setPage(0) } }}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterKeyId} onValueChange={(v) => { if (v) { setFilterKeyId(v); setPage(0) } }}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="API Key" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Key</SelectItem>
            {apiKeys.map(k => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Request', value: summary.totalRequests.toLocaleString() },
          { label: 'Total Token', value: summary.totalTokens >= 1_000_000 ? `${(summary.totalTokens / 1_000_000).toFixed(1)}M` : summary.totalTokens.toLocaleString() },
          { label: 'Error Rate', value: `${summary.errorRate}%` },
          { label: 'Avg Latency', value: `${summary.avgLatency}ms` },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Request per Hari</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="success" fill="#10b981" name="Success" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="error" fill="#ef4444" name="Error" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Token per Model</CardTitle>
          </CardHeader>
          <CardContent>
            {modelPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={modelPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {modelPieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => v.toLocaleString()} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-16">Belum ada data.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log Detail</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Tidak ada data untuk filter ini.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs">
                      <th className="text-left py-2 pr-4">Waktu</th>
                      <th className="text-left py-2 pr-4">Model</th>
                      <th className="text-left py-2 pr-4">API Key</th>
                      <th className="text-right py-2 pr-4">Token</th>
                      <th className="text-left py-2 pr-4">Status</th>
                      <th className="text-right py-2">Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <>
                        <tr
                          key={log.id}
                          className="border-b last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                          onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                        >
                          <td className="py-2 pr-4 text-muted-foreground whitespace-nowrap text-xs">{formatTime(log.created_at)}</td>
                          <td className="py-2 pr-4 font-mono text-xs">{log.model}</td>
                          <td className="py-2 pr-4 text-xs text-muted-foreground">
                            {apiKeys.find(k => k.id === log.api_key_id)?.name ?? log.api_key_id?.slice(0, 8) ?? '-'}
                          </td>
                          <td className="py-2 pr-4 text-right">{log.total_tokens.toLocaleString()}</td>
                          <td className="py-2 pr-4">
                            <Badge variant={log.status_code < 300 ? 'outline' : 'destructive'} className="text-xs">
                              {log.status_code}
                            </Badge>
                          </td>
                          <td className="py-2 text-right text-muted-foreground text-xs">{log.response_time_ms}ms</td>
                        </tr>
                        {expandedId === log.id && (
                          <tr key={`${log.id}-detail`} className="bg-muted/30">
                            <td colSpan={6} className="px-4 py-3">
                              <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                                <div><span className="text-muted-foreground">Request ID:</span> <span className="font-mono">{log.request_id ?? '-'}</span></div>
                                <div><span className="text-muted-foreground">Prompt tokens:</span> {log.prompt_tokens.toLocaleString()}</div>
                                <div><span className="text-muted-foreground">Completion tokens:</span> {log.completion_tokens.toLocaleString()}</div>
                                <div><span className="text-muted-foreground">IP:</span> {log.ip_address ?? '-'}</div>
                                {log.error_message && (
                                  <div className="col-span-2 text-red-600">
                                    <span className="text-muted-foreground">Error:</span> {log.error_message}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-muted-foreground">{totalCount.toLocaleString()} total logs</p>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" className="size-8" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                    <ChevronLeftIcon className="size-4" />
                  </Button>
                  <span className="text-xs">{page + 1} / {totalPages || 1}</span>
                  <Button size="icon" variant="outline" className="size-8" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
                    <ChevronRightIcon className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
