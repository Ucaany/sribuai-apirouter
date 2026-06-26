'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { PlusIcon, PencilIcon, CheckIcon, XIcon } from 'lucide-react'
import type { Database } from '@/types/database'

type ModelConfig = Database['public']['Tables']['model_configs']['Row']

const EMPTY_FORM = {
  model_id: '', model_name: '', provider: '', router_model_id: '',
  context_window: 128000, supports_streaming: true, is_active: true, sort_order: 0, description: '',
}

export default function AdminModelsPage() {
  const [models, setModels] = useState<ModelConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [editModel, setEditModel] = useState<ModelConfig | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchModels = useCallback(async () => {
    const res = await fetch('/api/admin/models')
    const data = await res.json()
    setModels(data.models ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchModels() }, [fetchModels])

  async function handleAdd() {
    setSaving(true)
    const res = await fetch('/api/admin/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      toast({ title: 'Error', description: data.error, variant: 'destructive' })
    } else {
      toast({ title: 'Model ditambahkan!' })
      setAddOpen(false)
      setForm(EMPTY_FORM)
      fetchModels()
    }
    setSaving(false)
  }

  async function handleEdit() {
    if (!editModel) return
    setSaving(true)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { model_id: _model_id, ...updateFields } = form
    const res = await fetch(`/api/admin/models/${editModel.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateFields),
    })
    const data = await res.json()
    if (!res.ok) {
      toast({ title: 'Error', description: data.error, variant: 'destructive' })
    } else {
      toast({ title: 'Model diperbarui!' })
      setEditOpen(false)
      fetchModels()
    }
    setSaving(false)
  }

  async function handleToggle(model: ModelConfig) {
    await fetch(`/api/admin/models/${model.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !model.is_active }),
    })
    fetchModels()
  }

  const ModelForm = () => (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label>Model ID</Label>
          <Input value={form.model_id} onChange={(e) => setForm(f => ({ ...f, model_id: e.target.value }))} placeholder="claude-sonnet-4-5" disabled={!!editModel} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Display Name</Label>
          <Input value={form.model_name} onChange={(e) => setForm(f => ({ ...f, model_name: e.target.value }))} placeholder="Claude Sonnet 4.5" />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Provider</Label>
          <Input value={form.provider} onChange={(e) => setForm(f => ({ ...f, provider: e.target.value }))} placeholder="Anthropic" />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Router Model ID</Label>
          <Input value={form.router_model_id} onChange={(e) => setForm(f => ({ ...f, router_model_id: e.target.value }))} placeholder="anthropic/claude-sonnet-4-5" />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Context Window</Label>
          <Input type="number" value={form.context_window} onChange={(e) => setForm(f => ({ ...f, context_window: parseInt(e.target.value) || 0 }))} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Sort Order</Label>
          <Input type="number" value={form.sort_order} onChange={(e) => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Deskripsi</Label>
        <Input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Deskripsi singkat model" />
      </div>
      <div className="flex items-center justify-between">
        <Label>Enable Streaming</Label>
        <Switch checked={form.supports_streaming} onCheckedChange={(v) => setForm(f => ({ ...f, supports_streaming: v }))} />
      </div>
      <div className="flex items-center justify-between">
        <Label>Aktif</Label>
        <Switch checked={form.is_active} onCheckedChange={(v) => setForm(f => ({ ...f, is_active: v }))} />
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Model Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{models.length} model terdaftar</p>
        </div>
        <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setForm(EMPTY_FORM) }}>
          <DialogTrigger render={<Button size="sm" />}>
            <PlusIcon className="mr-2 size-4" /> Tambah Model
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Tambah Model Baru</DialogTitle></DialogHeader>
            <ModelForm />
            <Button onClick={handleAdd} disabled={saving || !form.model_id || !form.model_name}>
              {saving ? 'Menyimpan...' : 'Tambah Model'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            </div>
          ) : models.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Belum ada model. Tambah model pertama!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-3 pr-4">Model</th>
                    <th className="text-left py-3 pr-4">Provider</th>
                    <th className="text-right py-3 pr-4">Context</th>
                    <th className="text-left py-3 pr-4">Streaming</th>
                    <th className="text-left py-3 pr-4">Status</th>
                    <th className="text-right py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((model) => (
                    <tr key={model.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{model.model_name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{model.model_id}</p>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{model.provider}</td>
                      <td className="py-3 pr-4 text-right text-muted-foreground">
                        {model.context_window >= 1000000 ? `${(model.context_window / 1000000).toFixed(0)}M` : `${(model.context_window / 1000).toFixed(0)}K`}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="text-xs">{model.supports_streaming ? <CheckIcon className="size-3 text-green-500" /> : <XIcon className="size-3 text-red-500" />}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Switch
                          checked={model.is_active}
                          onCheckedChange={() => handleToggle(model)}
                          className="scale-75"
                        />
                      </td>
                      <td className="py-3 text-right">
                        <Dialog open={editOpen && editModel?.id === model.id} onOpenChange={(o) => { setEditOpen(o); if (o) { setEditModel(model); setForm({ model_id: model.model_id, model_name: model.model_name, provider: model.provider, router_model_id: model.router_model_id, context_window: model.context_window, supports_streaming: model.supports_streaming, is_active: model.is_active, sort_order: model.sort_order, description: model.description ?? '' }) } else { setEditModel(null) } }}>
                          <DialogTrigger render={<Button size="sm" variant="ghost" className="size-8 p-0" />}>
                            <PencilIcon className="size-3" />
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader><DialogTitle>Edit {model.model_name}</DialogTitle></DialogHeader>
                            <ModelForm />
                            <Button onClick={handleEdit} disabled={saving}>
                              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                          </DialogContent>
                        </Dialog>
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
