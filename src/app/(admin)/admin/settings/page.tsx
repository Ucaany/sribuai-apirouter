'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'

const TABS = ['Pricing', 'System Config', 'KlikQRIS'] as const
type Tab = typeof TABS[number]

type Settings = {
  pricing: {
    starter: { price: number; token_pool: number }
    pro: { price: number; token_pool: number }
    ultra: { price: number; token_pool: number }
  }
  system: {
    ninerouter_base_url: string
    maintenance_mode: boolean
    max_api_keys: { none: number; starter: number; pro: number; ultra: number }
  }
  klikqris: {
    test_mode: boolean
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('Pricing')

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => { setSettings(d.settings); setLoading(false) })
  }, [])

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    const data = await res.json()
    if (!res.ok) {
      toast({ title: 'Error', description: data.error, variant: 'destructive' })
    } else {
      toast({ title: 'Settings disimpan!' })
    }
    setSaving(false)
  }

  function updatePricing(tier: keyof Settings['pricing'], field: 'price' | 'token_pool', value: number) {
    if (!settings) return
    setSettings(s => s ? ({
      ...s,
      pricing: { ...s.pricing, [tier]: { ...s.pricing[tier], [field]: value } }
    }) : s)
  }

  if (loading || !settings) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Konfigurasi platform</p>
      </div>

      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Pricing' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing Editor</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <p className="text-xs text-muted-foreground rounded-md bg-amber-50 border border-amber-200 p-3">
              Perubahan berlaku untuk transaksi baru. Paket yang sedang aktif tidak terpengaruh hingga expired.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-6">Paket</th>
                    <th className="text-left py-2 pr-6">Harga/24 jam (Rp)</th>
                    <th className="text-left py-2">Token Pool</th>
                  </tr>
                </thead>
                <tbody>
                  {(['starter', 'pro', 'ultra'] as const).map((tier) => (
                    <tr key={tier} className="border-b last:border-0">
                      <td className="py-3 pr-6 font-medium capitalize">{tier}</td>
                      <td className="py-3 pr-6">
                        <Input
                          type="number"
                          className="w-36"
                          value={settings.pricing[tier].price}
                          onChange={(e) => updatePricing(tier, 'price', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="py-3">
                        <Input
                          type="number"
                          className="w-44"
                          value={settings.pricing[tier].token_pool}
                          onChange={(e) => updatePricing(tier, 'token_pool', parseInt(e.target.value) || 0)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-fit">
              {saving ? 'Menyimpan...' : 'Simpan Pricing'}
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'System Config' && (
        <Card>
          <CardHeader><CardTitle className="text-base">System Configuration</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-5 max-w-lg">
            <div className="flex flex-col gap-2">
              <Label>9router Base URL</Label>
              <Input
                value={settings.system.ninerouter_base_url}
                onChange={(e) => setSettings(s => s ? ({ ...s, system: { ...s.system, ninerouter_base_url: e.target.value } }) : s)}
                placeholder="https://api.openagnetic.dev"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground mt-1">Nonaktifkan semua API request dari user</p>
              </div>
              <Switch
                checked={settings.system.maintenance_mode}
                onCheckedChange={(v) => setSettings(s => s ? ({ ...s, system: { ...s.system, maintenance_mode: v } }) : s)}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label>Max API Keys per Tier</Label>
              {(['none', 'starter', 'pro', 'ultra'] as const).map((tier) => (
                <div key={tier} className="flex items-center gap-3">
                  <span className="w-16 text-sm capitalize text-muted-foreground">{tier === 'none' ? 'Free' : tier}</span>
                  <Input
                    type="number"
                    className="w-24"
                    value={settings.system.max_api_keys[tier]}
                    onChange={(e) => setSettings(s => s ? ({
                      ...s,
                      system: { ...s.system, max_api_keys: { ...s.system.max_api_keys, [tier]: parseInt(e.target.value) || 0 } }
                    }) : s)}
                  />
                </div>
              ))}
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-fit">
              {saving ? 'Menyimpan...' : 'Simpan Config'}
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'KlikQRIS' && (
        <Card>
          <CardHeader><CardTitle className="text-base">KlikQRIS Configuration</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-5 max-w-lg">
            <div className="flex items-center justify-between">
              <div>
                <Label>Test Mode</Label>
                <p className="text-xs text-muted-foreground mt-1">Gunakan sandbox environment KlikQRIS</p>
              </div>
              <Switch
                checked={settings.klikqris.test_mode}
                onCheckedChange={(v) => setSettings(s => s ? ({ ...s, klikqris: { ...s.klikqris, test_mode: v } }) : s)}
              />
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground">
                Konfigurasi API Key, Merchant ID, dan Webhook Secret KlikQRIS diatur melalui environment variables (.env.local) bukan di sini untuk keamanan.
              </p>
              <ul className="mt-2 text-xs text-muted-foreground list-disc list-inside">
                <li>KLIKQRIS_API_KEY</li>
                <li>KLIKQRIS_MERCHANT_ID</li>
                <li>KLIKQRIS_WEBHOOK_SECRET</li>
              </ul>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-fit">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
