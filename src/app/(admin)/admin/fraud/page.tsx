'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { ShieldAlertIcon, XCircleIcon, PlusIcon, RefreshCwIcon, AlertTriangleIcon, CheckCircleIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type FlaggedUser = {
  id: string
  email: string
  full_name: string | null
  tier: string
  is_banned: boolean
  total_requests_lifetime: number
  created_at: string
}

const FRAUD_RULES = [
  'Request dari >10 IP berbeda dalam 1 jam',
  'Error rate >50% dalam 100 request terakhir',
  'Token usage >5x rata-rata tier dalam 1 hari',
  'Transaksi failed >3x dalam 24 jam',
  'Account baru dengan request volume tinggi',
]

export default function AdminFraudPage() {
  const [flagged, setFlagged] = useState<FlaggedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [ipInput, setIpInput] = useState('')
  const [blacklistDialogOpen, setBlacklistDialogOpen] = useState(false)
  const [addingIp, setAddingIp] = useState(false)
  const [banning, setBanning] = useState<string | null>(null)

  const fetchFlagged = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/fraud')
    const data = await res.json()
    setFlagged(data.flagged ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchFlagged() }, [fetchFlagged])

  async function handleUnban(userId: string) {
    setBanning(userId)
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_banned: false, ban_reason: null }),
    })
    if (res.ok) {
      toast({ title: 'User di-unban.' })
      fetchFlagged()
    }
    setBanning(null)
  }

  async function handleAddIp() {
    const ips = ipInput.split('\n').map(s => s.trim()).filter(Boolean)
    if (!ips.length) return
    setAddingIp(true)
    const res = await fetch('/api/admin/fraud/blacklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips }),
    })
    if (res.ok) {
      toast({ title: `${ips.length} IP ditambahkan ke blacklist.` })
      setIpInput('')
      setBlacklistDialogOpen(false)
    } else {
      toast({ title: 'Error', description: 'Gagal menambah IP', variant: 'destructive' })
    }
    setAddingIp(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Fraud Detection</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {flagged.length} user terflag / dibanned
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={fetchFlagged}>
            <RefreshCwIcon className="mr-2 size-4" /> Refresh
          </Button>
          <Dialog open={blacklistDialogOpen} onOpenChange={setBlacklistDialogOpen}>
            <DialogTrigger render={<Button size="sm" variant="destructive" />}>
              <PlusIcon className="mr-2 size-4" /> Blacklist IP
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Tambah IP ke Blacklist</DialogTitle></DialogHeader>
              <div className="flex flex-col gap-4">
                <Label>IP Address (satu per baris)</Label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono h-32 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  placeholder="192.168.1.1\n10.0.0.0/24"
                />
                <Button onClick={handleAddIp} disabled={addingIp || !ipInput.trim()}>
                  {addingIp ? 'Menambahkan...' : 'Tambah ke Blacklist'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2">
          <ShieldAlertIcon className="size-4" /> Auto-Flagging Rules
        </CardTitle></CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {FRAUD_RULES.map((rule, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <AlertTriangleIcon className="size-4 shrink-0 text-amber-500 mt-0.5" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Banned / Flagged Users</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            </div>
          ) : flagged.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12 flex items-center justify-center gap-2"><CheckCircleIcon className="size-4 text-green-500" /> Tidak ada user terflag. Platform aman.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-3 pr-4">User</th>
                    <th className="text-left py-3 pr-4">Tier</th>
                    <th className="text-right py-3 pr-4">Total Requests</th>
                    <th className="text-left py-3 pr-4">Bergabung</th>
                    <th className="text-left py-3 pr-4">Status</th>
                    <th className="text-right py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {flagged.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="py-3 pr-4">
                        <p className="text-xs font-medium">{user.full_name ?? '-'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="capitalize text-xs">{user.tier}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-right">{user.total_requests_lifetime.toLocaleString()}</td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="destructive" className="text-xs">Banned</Badge>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7"
                            render={<a href={`/admin/users/${user.id}`} />}
                            nativeButton={false}
                          >
                            Detail
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => handleUnban(user.id)}
                            disabled={banning === user.id}
                          >
                            <XCircleIcon className="mr-1 size-3" /> Unban
                          </Button>
                        </div>
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
