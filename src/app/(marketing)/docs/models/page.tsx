import type { Metadata } from "next"
import { CodeBlock } from "@/components/docs/CodeBlock"
import { Alert } from "@/components/docs/Alert"

export const metadata: Metadata = {
  title: "Models | Sribuai APIRouter Docs",
  description: "Daftar model AI yang tersedia di Sribuai APIRouter beserta cara penggunaannya.",
}

const models = [
  { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", provider: "Anthropic", context: "200K" },
  { id: "claude-opus-4-7", name: "Claude Opus 4.7", provider: "Anthropic", context: "200K" },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", context: "128K" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", context: "128K" },
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI", context: "128K" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI", context: "16K" },
  { id: "gemini-pro", name: "Gemini Pro", provider: "Google", context: "32K" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google", context: "1M" },
  { id: "deepseek-v3", name: "DeepSeek V3", provider: "DeepSeek", context: "128K" },
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek", context: "128K" },
]

export default function ModelsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Model yang Tersedia</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Semua model tersedia untuk semua tier. Batasan berbeda berdasarkan tier — lihat{" "}
        <a href="/docs/rate-limits" className="text-primary underline-offset-4 hover:underline">Rate Limits</a>.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Cara Menggunakan Model</h2>
      <p className="mt-2 text-muted-foreground">
        Gunakan <code className="rounded bg-muted px-1.5 py-0.5 text-sm">model_id</code> pada field <code className="rounded bg-muted px-1.5 py-0.5 text-sm">model</code>:
      </p>
      <CodeBlock
        code={`response = client.chat.completions.create(
    model="claude-sonnet-4-5",  # <-- model_id di sini
    messages=[{"role": "user", "content": "Halo!"}]
)`}
        language="python"
        className="mt-3"
      />

      <h2 className="mt-8 text-xl font-semibold">Daftar Model</h2>
      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Model ID</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Provider</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Context</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m, i) => (
              <tr key={m.id} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                <td className="px-4 py-3">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{m.id}</code>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{m.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.provider}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.context}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 text-xl font-semibold">Daftar Lengkap via API</h2>
      <CodeBlock
        code={`curl https://api.sribuai.my.id/v1/models \\
  -H "Authorization: Bearer sk-sri-xxxxx"`}
        language="bash"
        className="mt-3"
      />

      <Alert type="info">
        Model baru ditambahkan secara berkala. Ikuti <a href="#" className="underline underline-offset-4">changelog</a> untuk update terbaru.
      </Alert>

      <div className="mt-10 flex items-center justify-between border-t pt-6">
        <a href="/docs/authentication" className="text-sm font-medium text-primary hover:underline">← Authentication</a>
        <a href="/docs/chat-completions" className="text-sm font-medium text-primary hover:underline">Chat Completions →</a>
      </div>
    </div>
  )
}
