import type { Metadata } from "next"
import { CodeBlock } from "@/components/docs/CodeBlock"
import { Alert } from "@/components/docs/Alert"

export const metadata: Metadata = {
  title: "Rate Limits & Quota | Sribuai APIRouter Docs",
  description: "Informasi quota harian dan rate limits per tier di Sribuai APIRouter.",
}

const tiers = [
  { tier: "Free", requests: "10", maxTokens: "50.000" },
  { tier: "Starter", requests: "100", maxTokens: "100.000" },
  { tier: "Pro", requests: "1.000", maxTokens: "200.000" },
  { tier: "Enterprise", requests: "Unlimited", maxTokens: "500.000" },
]

const quotaErrorExample = `{
  "error": {
    "message": "Daily quota exceeded",
    "type": "quota_exceeded",
    "daily_limit": 100,
    "tier": "starter"
  }
}`

export default function RateLimitsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Rate Limits &amp; Quota</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Setiap akun memiliki quota request harian berdasarkan tier berlangganan.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Quota Harian</h2>
      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tier</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Request/Hari</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Max Token/Request</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((t, i) => (
              <tr key={t.tier} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                <td className="px-4 py-3 font-medium text-foreground">{t.tier}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.requests}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.maxTokens}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Alert type="info" title="Reset Quota">
        Quota reset setiap hari pukul <strong>00:00 WIB</strong>.
      </Alert>

      <h2 className="mt-8 text-xl font-semibold">Jika Quota Habis</h2>
      <p className="mt-2 text-muted-foreground">Response HTTP 429:</p>
      <CodeBlock code={quotaErrorExample} language="json" className="mt-3" />

      <p className="mt-4 text-muted-foreground">Solusi:</p>
      <ol className="mt-2 space-y-2 text-muted-foreground">
        <li>1. Beli topup add-on di <a href="/dashboard/topup" className="text-primary underline-offset-4 hover:underline">dashboard</a></li>
        <li>2. Tunggu reset quota besok 00:00 WIB</li>
        <li>3. Upgrade ke tier lebih tinggi di <a href="/pricing" className="text-primary underline-offset-4 hover:underline">halaman harga</a></li>
      </ol>

      <h2 className="mt-8 text-xl font-semibold">Cek Sisa Quota</h2>
      <p className="mt-2 text-muted-foreground">Lihat di dashboard atau header response:</p>
      <CodeBlock
        code={`X-RateLimit-Remaining: 47
X-RateLimit-Reset: 1719244800`}
        language="text"
        className="mt-3"
      />

      <div className="mt-10 flex items-center justify-between border-t pt-6">
        <a href="/docs/streaming" className="text-sm font-medium text-primary hover:underline">← Streaming</a>
        <a href="/docs/errors" className="text-sm font-medium text-primary hover:underline">Error Codes →</a>
      </div>
    </div>
  )
}
