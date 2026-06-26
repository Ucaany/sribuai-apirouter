'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  KeyIcon,
  PlusIcon,
  CopyIcon,
  TrashIcon,
  CheckIcon,
  ShieldAlertIcon,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

type ApiKey = Database['public']['Tables']['api_keys']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

const MAX_KEYS: Record<string, number> = {
  none: 0,
  starter: 3,
  pro: 10,
  ultra: 999,
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatRelative(iso: string | null): string {
  if (!iso) return 'Belum pernah'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} jam lalu`
  return `${Math.floor(hrs / 24)} hari lalu`
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyAllowedIps, setNewKeyAllowedIps] = useState('')
  const [newKeyExpiry, setNewKeyExpiry] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [revoking, setRevoking] = useState<string | null>(null)

  const fetchKeys = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [keysRes, profileRes] = await Promise.all([
      supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ])

    if (keysRes.data) setKeys(keysRes.data)
    if (profileRes.data) setProfile(profileRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchKeys() }, [fetchKeys])

  async function handleCreate() {
    if (!newKeyName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/keys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim(),
          allowed_ips: newKeyAllowedIps.trim() ? newKeyAllowedIps.split(',').map(s => s.trim()) : null,
          expires_at: newKeyExpiry || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCreatedKey(data.key)
      setNewKeyName('')
      setNewKeyAllowedIps('')
      setNewKeyExpiry('')
      await fetchKeys()
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Gagal membuat API key', variant: 'destructive' })
    } finally {
      setCreating(false)
    }
  }

  async function handleRevoke(id: string) {
    setRevoking(id)
    const supabase = createClient()
    await supabase.from('api_keys').update({ is_active: false }).eq('id', id)
    await fetchKeys()
    setRevoking(null)
  }

  async function handleCopy(text: string, id: string) {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const tier = profile?.tier ?? 'none'
  const maxKeys = MAX_KEYS[tier] ?? 0
  const activeKeys = keys.filter(k => k.is_active)
  const canCreate = tier !== 'none' && activeKeys.length < maxKeys

  const codeSnippets = {
    python: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.sribuai.my.id/v1",
    api_key="YOUR_API_KEY"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-5",
    messages=[{"role": "user", "content": "Halo!"}]
)
print(response.choices[0].message.content)`,
    javascript: `import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.sribuai.my.id/v1',
  apiKey: 'YOUR_API_KEY',
});

const response = await client.chat.completions.create({
  model: 'claude-sonnet-4-5',
  messages: [{ role: 'user', content: 'Halo!' }],
});
console.log(response.choices[0].message.content);`,
    curl: `curl https://api.sribuai.my.id/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-sonnet-4-5",
    "messages": [{"role": "user", "content": "Halo!"}]
  }'`,
  }
  const [activeSnippet, setActiveSnippet] = useState<keyof typeof codeSnippets>('python')

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">API Keys</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {activeKeys.length}/{tier === 'ultra' ? '∞' : maxKeys} key aktif
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setCreatedKey(null) }}>
          <DialogTrigger render={<Button disabled={!canCreate} size="sm" />}>
            <PlusIcon className="mr-2 size-4" /> Buat API Key Baru
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {createdKey ? 'API Key Berhasil Dibuat' : 'Buat API Key Baru'}
              </DialogTitle>
            </DialogHeader>
            {createdKey ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
                  <ShieldAlertIcon className="size-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800">
                    Key ini hanya ditampilkan <strong>sekali</strong>. Salin dan simpan sekarang.
                  </p>
                </div>
                <div className="flex gap-2">
                  <code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono break-all">{createdKey}</code>
                  <Button size="icon" variant="outline" onClick={() => handleCopy(createdKey, 'new')}>
                    {copiedId === 'new' ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                  </Button>
                </div>
                <Button onClick={() => { setDialogOpen(false); setCreatedKey(null) }}>Selesai</Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="key-name">Nama Key</Label>
                  <Input
                    id="key-name"
                    placeholder="Contoh: Production Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="allowed-ips">Allowed IPs <span className="text-muted-foreground text-xs">(opsional, pisah koma)</span></Label>
                  <Input
                    id="allowed-ips"
                    placeholder="Contoh: 192.168.1.1, 10.0.0.0/24"
                    value={newKeyAllowedIps}
                    onChange={(e) => setNewKeyAllowedIps(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="expiry">Tanggal Expired <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                  <Input
                    id="expiry"
                    type="date"
                    value={newKeyExpiry}
                    onChange={(e) => setNewKeyExpiry(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreate} disabled={creating || !newKeyName.trim()}>
                  {creating ? 'Membuat...' : 'Buat API Key'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {!canCreate && tier === 'none' && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-800">Anda perlu membeli paket untuk membuat API key.</p>
          </CardContent>
        </Card>
      )}

      {keys.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <KeyIcon className="size-12 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground text-sm">Belum ada API key. Buat yang pertama!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {keys.map((key) => (
            <Card key={key.id} className={!key.is_active ? 'opacity-60' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{key.name}</p>
                      <Badge variant={key.is_active ? 'outline' : 'secondary'} className="text-xs">
                        {key.is_active ? 'Active' : 'Revoked'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                        {key.key_preview}...xxxx
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6"
                        onClick={() => handleCopy(key.key_preview, key.id)}
                      >
                        {copiedId === key.id ? <CheckIcon className="size-3" /> : <CopyIcon className="size-3" />}
                      </Button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                      <span>Dibuat: {formatTime(key.created_at)}</span>
                      <span>Terakhir digunakan: {formatRelative(key.last_used_at)}</span>
                      <span>Total request: {key.usage_count.toLocaleString()}</span>
                      {key.expires_at && (
                        <span>Expired: {formatTime(key.expires_at)}</span>
                      )}
                      {key.allowed_ips && key.allowed_ips.length > 0 && (
                        <span>IPs: {key.allowed_ips.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  {key.is_active && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRevoke(key.id)}
                      disabled={revoking === key.id}
                    >
                      <TrashIcon className="mr-2 size-3" />
                      {revoking === key.id ? 'Mencabut...' : 'Revoke'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Start</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-2">
            {(['python', 'javascript', 'curl'] as const).map((lang) => (
              <Button
                key={lang}
                size="sm"
                variant={activeSnippet === lang ? 'default' : 'outline'}
                onClick={() => setActiveSnippet(lang)}
              >
                {lang === 'javascript' ? 'JavaScript' : lang.charAt(0).toUpperCase() + lang.slice(1)}
              </Button>
            ))}
          </div>
          <div className="relative">
            <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto whitespace-pre">
              {codeSnippets[activeSnippet]}
            </pre>
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 size-7"
              onClick={() => handleCopy(codeSnippets[activeSnippet], 'snippet')}
            >
              {copiedId === 'snippet' ? <CheckIcon className="size-3" /> : <CopyIcon className="size-3" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
