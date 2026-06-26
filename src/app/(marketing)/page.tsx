import { Button } from '@/components/ui/button'
import { LogoCloud } from '@/components/logo-cloud'
import { PricingSection } from '@/components/pricing-section'
import { TestimonialsSection } from '@/components/testimonials-section'
import { StatsSection } from '@/components/marketing/stats-section'
import { ModelsSection } from '@/components/marketing/models-section'
import { FaqSection } from '@/components/marketing/faq-section'
import { FeatureSection } from '@/components/feature-section'
import { CallToAction } from '@/components/cta'
import { Particles } from '@/components/ui/particles'
import { CheckIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sribuai APIRouter - 37+ Model AI dalam 1 API | Harga Terjangkau',
  description: 'Akses Claude, GPT-4, Gemini, DeepSeek dan 37+ model AI lainnya melalui satu API OpenAI-compatible. Bayar via QRIS. Mulai gratis hari ini.',
  keywords: 'API AI Indonesia, Claude API, GPT-4 API, AI Gateway, OpenAI alternative Indonesia',
  openGraph: {
    title: 'Sribuai APIRouter - 37+ Model AI dalam 1 API',
    description: 'Akses 37+ model AI premium dengan harga terjangkau. Bayar via QRIS.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sribuai APIRouter',
    description: '37+ Model AI dalam 1 API. Bayar via QRIS.',
    images: ['/og-image.png'],
  },
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32 overflow-hidden">
        <Particles className="absolute inset-0" color="#666666" ease={20} quantity={120} />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-green-500" />
              </span>
              Tersedia: Claude 4.5 • GPT-4 • Gemini Pro • DeepSeek V3
            </div>

            <h1 className="max-w-4xl text-4xl tracking-tight md:text-6xl lg:text-7xl">
              37+ Model AI Premium
              <br />
              <span className="font-serif text-primary">Dalam 1 API</span>
            </h1>

            <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
              Akses <span className="font-serif">Claude, GPT-4, Gemini, DeepSeek</span> dan banyak lagi melalui satu endpoint OpenAI-compatible.
              Mulai gratis, upgrade kapan saja.
            </p>

            <div className="flex flex-row flex-wrap items-center justify-center gap-4">
              <Button size="lg" render={<Link href="/register" />} nativeButton={false}>
                Mulai Gratis Sekarang
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/docs" />} nativeButton={false}>
                Lihat Dokumentasi
              </Button>
            </div>

            <div className="w-full max-w-2xl rounded-xl border bg-zinc-950 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
                <div className="size-3 rounded-full bg-zinc-700" />
                <div className="size-3 rounded-full bg-zinc-700" />
                <div className="size-3 rounded-full bg-zinc-700" />
                <span className="ml-2 text-xs text-zinc-500">terminal</span>
              </div>
              <div className="p-5">
                <pre className="overflow-x-auto text-left text-sm leading-relaxed">
                  <code>
                    <span className="text-zinc-500">$</span>{" "}
                    <span className="text-emerald-400">curl</span>{" "}
                    <span className="text-zinc-300">https://api.sribuai.my.id/v1/chat/completions</span>
                    {" \\"}{"\n"}
                    {"  "}<span className="text-sky-400">-H</span>{" "}
                    <span className="text-amber-300">&quot;Authorization: Bearer sk-sri-xxxxx&quot;</span>
                    {" \\"}{"\n"}
                    {"  "}<span className="text-sky-400">-d</span>{" "}
                    <span className="text-amber-300">{`'{"model": "claude-sonnet-4-5", "messages": [...]}'`}</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Counter Animation */}
      <StatsSection />

      {/* Features Section */}
      <section id="features" className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-bold text-3xl tracking-tight md:text-4xl">
              Kenapa <span className="font-serif">Sribuai APIRouter?</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Semua yang Anda butuhkan untuk integrasi AI yang cepat dan aman
            </p>
          </div>
          <FeatureSection />
        </div>
      </section>

      {/* Logo Cloud */}
      <LogoCloud />

      {/* Models Section */}
      <ModelsSection />

      {/* Pricing Section */}
      <section id="pricing" className="px-4 py-20">
        <PricingSection />
      </section>

      {/* Comparison Table */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center font-bold text-3xl tracking-tight md:text-4xl">
            <span className="font-serif">Perbandingan</span> Platform
          </h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full">
              <thead className="border-b bg-muted/30">
                <tr>
                    <th className="p-4 text-left font-semibold">Fitur</th>
                    <th className="p-4 text-center font-semibold">Sribuai</th>
                    <th className="p-4 text-center font-semibold">OpenAI Direct</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { feature: 'Model tersedia', sribuai: '37+', openai: '5', type: 'text' },
                    { feature: 'OpenAI compatible', sribuai: true, openai: true, type: 'bool' },
                    { feature: 'Bayar via QRIS', sribuai: true, openai: false, type: 'bool' },
                    { feature: 'Paket harian', sribuai: true, openai: false, type: 'bool' },
                    { feature: 'Dashboard realtime', sribuai: 'Full', openai: 'Basic', type: 'text' },
                    { feature: 'Admin control', sribuai: true, openai: false, type: 'bool' },
                    { feature: 'Bahasa Indonesia', sribuai: true, openai: false, type: 'bool' },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="p-4">{row.feature}</td>
                      <td className="p-4 text-center">
                        {row.type === 'bool' ? (
                          row.sribuai ? (
                            <CheckIcon className="inline-block size-5 text-green-600" />
                          ) : (
                            <XIcon className="inline-block size-5 text-red-500" />
                          )
                        ) : (
                          <span className="font-medium">{row.sribuai}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {row.type === 'bool' ? (
                          row.openai ? (
                            <CheckIcon className="inline-block size-5 text-green-600" />
                          ) : (
                            <XIcon className="inline-block size-5 text-red-500" />
                          )
                        ) : (
                          <span className="font-medium">{row.openai}</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <FaqSection />

      {/* CTA Section */}
      <section className="px-4 py-20">
        <CallToAction />
      </section>
    </div>
  )
}
