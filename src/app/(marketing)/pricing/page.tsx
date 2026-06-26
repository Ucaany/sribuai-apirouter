import { Button } from '@/components/ui/button'
import { PricingSection } from '@/components/pricing-section'
import { CheckCircleIcon } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Harga - Sribuai APIRouter | Paket Mulai Rp 10.000/24 Jam',
  description: 'Pilih paket sesuai kebutuhan. Starter Rp 10.000, Pro Rp 15.900, Ultra Rp 20.000 per 24 jam. Bayar via QRIS.',
}

export default function PricingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-bold text-4xl tracking-tight md:text-5xl">
            Harga yang Transparan
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Pilih paket sesuai kebutuhan. Semua paket dapat akses ke 37+ model AI.
            Durasi 24 jam dari waktu pembayaran dikonfirmasi.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* Features Comparison */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center font-bold text-3xl tracking-tight">
            Semua Paket Termasuk
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              'Akses 37+ model AI',
              'Endpoint OpenAI-compatible',
              'API key management',
              'Usage dashboard',
              'Bayar via QRIS',
              'Dukungan teknis',
              'Auto fallback model',
              'Realtime analytics',
            ].map(feature => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircleIcon className="size-5 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center font-bold text-2xl">
            Pertanyaan tentang Harga
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 font-semibold">Bagaimana cara pembayaran?</h3>
              <p className="text-muted-foreground">
                Pembayaran melalui QRIS (GoPay, OVO, DANA, ShopeePay, semua mobile banking).
                Tidak perlu kartu kredit.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Kapan paket aktif?</h3>
              <p className="text-muted-foreground">
                Paket aktif segera setelah pembayaran QRIS dikonfirmasi. Durasi 24 jam terhitung
                dari waktu konfirmasi.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Bisa beli beberapa hari sekaligus?</h3>
              <p className="text-muted-foreground">
                Ya, Anda bisa membeli beberapa paket sekaligus. Durasi akan di-stack.
                Contoh: Beli 3x Pro = 3 x 24 jam = 72 jam aktif.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary px-4 py-20 text-primary-foreground">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-bold text-3xl tracking-tight md:text-4xl">
            Siap Mulai?
          </h2>
          <p className="mt-4 text-lg opacity-90">
            Daftar gratis dan coba semua model AI premium.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" variant="secondary" render={<Link href="/register" />} nativeButton={false}>
              Daftar Gratis
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10" render={<Link href="/docs" />} nativeButton={false}>
              Lihat Dokumentasi
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
