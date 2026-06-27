'use client'

import { MailIcon, MessageCircleIcon, FileTextIcon } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Hubungi Kami</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Ada pertanyaan atau butuh bantuan? Tim kami siap membantu.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-12">
        <div className="flex flex-col items-center text-center rounded-lg border bg-card p-6 gap-3">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircleIcon className="size-6 text-primary" />
          </div>
          <h3 className="font-semibold">WhatsApp</h3>
          <p className="text-sm text-muted-foreground">Respon cepat untuk pertanyaan teknis</p>
          <a
            href="https://wa.me/6285397222785"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            Chat Sekarang
          </a>
        </div>

        <div className="flex flex-col items-center text-center rounded-lg border bg-card p-6 gap-3">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
            <MailIcon className="size-6 text-primary" />
          </div>
          <h3 className="font-semibold">Email</h3>
          <p className="text-sm text-muted-foreground">Untuk pertanyaan umum dan kerja sama</p>
          <a
            href="mailto:support@sribuai.my.id"
            className="text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            support@sribuai.my.id
          </a>
        </div>

        <div className="flex flex-col items-center text-center rounded-lg border bg-card p-6 gap-3">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
            <FileTextIcon className="size-6 text-primary" />
          </div>
          <h3 className="font-semibold">Dokumentasi</h3>
          <p className="text-sm text-muted-foreground">Panduan lengkap penggunaan API</p>
          <a
            href="/docs"
            className="text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            Buka Docs
          </a>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-8">
        <h2 className="text-xl font-semibold mb-6">Kirim Pesan</h2>
        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Nama</label>
              <input
                type="text"
                placeholder="Nama lengkap"
                className="h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="email@contoh.com"
                className="h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Subjek</label>
            <input
              type="text"
              placeholder="Topik pertanyaan"
              className="h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Pesan</label>
            <textarea
              rows={5}
              placeholder="Tulis pesan Anda..."
              className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <a
            href="mailto:support@sribuai.my.id"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Kirim Pesan
          </a>
        </form>
      </div>
    </div>
  )
}
