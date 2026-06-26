"use client"

import { useState } from "react"
import { Search, ChevronDown, MessageCircle, Mail } from "lucide-react"

const faqs = [
  {
    category: "Akun",
    items: [
      { q: "Bagaimana cara daftar?", a: "Klik tombol 'Mulai Gratis' di halaman utama, isi email dan password, lalu verifikasi email Anda." },
      { q: "Bagaimana cara ganti password?", a: "Masuk ke Dashboard → Settings → Security → klik 'Ganti Password'." },
      { q: "Bagaimana cara hapus akun?", a: "Masuk ke Dashboard → Settings → Danger Zone → klik 'Hapus Akun'. Tindakan ini tidak dapat dibatalkan." },
      { q: "Kenapa email verifikasi tidak masuk?", a: "Cek folder spam/junk. Jika tidak ada, tunggu 5 menit dan coba kirim ulang dari halaman verifikasi." },
    ],
  },
  {
    category: "Billing",
    items: [
      { q: "Metode pembayaran apa saja yang tersedia?", a: "Saat ini kami mendukung QRIS (semua e-wallet dan mobile banking yang mendukung QRIS)." },
      { q: "Bagaimana cara topup request tambahan?", a: "Masuk ke Dashboard → Topup → pilih paket → bayar via QRIS. Request akan aktif setelah pembayaran dikonfirmasi." },
      { q: "Kapan subscription saya renewal?", a: "Subscription renewal setiap bulan pada tanggal yang sama dengan tanggal pertama berlangganan." },
      { q: "Bagaimana cara cancel subscription?", a: "Dashboard → Subscription → klik 'Cancel Subscription'. Akses berlanjut hingga akhir periode billing." },
      { q: "Bisakah minta refund?", a: "Refund dapat diproses dalam 24 jam pertama setelah pembayaran jika belum ada request yang digunakan. Hubungi support untuk dibantu." },
      { q: "Kenapa pembayaran QRIS saya gagal?", a: "Pastikan saldo mencukupi dan QR code di-scan dalam 10 menit. Jika masih gagal, coba refresh halaman dan buat pembayaran baru." },
    ],
  },
  {
    category: "API",
    items: [
      { q: "Bagaimana cara membuat API key?", a: "Dashboard → API Keys → klik 'Buat API Key Baru' → beri nama → copy key. Simpan baik-baik karena hanya ditampilkan sekali." },
      { q: "Berapa maksimal API key per akun?", a: "Tier Free: 2 key, Starter: 5 key, Pro: 20 key, Enterprise: unlimited." },
      { q: "Apa yang terjadi jika API key saya bocor?", a: "Segera revoke key di Dashboard → API Keys → Revoke, lalu buat key baru. Request yang sudah terjadi tidak bisa dibatalkan." },
      { q: "Kenapa request saya ditolak dengan error 429?", a: "Quota harian Anda sudah habis. Beli topup di dashboard atau tunggu reset quota pukul 00:00 WIB." },
      { q: "Model apa saja yang tersedia?", a: "Tersedia 37+ model dari Anthropic (Claude), OpenAI (GPT), Google (Gemini), DeepSeek, dan lainnya. Lihat daftar lengkap di halaman /docs/models." },
    ],
  },
  {
    category: "Teknis",
    items: [
      { q: "Apakah endpoint kompatibel dengan OpenAI SDK?", a: "Ya, 100% kompatibel. Cukup ganti base_url ke https://api.sribuai.my.id/v1 dan api_key ke key Sribuai Anda." },
      { q: "Apakah mendukung streaming?", a: "Ya. Tambahkan stream: true pada request body. Respons dikirim via Server-Sent Events (SSE)." },
      { q: "Bagaimana cara set IP whitelist?", a: "Dashboard → API Keys → pilih key → klik 'Settings' → masukkan IP yang diizinkan." },
      { q: "Apa perbedaan prompt_tokens vs completion_tokens?", a: "prompt_tokens adalah token dari pesan input (messages), sedangkan completion_tokens adalah token dari respons model. Total keduanya adalah total_tokens." },
      { q: "Bagaimana cara integrasi dengan LangChain?", a: "Gunakan ChatOpenAI dengan parameter openai_api_base='https://api.sribuai.my.id/v1' dan openai_api_key='sk-sri-xxxxx'. Lihat contoh lengkap di /docs/sdks." },
    ],
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-medium transition-colors hover:bg-muted/50"
      >
        <span>{q}</span>
        <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground">{a}</div>
      )}
    </div>
  )
}

export function BantuanClient() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Semua")

  const categories = ["Semua", ...faqs.map((f) => f.category)]

  const filtered = faqs
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          (activeCategory === "Semua" || activeCategory === group.category) &&
          (search === "" ||
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase()))
      ),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Pusat Bantuan</h1>
        <p className="mt-3 text-muted-foreground">
          Temukan jawaban untuk pertanyaan umum seputar Sribuai APIRouter.
        </p>
      </div>

      <div className="relative mt-8">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari pertanyaan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border bg-background py-2.5 pl-9 pr-4 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-6">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Tidak ada hasil untuk &quot;{search}&quot;.
          </p>
        ) : (
          filtered.map((group) => (
            <div key={group.category} className="overflow-hidden rounded-lg border">
              <div className="bg-muted/50 px-4 py-2.5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.category}
                </h2>
              </div>
              {group.items.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          ))
        )}
      </div>

      <div className="mt-12 rounded-xl border bg-muted/30 p-6">
        <h2 className="text-lg font-semibold">Masih butuh bantuan?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tim kami siap membantu Anda.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <a
            href="https://wa.me/62xxxxxxxxxx"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <MessageCircle className="size-4 text-green-500" />
            <div>
              <div>WhatsApp Support</div>
              <div className="text-xs text-muted-foreground">Respon dalam &lt;2 jam · Senin–Jumat 09:00–17:00 WIB</div>
            </div>
          </a>
          <a
            href="mailto:support@sribuai.my.id"
            className="flex items-center gap-2 rounded-lg border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Mail className="size-4 text-blue-500" />
            <div>
              <div>Email Support</div>
              <div className="text-xs text-muted-foreground">support@sribuai.my.id</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
