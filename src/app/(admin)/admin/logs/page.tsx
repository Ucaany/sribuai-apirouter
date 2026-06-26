'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { RefreshCwIcon } from 'lucide-react'

type WebhookLog = {
  id: string
  user_id: string
  type: string
  status: string
  amount_idr: number
  gateway_transaction_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [retrying, setRetrying] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterStatus !== 'all') params.set('status', filterStatus)
    if (dateFrom) params.set('from', dateFrom)
    if (dateTo) params.set('to', dateTo + 'T23:59:59')
    const res = await fetch(`/api/admin/logs/webhooks?${params}`)
    const data = await res.json()
    setLogs(data.logs ?? [])
    setLoading(false)
  }, [filterStatus, dateFrom, dateTo])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  async function handleRetry(id: string) {
    setRetrying(id)
    const res = await fetch('/api/admin/logs/webhooks/retry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id: id }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast({ title: 'Retry gagal', description: data.error, variant: 'destructive' })
    } else {
      toast({ title: 'Webhook di-retry.' })
      fetchLogs()
    }
    setRetrying(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Webhook Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">{logs.length} log ditemukan</p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchLogs}>
          <RefreshCwIcon className="mr-2 size-4" /> Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36" />
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36" />
      </div>

      <Card>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Tidak ada log ditemukan.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-3 pr-4">Waktu</th>
                    <th className="text-left py-3 pr-4">Source</th>
                    <th className="text-left py-3 pr-4">Event</th>
                    <th className="text-left py-3 pr-4">Transaction ID</th>
                    <th className="text-right py-3 pr-4">Jumlah</th>
                    <th className="text-left py-3 pr-4">Status</th>
                    <th className="text-right py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="py-3 pr-4 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="text-xs">klikqris</Badge>
                      </td>
                      <td className="py-3 pr-4 text-xs">
                        payment.{log.status === 'success' ? 'success' : log.status === 'expired' ? 'expired' : 'pending'}
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                        {log.gateway_transaction_id?.slice(0, 12) ?? log.id.slice(0, 8)}...
                      </td>
                      <td className="py-3 pr-4 text-right">Rp {log.amount_idr.toLocaleString('id-ID')}</td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={log.status === 'success' ? 'outline' : log.status === 'pending' ? 'secondary' : 'destructive'}
                          className={`text-xs ${log.status === 'success' ? 'text-green-600 border-green-600' : ''}`}
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        {(log.status === 'failed' || log.status === 'pending') && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => handleRetry(log.id)}
                            disabled={retrying === log.id}
                          >
                            <RefreshCwIcon className="mr-1 size-3" />
                            {retrying === log.id ? 'Retrying...' : 'Retry'}
                          </Button>
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
