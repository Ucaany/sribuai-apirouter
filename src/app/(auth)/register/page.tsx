'use client'

import { GoogleIcon } from '@/components/google-icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Logo } from '@/components/logo'
import { Particles } from '@/components/ui/particles'
import { ChevronLeftIcon, Loader2Icon } from 'lucide-react'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const supabase = createClient()

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 8) {
      setError('Password minimal 8 karakter')
      setLoading(false)
      return
    }

    if (siteKey && !turnstileToken) {
      setError('Selesaikan verifikasi keamanan terlebih dahulu.')
      setLoading(false)
      return
    }

    if (siteKey && turnstileToken) {
      const res = await fetch('/api/turnstile/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken, action: 'register' }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Verifikasi keamanan gagal. Coba lagi.')
        turnstileRef.current?.reset()
        setTurnstileToken(null)
        setLoading(false)
        return
      }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError('Pendaftaran gagal. Silakan coba lagi.')
      turnstileRef.current?.reset()
      setTurnstileToken(null)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (success) {
    return (
      <div className="relative w-full md:h-screen md:overflow-hidden">
        <Particles className="absolute inset-0" color="#666666" ease={20} quantity={120} />
        <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-8">
          <div className="mx-auto space-y-4 text-center sm:w-sm">
            <Logo className="mx-auto h-5" />
            <h1 className="font-bold text-2xl">Cek Email Anda!</h1>
            <p className="text-muted-foreground">
              Kami mengirimkan link verifikasi ke <strong>{email}</strong>.
              Klik link tersebut untuk mengaktifkan akun Anda.
            </p>
            <Button variant="outline" render={<Link href="/login" />} nativeButton={false} className="w-full">
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
        <Button className="absolute top-4 left-4" variant="ghost" render={<Link href="/" />} nativeButton={false}>
          <ChevronLeftIcon data-icon="inline-start" />Beranda
        </Button>

        <div className="mx-auto space-y-6 sm:w-sm">
          <Logo className="h-5" />
          <div className="flex flex-col space-y-1">
            <h1 className="font-bold text-2xl tracking-wide">Buat Akun Gratis</h1>
            <p className="text-base text-muted-foreground">
              Sudah punya akun?{' '}
              <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                Masuk di sini
              </Link>
            </p>
          </div>

          <Button className="w-full" type="button" variant="outline" onClick={handleGoogle}>
            <GoogleIcon data-icon="inline-start" />
            Daftar dengan Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">atau</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-3">
            <Input
              type="text"
              placeholder="Nama Lengkap"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password (min. 8 karakter)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {siteKey && (
              <Turnstile
                ref={turnstileRef}
                siteKey={siteKey}
                onSuccess={setTurnstileToken}
                onError={() => { setTurnstileToken(null) }}
                onExpire={() => { setTurnstileToken(null) }}
                options={{
                  theme: 'auto',
                  action: 'register',
                  cData: typeof window !== 'undefined' ? window.location.hostname : undefined,
                  responseField: true,
                  appearance: 'always',
                  refreshExpired: 'auto',
                  retry: 'auto',
                  retryInterval: 2000,
                }}
              />
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" type="submit" disabled={loading || (!!siteKey && !turnstileToken)}>
              {loading ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
              Buat Akun
            </Button>
          </form>

          <p className="text-muted-foreground text-xs">
            Dengan mendaftar, Anda setuju dengan{' '}
            <Link href="#" className="underline underline-offset-4 hover:text-primary">Syarat & Ketentuan</Link>{' '}dan{' '}
            <Link href="#" className="underline underline-offset-4 hover:text-primary">Kebijakan Privasi</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
