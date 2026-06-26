'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/hooks/use-toast'
import { AlertTriangleIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type Profile = Database['public']['Tables']['profiles']['Row']

const TABS = ['Profile', 'Security', 'Notifications', 'Danger Zone'] as const
type Tab = typeof TABS[number]

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('Profile')

  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPw, setChangingPw] = useState(false)

  const [notifQuota80, setNotifQuota80] = useState(true)
  const [notifQuota100, setNotifQuota100] = useState(true)
  const [notifPayment, setNotifPayment] = useState(true)
  const [notifNewsletter, setNotifNewsletter] = useState(false)

  const [deleteEmail, setDeleteEmail] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const fetchProfile = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setProfile(data)
      setFullName(data.full_name ?? '')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  async function handleSaveProfile() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() || null })
      .eq('id', user.id)
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Profil disimpan!' })
      fetchProfile()
    }
    setSaving(false)
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Password baru tidak cocok', variant: 'destructive' })
      return
    }
    if (newPassword.length < 8) {
      toast({ title: 'Error', description: 'Password minimal 8 karakter', variant: 'destructive' })
      return
    }
    setChangingPw(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Password berhasil diubah!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setChangingPw(false)
  }

  async function handleDeleteAccount() {
    if (deleteEmail !== profile?.email) {
      toast({ title: 'Error', description: 'Email tidak cocok', variant: 'destructive' })
      return
    }
    setDeleting(true)
    toast({ title: 'Menghapus akun...', description: 'Fitur ini membutuhkan konfirmasi dari support.' })
    setDeleting(false)
    setDeleteDialogOpen(false)
  }

  if (loading) {
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
        <p className="text-muted-foreground text-sm mt-1">Kelola akun dan preferensi Anda</p>
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

      {activeTab === 'Profile' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Profil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarImage src={profile?.avatar_url ?? ''} />
                <AvatarFallback className="text-xl">
                  {(profile?.full_name ?? profile?.email ?? 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{profile?.full_name ?? '-'}</p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 max-w-md">
              <div className="flex flex-col gap-2">
                <Label htmlFor="full-name">Nama Lengkap</Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama lengkap Anda"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Email</Label>
                <Input value={profile?.email ?? ''} disabled readOnly className="opacity-60" />
                <p className="text-xs text-muted-foreground">Email tidak dapat diubah langsung. Hubungi support.</p>
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="w-fit">
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'Security' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Keamanan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 max-w-md">
            <div className="flex flex-col gap-2">
              <Label htmlFor="current-password">Password Saat Ini</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Password saat ini"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-password">Password Baru</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-password">Konfirmasi Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={changingPw || !newPassword || !confirmPassword}
              className="w-fit"
            >
              {changingPw ? 'Mengubah...' : 'Ubah Password'}
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'Notifications' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifikasi</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {[
              { id: 'quota80', label: 'Email alert saat quota 80%', value: notifQuota80, set: setNotifQuota80 },
              { id: 'quota100', label: 'Email alert saat quota 100%', value: notifQuota100, set: setNotifQuota100 },
              { id: 'payment', label: 'Email konfirmasi pembayaran', value: notifPayment, set: setNotifPayment },
              { id: 'newsletter', label: 'Newsletter & tips', value: notifNewsletter, set: setNotifNewsletter },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <Label htmlFor={item.id} className="cursor-pointer">{item.label}</Label>
                <Switch
                  id={item.id}
                  checked={item.value}
                  onCheckedChange={item.set}
                />
              </div>
            ))}
            <Button className="w-fit" onClick={() => toast({ title: 'Preferensi notifikasi disimpan!' })}>
              Simpan Preferensi
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'Danger Zone' && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-base text-destructive flex items-center gap-2">
              <AlertTriangleIcon className="size-4" /> Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Hapus Akun</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus permanen.
                </p>
              </div>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger render={<Button variant="destructive" size="sm" />}>
                  Hapus Akun
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Konfirmasi Hapus Akun</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                      Ketik email Anda <strong>{profile?.email}</strong> untuk konfirmasi.
                    </p>
                    <Input
                      placeholder="Email Anda"
                      value={deleteEmail}
                      onChange={(e) => setDeleteEmail(e.target.value)}
                    />
                    <Button
                      variant="destructive"
                      disabled={deleting || deleteEmail !== profile?.email}
                      onClick={handleDeleteAccount}
                    >
                      {deleting ? 'Menghapus...' : 'Hapus Akun Saya'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
