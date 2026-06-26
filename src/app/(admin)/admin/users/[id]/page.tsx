'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/hooks/use-toast'
import { ArrowLeftIcon, BanIcon, CheckCircleIcon, TrashIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Database } from '@/types/database'
import Link from 'next/link'

type Profile = Database['public']['Tables']['profiles']['Row']
type ApiKey = Database['public']['Tables']['api_keys']['Row']
type Transaction = Database['public']['Tables']['transactions']['Row']
type UsageLog = Database['public']['Tables']['usage_logs']['Row']

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function AdminUserDetailPage() {
  const params = useParams()
  const userId = params.id as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([])
  const [loading, setLoading] = useState(true)

  const [banReason, setBanReason] = useState('')
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [tierValue, setTierValue] = useState<string>('none')
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/admin/users/${userId}`)
    const data = await res.json()
    setProfile(data.profile)
    setApiKeys(data.apiKeys ?? [])
    setTransactions(data.transactions ?? [])
    setUsageLogs(data.usageLogs ?? [])
    if (data.profile) setTierValue(data.profile.tier)
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleUpdate(update: Record<string, unknown>) {
    setSaving(true)
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    })
    const data = await res.json()
    if (!res.ok) {
      toast({ title: 'Error', description: data.error, variant: 'destructive' })
    } else {
      toast({ title: 'Berhasil diperbarui!' })
      await fetchData()
    }
    setSaving(false)
  }

  async function handleBan() {
    await handleUpdate({ is_banned: true, ban_reason: banReason || 'Melanggar ketentuan layanan' })
    setBanDialogOpen(false)
    setBanReason('')
  }

  async function handleUnban() {
    await handleUpdate({ is_banned: false, ban_reason: null })
  }

  async function handleRevokeKey(keyId: string) {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.from('api_keys').update({ is_active: false }).eq('id', keyId)
    await fetchData()
    toast({ title: 'API key dicabut.' })
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-64">
        <p className="text-muted-foreground">User tidak ditemukan.</p>
        <Button variant="outline" size="sm" render={<Link href="/admin/users" />} nativeButton={false}><ArrowLeftIcon className="mr-2 size-4" />Kembali</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" render={<Link href="/admin/users" />} nativeButton={false}>
          <ArrowLeftIcon className="mr-2 size-4" /> Kembali
        </Button>
        <h1 className="text-2xl font-semibold">User Detail</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <CardContent className="pt-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={profile.avatar_url ?? ''} />
                  <AvatarFallback>{(profile.full_name ?? profile.email).charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{profile.full_name ?? '-'}</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="capitalize">{profile.tier}</Badge>
                <Badge variant={profile.is_banned ? 'destructive' : 'outline'} className="text-green-600 border-green-600">
                  {profile.is_banned ? 'Banned' : 'Active'}
                </Badge>
                {profile.is_admin && <Badge>Admin</Badge>}
              </div>

              <div className="text-xs text-muted-foreground flex flex-col gap-1">
                <p>Total lifetime requests: {profile.total_requests_lifetime.toLocaleString()}</p>
                <p>Total lifetime tokens: {profile.total_tokens_lifetime.toLocaleString()}</p>
                <p>Bergabung: {formatDate(profile.created_at)}</p>
                {profile.is_banned && profile.ban_reason && (
                  <p className="text-red-500">Ban reason: {profile.ban_reason}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {profile.is_banned ? (
                <Button size="sm" variant="outline" onClick={handleUnban} disabled={saving}>
                  <CheckCircleIcon className="mr-2 size-4" /> Unban User
                </Button>
              ) : (
                <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
                  <DialogTrigger render={<Button size="sm" variant="destructive" />}>
                    <BanIcon className="mr-2 size-4" /> Ban User
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Ban User</DialogTitle></DialogHeader>
                    <div className="flex flex-col gap-4">
                      <Label>Alasan ban</Label>
                      <Input
                        placeholder="Melanggar ketentuan layanan"
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                      />
                      <Button variant="destructive" onClick={handleBan} disabled={saving}>
                        {saving ? 'Memproses...' : 'Konfirmasi Ban'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              <div className="flex flex-col gap-2">
                <Label className="text-xs">Ubah Tier Manual</Label>
                <div className="flex gap-2">
                  <Select value={tierValue} onValueChange={(v) => { if (v) setTierValue(v) }}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Free</SelectItem>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="ultra">Ultra</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={() => handleUpdate({ tier: tierValue })}
                    disabled={saving || tierValue === profile.tier}
                  >
                    Simpan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">API Keys</CardTitle></CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada API key.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between border rounded-md p-3">
                      <div>
                        <p className="font-medium text-sm">{key.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{key.key_preview}...xxxx</p>
                        <p className="text-xs text-muted-foreground mt-1">Usage: {key.usage_count.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={key.is_active ? 'outline' : 'secondary'} className="text-xs">
                          {key.is_active ? 'Active' : 'Revoked'}
                        </Badge>
                        {key.is_active && (
                          <Button size="sm" variant="ghost" className="size-8 p-0" onClick={() => handleRevokeKey(key.id)}>
                            <TrashIcon className="size-3 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Riwayat Transaksi</CardTitle></CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada transaksi.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground text-xs">
                        <th className="text-left py-2 pr-4">Tanggal</th>
                        <th className="text-left py-2 pr-4">Tipe</th>
                        <th className="text-right py-2 pr-4">Jumlah</th>
                        <th className="text-left py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 10).map((tx) => (
                        <tr key={tx.id} className="border-b last:border-0">
                          <td className="py-2 pr-4 text-xs text-muted-foreground">{formatDateTime(tx.created_at)}</td>
                          <td className="py-2 pr-4 capitalize">{tx.type}</td>
                          <td className="py-2 pr-4 text-right">Rp {tx.amount_idr.toLocaleString('id-ID')}</td>
                          <td className="py-2">
                            <Badge
                              variant={tx.status === 'success' ? 'outline' : tx.status === 'pending' ? 'secondary' : 'destructive'}
                              className={`text-xs ${tx.status === 'success' ? 'text-green-600 border-green-600' : ''}`}
                            >
                              {tx.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Usage Logs (100 terakhir)</CardTitle></CardHeader>
            <CardContent>
              {usageLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada usage log.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground text-xs">
                        <th className="text-left py-2 pr-4">Waktu</th>
                        <th className="text-left py-2 pr-4">Model</th>
                        <th className="text-right py-2 pr-4">Token</th>
                        <th className="text-left py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usageLogs.map((log) => (
                        <tr key={log.id} className="border-b last:border-0">
                          <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                          <td className="py-2 pr-4 font-mono text-xs">{log.model}</td>
                          <td className="py-2 pr-4 text-right">{log.total_tokens.toLocaleString()}</td>
                          <td className="py-2">
                            <Badge variant={log.status_code < 300 ? 'outline' : 'destructive'} className="text-xs">
                              {log.status_code}
                            </Badge>
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
      </div>
    </div>
  )
}
