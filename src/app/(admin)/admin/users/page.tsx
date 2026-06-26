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
import Link from 'next/link'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    none: 'secondary',
    starter: 'outline',
    pro: 'default',
    ultra: 'default',
  }
  return <Badge variant={(colors[tier] ?? 'outline') as 'default' | 'secondary' | 'outline' | 'destructive'} className="capitalize text-xs">{tier}</Badge>
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTier, setFilterTier] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filterTier !== 'all') params.set('tier', filterTier)
    if (filterStatus !== 'all') params.set('status', filterStatus)
    const res = await fetch(`/api/admin/users?${params}`)
    const data = await res.json()
    setUsers(data.users ?? [])
    setLoading(false)
  }, [search, filterTier, filterStatus])

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(), 300)
    return () => clearTimeout(t)
  }, [fetchUsers])

  function exportCsv() {
    const rows = [
      ['ID', 'Email', 'Nama', 'Tier', 'Status', 'Requests', 'Bergabung'],
      ...users.map(u => [u.id, u.email, u.full_name ?? '', u.tier, u.is_banned ? 'Banned' : 'Active', u.total_requests_lifetime, u.created_at.slice(0, 10)]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">{users.length} user ditemukan</p>
        </div>
        <Button size="sm" variant="outline" onClick={exportCsv}>
          <DownloadIcon className="mr-2 size-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari email, nama, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterTier} onValueChange={(v) => { if (v) setFilterTier(v) }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tier</SelectItem>
            <SelectItem value="none">Free</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="ultra">Ultra</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(v) => { if (v) setFilterStatus(v) }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Tidak ada user ditemukan.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-3 pr-4">User</th>
                    <th className="text-left py-3 pr-4">Tier</th>
                    <th className="text-left py-3 pr-4">Status</th>
                    <th className="text-right py-3 pr-4">Total Requests</th>
                    <th className="text-left py-3 pr-4">Bergabung</th>
                    <th className="text-right py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="py-3 pr-4">
                        <div>
                          <p className="font-medium text-xs">{user.full_name ?? '-'}</p>
                          <p className="text-muted-foreground text-xs">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4"><TierBadge tier={user.tier} /></td>
                      <td className="py-3 pr-4">
                        <Badge variant={user.is_banned ? 'destructive' : 'outline'} className="text-xs">
                          {user.is_banned ? 'Banned' : 'Active'}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-right">{user.total_requests_lifetime.toLocaleString()}</td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 text-right">
                        <Button size="sm" variant="outline" className="text-xs h-7" render={<Link href={`/admin/users/${user.id}`} />} nativeButton={false}>
                          Detail
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
