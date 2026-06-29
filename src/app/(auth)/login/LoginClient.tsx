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
import { useRouter, useSearchParams } from 'next/navigation'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'

export function LoginClient() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [supabase] = useState(() => createClient())

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (siteKey && !turnstileToken) {
      setError('Selesaikan verifikasi keamanan terlebih dahulu.')
      setLoading(false)
      return
    }

    if (siteKey && turnstileToken) {
      const res = await fetch('/api/turnstile/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken, action: 'login' }),
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

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email atau password salah.')
      turnstileRef.current?.reset()
      setTurnstileToken(null)
      setLoading(false)
    } else {
      const rawRedirect = searchParams.get('redirect') || '/dashboard'
      let redirectTo = '/dashboard'
      try {
        const parsed = new URL(rawRedirect, window.location.origin)
        if (parsed.origin === window.location.origin) {
          redirectTo = parsed.pathname + parsed.search
        }
      } catch { }
      router.push(redirectTo)
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
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
            <h1 className="font-bold text-2xl tracking-wide">Masuk ke Sribuai</h1>
            <p className="text-base text-muted-foreground">
              Belum punya akun?{' '}
              <Link href="/register" className="underline underline-offset-4 hover:text-primary">
                Daftar sekarang
              </Link>
            </p>
          </div>

          <Button className="w-full" type="button" variant="outline" onClick={handleGoogle}>
            <GoogleIcon data-icon="inline-start" />
            Lanjutkan dengan Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">atau</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
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
                  action: 'login',
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
              Masuk
            </Button>
          </form>

          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary">
              Lupa password?
            </Link>
          </div>

          <p className="text-muted-foreground text-xs">
            Dengan masuk, Anda setuju dengan{' '}
            <Link href="#" className="underline underline-offset-4 hover:text-primary">Syarat & Ketentuan</Link>{' '}dan{' '}
            <Link href="#" className="underline underline-offset-4 hover:text-primary">Kebijakan Privasi</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
