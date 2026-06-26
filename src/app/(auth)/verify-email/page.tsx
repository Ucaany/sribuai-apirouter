'use client'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { Particles } from '@/components/ui/particles'
import { ChevronLeftIcon, Loader2Icon, MailIcon } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function VerifyEmailPage() {
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  async function handleResend() {
    setLoading(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    
    if (user?.email) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      })

      if (error) {
        setMessage('Gagal mengirim ulang email. Coba lagi nanti.')
      } else {
        setMessage('Email verifikasi telah dikirim ulang!')
        setCountdown(60)
        setCanResend(false)
      }
    } else {
      setMessage('Sesi tidak ditemukan. Silakan daftar ulang atau hubungi support.')
    }
    
    setLoading(false)
  }

  return (
    <div className="relative w-full md:h-screen md:overflow-hidden">
      <Particles className="absolute inset-0" color="#666666" ease={20} quantity={120} />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-8">
        <Button className="absolute top-4 left-4" variant="ghost" render={<Link href="/" />} nativeButton={false}>
          <ChevronLeftIcon data-icon="inline-start" />Beranda
        </Button>

        <div className="mx-auto space-y-6 text-center sm:w-sm">
          <Logo className="mx-auto h-5" />
          
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10">
            <MailIcon className="size-10 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="font-bold text-2xl tracking-wide">Cek Email Anda!</h1>
            <p className="text-muted-foreground">
              Kami telah mengirimkan link verifikasi ke email Anda.
              Klik link tersebut untuk mengaktifkan akun.
            </p>
          </div>

          {message && (
            <p className="text-sm text-primary">{message}</p>
          )}

          <div className="space-y-3">
            <Button
              className="w-full"
              variant="outline"
              onClick={handleResend}
              disabled={!canResend || loading}
            >
              {loading ? (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              ) : null}
              {canResend ? 'Kirim Ulang Email Verifikasi' : `Kirim ulang dalam ${countdown} detik`}
            </Button>

            <Button className="w-full" render={<Link href="/login" />} nativeButton={false}>
              Kembali ke Login
            </Button>
          </div>

          <p className="text-muted-foreground text-xs">
            Tidak menerima email? Cek folder spam atau{' '}
            <button
              onClick={handleResend}
              disabled={!canResend}
              className="underline underline-offset-4 hover:text-primary disabled:opacity-50"
            >
              kirim ulang
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
