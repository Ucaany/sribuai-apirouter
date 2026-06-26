'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircleIcon, XCircleIcon, ClockIcon, ShoppingCartIcon } from 'lucide-react'
import QRCode from 'qrcode'

const PACKAGES = [
  { tier: 'starter', name: 'Starter', tokens: '40M', price: 10000, priceLabel: 'Rp 10.000' },
  { tier: 'pro', name: 'Pro', tokens: '80M', price: 15900, priceLabel: 'Rp 15.900', popular: true },
  { tier: 'ultra', name: 'Ultra', tokens: '150M', price: 20000, priceLabel: 'Rp 20.000' },
]

type PaymentState = 'idle' | 'selecting' | 'paying' | 'polling' | 'success' | 'expired' | 'error'

export default function TopupPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentState, setPaymentState] = useState<PaymentState>('idle')
  const [selectedTier, setSelectedTier] = useState<string | null>(searchParams.get('tier'))
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [amount, setAmount] = useState(0)
  const [description, setDescription] = useState('')
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  useEffect(() => {
    if (!expiresAt) return
    countdownRef.current = setInterval(() => {
      const diff = expiresAt.getTime() - Date.now()
      if (diff <= 0) {
        setCountdown('00:00')
        clearInterval(countdownRef.current!)
        return
      }
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setCountdown(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(countdownRef.current!)
  }, [expiresAt])

  async function handleBuy(tier: string) {
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const qrUrl = await QRCode.toDataURL(data.qr_string, { width: 300, margin: 2 })
      setQrDataUrl(qrUrl)
      setAmount(data.amount_idr)
      setDescription(data.description)
      setExpiresAt(new Date(data.expires_at))
      setSelectedTier(tier)
      setPaymentState('paying')

      pollRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/payment/status/${data.transaction_id}`)
          const pollData = await pollRes.json()
          if (pollData.status === 'success') {
            clearInterval(pollRef.current!)
            clearInterval(countdownRef.current!)
            setPaymentState('success')
          } else if (['expired', 'failed'].includes(pollData.status)) {
            clearInterval(pollRef.current!)
            setPaymentState('expired')
          }
        } catch {}
      }, 3000)
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    if (pollRef.current) clearInterval(pollRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    setPaymentState('idle')
    setQrDataUrl(null)
  }

  if (paymentState === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-6">
        <CheckCircleIcon className="size-16 text-green-500" />
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Pembayaran Berhasil!</h2>
          <p className="text-muted-foreground mt-2">{description} telah aktif.</p>
        </div>
        <Button onClick={() => router.push('/dashboard')}>
          Kembali ke Dashboard
        </Button>
      </div>
    )
  }

  if (paymentState === 'expired') {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-6">
        <XCircleIcon className="size-16 text-red-500" />
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Pembayaran Expired</h2>
          <p className="text-muted-foreground mt-2">QR Code telah kedaluwarsa. Buat transaksi baru.</p>
        </div>
        <Button onClick={handleCancel}>Coba Lagi</Button>
      </div>
    )
  }

  if (paymentState === 'paying' && qrDataUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-6 max-w-sm mx-auto">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Bayar via QRIS</h2>
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        </div>

        <Card className="w-full">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />

            <div className="text-center">
              <p className="text-2xl font-bold">Rp {amount.toLocaleString('id-ID')}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <ClockIcon className="size-4 text-muted-foreground" />
                <span className="text-sm font-mono">{countdown}</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              {['GoPay', 'OVO', 'DANA', 'ShopeePay', 'Mobile Bank'].map(g => (
                <Badge key={g} variant="outline" className="text-xs">{g}</Badge>
              ))}
            </div>

            <div className="w-full border rounded-md p-3 text-xs text-center">
              <p className="text-muted-foreground">Menunggu pembayaran...</p>
              <div className="mt-1 flex justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleCancel}>
              Batalkan
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Beli Paket</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Durasi 24 jam terhitung dari waktu pembayaran dikonfirmasi. Semua paket dapat akses ke semua model AI.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4">
        {PACKAGES.map((pkg) => (
          <Card
            key={pkg.tier}
            className={`relative overflow-visible transition-shadow hover:shadow-lg h-full ${
              pkg.popular ? 'border-primary shadow-md ring-1 ring-primary/20' : ''
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                <Badge>Populer</Badge>
              </div>
            )}
            <CardContent className="pt-8 pb-6 px-5 flex flex-col gap-5 h-full">
              <div>
                <h3 className="text-lg font-semibold">{pkg.name}</h3>
                <p className="text-3xl font-bold mt-1">{pkg.tokens}</p>
                <p className="text-sm text-muted-foreground">Token</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{pkg.priceLabel}</p>
                <p className="text-xs text-muted-foreground">per 24 jam</p>
              </div>
              <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircleIcon className="size-3 shrink-0 text-green-500" /> Semua model AI</li>
                <li className="flex items-center gap-2"><CheckCircleIcon className="size-3 shrink-0 text-green-500" /> Streaming support</li>
                <li className="flex items-center gap-2"><CheckCircleIcon className="size-3 shrink-0 text-green-500" /> Durasi 24 jam</li>
              </ul>
              <Button
                className="mt-auto w-full"
                variant={pkg.popular ? 'default' : 'outline'}
                onClick={() => handleBuy(pkg.tier)}
                disabled={loading}
              >
                <ShoppingCartIcon className="size-4" />
                {loading && selectedTier === pkg.tier ? 'Memproses...' : 'Beli Sekarang'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground">
            Pembayaran aman via QRIS. Mendukung GoPay, OVO, DANA, ShopeePay, dan semua mobile banking.
            Token aktif selama 24 jam sejak pembayaran dikonfirmasi. Token tidak dapat dikembalikan.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
