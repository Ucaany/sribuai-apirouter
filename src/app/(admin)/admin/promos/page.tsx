'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { toast } from '@/hooks/use-toast'
import { PlusIcon, TrashIcon, RefreshCwIcon } from 'lucide-react'

type Promo = {
  id: string
  code: string
  discount_type: 'percent' | 'nominal'
  discount_value: number
  max_usage: number | null
  usage_count: number
  expires_at: string | null
  description: string | null
  created_at: string
}

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [code, setCode] = useState(generateCode())
  const [discountType, setDiscountType] = useState<'percent' | 'nominal'>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [maxUsage, setMaxUsage] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [description, setDescription] = useState('')

  const fetchPromos = useCallback(async () => {
    const res = await fetch('/api/admin/promos')
    const data = await res.json()
    setPromos(data.promos ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchPromos() }, [fetchPromos])

  async function handleCreate() {
    if (!code.trim() || !discountValue) return
    setSaving(true)
    const res = await fetch('/api/admin/promos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        max_usage: maxUsage ? parseInt(maxUsage) : null,
        expires_at: expiresAt || null,
        description: description || null,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast({ title: 'Error', description: data.error, variant: 'destructive' })
    } else {
      toast({ title: `Promo ${data.promo?.code ?? code} dibuat!` })
      setPromos(p => [data.promo, ...p])
      setDialogOpen(false)
      resetForm()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus promo ini?')) return
    await fetch(`/api/admin/promos/${id}`, { method: 'DELETE' })
    setPromos(p => p.filter(x => x.id !== id))
    toast({ title: 'Promo dihapus.' })
  }

  function resetForm() {
    setCode(generateCode())
    setDiscountType('percent')
    setDiscountValue('')
    setMaxUsage('')
    setExpiresAt('')
    setDescription('')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Promo Codes</h1>
          <p className="text-muted-foreground text-sm mt-1">{promos.length} promo aktif</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm() }}>
          <DialogTrigger render={<Button size="sm" />}>
            <PlusIcon className="mr-2 size-4" /> Buat Promo
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Buat Promo Code</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Kode Promo</Label>
                <div className="flex gap-2">
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="font-mono uppercase"
                  />
                  <Button size="icon" variant="outline" onClick={() => setCode(generateCode())}>
                    <RefreshCwIcon className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label>Tipe Diskon</Label>
                  <Select value={discountType} onValueChange={(v) => { if (v) setDiscountType(v as 'percent' | 'nominal') }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Persentase (%)</SelectItem>
                      <SelectItem value="nominal">Nominal (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Nilai Diskon</Label>
                  <Input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percent' ? '50' : '50000'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label>Max Penggunaan <span className="text-muted-foreground text-xs">(kosong = unlimited)</span></Label>
                  <Input type="number" value={maxUsage} onChange={(e) => setMaxUsage(e.target.value)} placeholder="100" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Tanggal Expiry <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                  <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Deskripsi Internal</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Catatan internal" />
              </div>
              <Button onClick={handleCreate} disabled={saving || !code || !discountValue}>
                {saving ? 'Membuat...' : 'Buat Promo'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            </div>
          ) : promos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Belum ada promo code.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-3 pr-4">Kode</th>
                    <th className="text-left py-3 pr-4">Diskon</th>
                    <th className="text-right py-3 pr-4">Penggunaan</th>
                    <th className="text-left py-3 pr-4">Expiry</th>
                    <th className="text-left py-3 pr-4">Deskripsi</th>
                    <th className="text-right py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((promo) => {
                    const isExpired = promo.expires_at ? new Date(promo.expires_at) < new Date() : false
                    const isFull = promo.max_usage !== null && promo.usage_count >= promo.max_usage
                    return (
                      <tr key={promo.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="py-3 pr-4">
                          <span className="font-mono font-semibold">{promo.code}</span>
                          {(isExpired || isFull) && (
                            <Badge variant="secondary" className="ml-2 text-xs">Nonaktif</Badge>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          {promo.discount_type === 'percent'
                            ? `${promo.discount_value}%`
                            : `Rp ${promo.discount_value.toLocaleString('id-ID')}`}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          {promo.usage_count}/{promo.max_usage ?? '∞'}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground text-xs">
                          {promo.expires_at
                            ? new Date(promo.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '-'}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground text-xs">{promo.description ?? '-'}</td>
                        <td className="py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="size-8 p-0"
                            onClick={() => handleDelete(promo.id)}
                          >
                            <TrashIcon className="size-3 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
