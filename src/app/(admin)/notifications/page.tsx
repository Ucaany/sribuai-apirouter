'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<'info' | 'warning' | 'success' | 'error'>('info')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) {
      toast.error('Judul dan pesan wajib diisi')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, type })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success(`Notifikasi terkirim ke ${data.sent_count} user`)
      setTitle('')
      setMessage('')
      setType('info')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengirim')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Kirim Notifikasi</h1>
        <p className="text-muted-foreground text-sm mt-1">Broadcast notifikasi ke semua user</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Form Notifikasi</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Contoh: Maintenance System"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="message">Pesan</Label>
              <textarea
                id="message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Contoh: Sistem akan maintenance pada pukul 02:00 WIB"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="type">Tipe</Label>
              <select
                id="type"
                value={type}
                onChange={e => setType(e.target.value as typeof type)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>

            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? 'Mengirim...' : 'Kirim ke Semua User'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
