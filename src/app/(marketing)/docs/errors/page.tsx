import type { Metadata } from "next"
import { CodeBlock } from "@/components/docs/CodeBlock"

export const metadata: Metadata = {
  title: "Error Codes | Sribuai APIRouter Docs",
  description: "Referensi error codes dan cara menanganinya di Sribuai APIRouter.",
}

const errors = [
  { status: "401", type: "authentication_error", cause: "API key invalid/missing", solution: "Cek API key" },
  { status: "403", type: "permission_error", cause: "Akun suspended", solution: "Hubungi support" },
  { status: "429", type: "quota_exceeded", cause: "Quota harian habis", solution: "Topup atau tunggu reset" },
  { status: "429", type: "rate_limit_error", cause: "Terlalu banyak request/menit", solution: "Kurangi frekuensi" },
  { status: "500", type: "server_error", cause: "Error internal", solution: "Coba lagi, hubungi support" },
  { status: "502", type: "gateway_error", cause: "Provider tidak tersedia", solution: "Coba lagi sebentar" },
  { status: "503", type: "maintenance", cause: "Maintenance", solution: "Cek status page" },
]

const errorFormatExample = `{
  "error": {
    "message": "Deskripsi error",
    "type": "error_type",
    "code": "error_code"
  }
}`

export default function ErrorsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Error Codes</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Referensi lengkap HTTP status codes dan cara mengatasinya.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Format Error Response</h2>
      <CodeBlock code={errorFormatExample} language="json" className="mt-3" />

      <h2 className="mt-8 text-xl font-semibold">HTTP Status Codes</h2>
      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Penyebab</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Solusi</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((e, i) => (
              <tr key={`${e.status}-${e.type}`} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                    e.status.startsWith("4") ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" :
                    e.status.startsWith("5") ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                    "bg-muted text-muted-foreground"
                  }`}>{e.status}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{e.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.cause}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.solution}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 flex items-center justify-between border-t pt-6">
        <a href="/docs/rate-limits" className="text-sm font-medium text-primary hover:underline">← Rate Limits</a>
        <a href="/docs/sdks" className="text-sm font-medium text-primary hover:underline">SDK Support →</a>
      </div>
    </div>
  )
}
