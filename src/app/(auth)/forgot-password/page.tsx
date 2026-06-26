'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Logo } from '@/components/logo'
import { Particles } from '@/components/ui/particles'
import { ChevronLeftIcon, Loader2Icon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError('Gagal mengirim email. Silakan coba lagi.')
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="relative w-full md:h-screen md:overflow-hidden">
        <Particles className="absolute inset-0" color="#666666" ease={20} quantity={120} />
        <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-8">
          <Button className="absolute top-4 left-4" variant="ghost" render={<Link href="/login" />} nativeButton={false}>
            <ChevronLeftIcon data-icon="inline-start" />Kembali
          </Button>

          <div className="mx-auto space-y-6 text-center sm:w-sm">
            <Logo className="mx-auto h-5" />
            <h1 className="font-bold text-2xl">Email Terkirim!</h1>
            <p className="text-muted-foreground">
              Kami telah mengirimkan link reset password ke <strong>{email}</strong>.
              Silakan cek inbox Anda.
            </p>
            <Button className="w-full" render={<Link href="/login" />} nativeButton={false}>
              Kembali ke Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full md:h-screen md:overflow-hidden">
      <Particles className="absolute inset-0" color="#666666" ease={20} quantity={120} />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-8">
        <Button className="absolute top-4 left-4" variant="ghost" render={<Link href="/login" />} nativeButton={false}>
          <ChevronLeftIcon data-icon="inline-start" />Kembali
        </Button>

        <div className="mx-auto space-y-6 sm:w-sm">
          <Logo className="h-5" />
          <div className="flex flex-col space-y-1">
            <h1 className="font-bold text-2xl tracking-wide">Lupa Password?</h1>
            <p className="text-base text-muted-foreground">
              Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
              Kirim Link Reset
            </Button>
          </form>

          <div className="text-center">
            <Link href="/login" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary">
              Kembali ke login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
