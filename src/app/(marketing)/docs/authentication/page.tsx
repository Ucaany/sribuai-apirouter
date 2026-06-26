import type { Metadata } from "next"
import { CodeBlock } from "@/components/docs/CodeBlock"
import { Alert } from "@/components/docs/Alert"

export const metadata: Metadata = {
  title: "Authentication | Sribuai APIRouter Docs",
  description: "Cara setup API key dan best practices keamanan untuk Sribuai APIRouter.",
}

export default function AuthenticationPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Authentication</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Semua request ke API Sribuai harus disertai API key yang valid.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Format API Key</h2>
      <p className="mt-2 text-muted-foreground">
        Semua API key Sribuai memiliki prefix <code className="rounded bg-muted px-1.5 py-0.5 text-sm">sk-sri-</code>:
      </p>
      <CodeBlock code="sk-sri-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" language="text" className="mt-3" />

      <h2 className="mt-8 text-xl font-semibold">Cara Menggunakan API Key</h2>
      <p className="mt-2 text-muted-foreground">
        Kirim API key melalui header <code className="rounded bg-muted px-1.5 py-0.5 text-sm">Authorization</code>:
      </p>
      <CodeBlock code={`Authorization: Bearer sk-sri-xxxxx`} language="text" className="mt-3" />

      <h2 className="mt-8 text-xl font-semibold">Environment Variable</h2>
      <CodeBlock
        code={`# .env.local
SRIBUAI_API_KEY=sk-sri-xxxxx
SRIBUAI_BASE_URL=https://api.sribuai.my.id/v1`}
        language="bash"
        filename=".env.local"
        className="mt-3"
      />

      <h2 className="mt-8 text-xl font-semibold">Best Practices Keamanan</h2>
      <ul className="mt-3 space-y-2 text-muted-foreground">
        <li>• Jangan pernah commit API key ke repository</li>
        <li>• Gunakan environment variable di semua environment</li>
        <li>• Set IP whitelist di dashboard untuk production</li>
        <li>• Rotate key secara berkala</li>
        <li>• Gunakan key berbeda untuk development dan production</li>
      </ul>

      <Alert type="warning" title="API Key Bocor?">
        Login ke dashboard → buka <strong>API Keys</strong> → klik <strong>Revoke</strong> pada key yang bocor → buat key baru.
      </Alert>

      <div className="mt-10 flex items-center justify-between border-t pt-6">
        <a href="/docs" className="text-sm font-medium text-primary hover:underline">← Quick Start</a>
        <a href="/docs/models" className="text-sm font-medium text-primary hover:underline">Models →</a>
      </div>
    </div>
  )
}
