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
import { SearchIcon, DownloadIcon } from 'lucide-react'

type Transaction = {
  id: string
  user_id: string
  type: string
  status: string
  amount_idr: number
  description: string | null
  payment_method: string
  gateway_transaction_id: string | null
  created_at: string
  profiles: { email: string; full_name: string | null } | null
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchTx = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filterType !== 'all') params.set('type', filterType)
    if (filterStatus !== 'all') params.set('status', filterStatus)
    if (dateFrom) params.set('from', dateFrom)
    if (dateTo) params.set('to', dateTo + 'T23:59:59')
    const res = await fetch(`/api/admin/transactions?${params}`)
    const data = await res.json()
    setTransactions(data.transactions ?? [])
    setLoading(false)
  }, [search, filterType, filterStatus, dateFrom, dateTo])

  useEffect(() => {
    const t = setTimeout(() => fetchTx(), 300)
    return () => clearTimeout(t)
  }, [fetchTx])

  function exportCsv() {
    const rows = [
      ['ID', 'User', 'Tipe', 'Jumlah', 'Status', 'Gateway ID', 'Waktu'],
      ...transactions.map(tx => [
        tx.id,
        tx.profiles?.email ?? tx.user_id,
        tx.type,
        tx.amount_idr,
        tx.status,
        tx.gateway_transaction_id ?? '',
        tx.created_at,
      ]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const statusColor: Record<string, string> = {
    success: 'text-green-600 border-green-600',
    pending: '',
    failed: '',
    expired: '',
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">{transactions.length} transaksi</p>
        </div>
        <Button size="sm" variant="outline" onClick={exportCsv} disabled={!transactions.length}>
          <DownloadIcon className="mr-2 size-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={(v) => { if (v) setFilterType(v) }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="subscription">Subscription</SelectItem>
            <SelectItem value="refund">Refund</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(v) => { if (v) setFilterStatus(v) }}>
          <SelectTrigger className="w-36">
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
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Tidak ada transaksi ditemukan.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-3 pr-4">ID</th>
                    <th className="text-left py-3 pr-4">User</th>
                    <th className="text-left py-3 pr-4">Tipe</th>
                    <th className="text-right py-3 pr-4">Jumlah</th>
                    <th className="text-left py-3 pr-4">Status</th>
                    <th className="text-left py-3 pr-4">Waktu</th>
                    <th className="text-right py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{tx.id.slice(0, 8)}...</td>
                      <td className="py-3 pr-4">
                        <p className="text-xs">{tx.profiles?.email ?? tx.user_id.slice(0, 8)}</p>
                        {tx.profiles?.full_name && <p className="text-xs text-muted-foreground">{tx.profiles.full_name}</p>}
                      </td>
                      <td className="py-3 pr-4 capitalize">{tx.type}</td>
                      <td className="py-3 pr-4 text-right font-medium">Rp {tx.amount_idr.toLocaleString('id-ID')}</td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={tx.status === 'success' ? 'outline' : tx.status === 'pending' ? 'secondary' : 'destructive'}
                          className={`text-xs ${statusColor[tx.status] ?? ''}`}
                        >
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(tx.created_at)}</td>
                      <td className="py-3 text-right">
                        {tx.status === 'success' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 text-red-600 border-red-600 hover:bg-red-50"
                            onClick={async () => {
                              if (!confirm(`Refund transaksi Rp ${tx.amount_idr.toLocaleString('id-ID')}?`)) return
                              await fetch('/api/admin/transactions/refund', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ transaction_id: tx.id, reason: 'Admin refund' }),
                              })
                              fetchTx()
                            }}
                          >
                            Refund
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
