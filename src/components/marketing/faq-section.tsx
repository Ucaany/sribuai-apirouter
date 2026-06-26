'use client'

import { useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'Apa itu Sribuai APIRouter?',
    answer: 'Platform API Gateway yang menyediakan akses ke 37+ model AI melalui satu endpoint OpenAI-compatible.',
  },
  {
    question: 'Bagaimana cara mulai menggunakan?',
    answer: 'Daftar gratis → Buat API key → Ganti base URL di kode Anda → Selesai.',
  },
  {
    question: 'Apakah kompatibel dengan OpenAI SDK?',
    answer: 'Ya, 100% kompatibel. Cukup ganti OPENAI_BASE_URL ke endpoint kami.',
  },
  {
    question: 'Apa yang terjadi jika quota habis?',
    answer: 'Request akan ditolak. Anda bisa topup add-on request atau tunggu reset quota besok pukul 00:00 WIB.',
  },
  {
    question: 'Metode pembayaran apa yang tersedia?',
    answer: 'QRIS (GoPay, OVO, DANA, ShopeePay, semua mobile banking).',
  },
  {
    question: 'Apakah data request saya aman?',
    answer: 'Ya. Kami tidak menyimpan konten request Anda. Hanya metadata (model, token count, timestamp) yang dicatat.',
  },
  {
    question: 'Bisakah saya upgrade atau downgrade plan?',
    answer: 'Ya, bisa kapan saja. Upgrade aktif langsung, downgrade aktif di periode berikutnya.',
  },
  {
    question: 'Apakah ada trial untuk plan berbayar?',
    answer: 'Ya, kami menyediakan trial Pro gratis 14 hari untuk pengguna baru.',
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="font-bold text-3xl tracking-tight md:text-4xl">
            Pertanyaan yang <span className="font-serif">Sering Diajukan</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Jawaban untuk pertanyaan umum tentang <span className="font-serif">Sribuai APIRouter</span>
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-lg border"
            >
              <button
                className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-muted/50"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span>{faq.question}</span>
                <ChevronDownIcon
                  className={cn(
                    'size-5 shrink-0 text-muted-foreground transition-transform',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>
              {openIndex === index && (
                <div className="border-t px-4 py-3 text-muted-foreground">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
