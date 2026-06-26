import type { Metadata } from "next"
import { LanguageTabs } from "@/components/docs/LanguageTabs"
import { Alert } from "@/components/docs/Alert"

export const metadata: Metadata = {
  title: "Quick Start | Sribuai APIRouter Docs",
  description: "Mulai menggunakan Sribuai APIRouter dalam 3 langkah. Setup API key dan buat request pertama dalam 2 menit.",
}

const setupExamples = [
  {
    language: "python",
    label: "Python",
    code: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.sribuai.my.id/v1",
    api_key="sk-sri-xxxxxxxxxxxxx"
)`,
  },
  {
    language: "typescript",
    label: "JavaScript",
    code: `import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://api.sribuai.my.id/v1',
  apiKey: 'sk-sri-xxxxxxxxxxxxx',
})`,
  },
  {
    language: "bash",
    label: "cURL",
    code: `curl https://api.sribuai.my.id/v1/chat/completions \\
  -H "Authorization: Bearer sk-sri-xxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"claude-sonnet-4-5","messages":[{"role":"user","content":"Halo!"}]}'`,
  },
]

const firstRequestExamples = [
  {
    language: "python",
    label: "Python",
    code: `response = client.chat.completions.create(
    model="claude-sonnet-4-5",
    messages=[
        {"role": "user", "content": "Halo! Apa model AI yang kamu gunakan?"}
    ]
)
print(response.choices[0].message.content)`,
  },
  {
    language: "typescript",
    label: "JavaScript",
    code: `const response = await client.chat.completions.create({
  model: 'claude-sonnet-4-5',
  messages: [
    { role: 'user', content: 'Halo! Apa model AI yang kamu gunakan?' }
  ],
})
console.log(response.choices[0].message.content)`,
  },
  {
    language: "bash",
    label: "cURL",
    code: `curl https://api.sribuai.my.id/v1/chat/completions \\
  -H "Authorization: Bearer sk-sri-xxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-sonnet-4-5",
    "messages": [{"role":"user","content":"Halo! Apa model AI yang kamu gunakan?"}]
  }'`,
  },
]

export default function DocsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Quick Start</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Mulai menggunakan Sribuai APIRouter dalam 3 langkah.
      </p>

      <Alert type="tip" title="Kompatibel 100% dengan OpenAI SDK">
        Cukup ganti <code>base_url</code> dan <code>api_key</code> — tidak perlu ubah kode lain.
      </Alert>

      <h2 className="mt-8 text-xl font-semibold">1. Daftar &amp; Buat API Key</h2>
      <ol className="mt-3 space-y-2 text-muted-foreground">
        <li>1. <a href="/register" className="text-primary underline-offset-4 hover:underline">Daftar akun gratis</a></li>
        <li>2. Masuk ke <a href="/dashboard" className="text-primary underline-offset-4 hover:underline">Dashboard</a></li>
        <li>3. Buka halaman <strong className="text-foreground">API Keys</strong></li>
        <li>4. Klik <strong className="text-foreground">Buat API Key Baru</strong></li>
        <li>5. Beri nama key Anda (contoh: &quot;Production&quot;)</li>
        <li>6. Copy API key — <strong className="text-foreground">disimpan hanya sekali!</strong></li>
      </ol>

      <h2 className="mt-8 text-xl font-semibold">2. Setup Client</h2>
      <p className="mt-2 text-muted-foreground">
        Sribuai APIRouter 100% kompatibel dengan OpenAI SDK. Ganti satu baris kode:
      </p>
      <LanguageTabs examples={setupExamples} />

      <h2 className="mt-8 text-xl font-semibold">3. Buat Request Pertama</h2>
      <LanguageTabs examples={firstRequestExamples} />

      <Alert type="success" title="Selesai!">
        Anda sudah bisa menggunakan 37+ model AI. Lihat <a href="/docs/models" className="underline underline-offset-4">daftar model lengkap</a>.
      </Alert>

      <div className="mt-10 flex items-center justify-end border-t pt-6">
        <a
          href="/docs/authentication"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Authentication →
        </a>
      </div>
    </div>
  )
}
