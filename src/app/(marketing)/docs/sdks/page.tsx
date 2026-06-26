import type { Metadata } from "next"
import { LanguageTabs } from "@/components/docs/LanguageTabs"
import { Alert } from "@/components/docs/Alert"

export const metadata: Metadata = {
  title: "SDK Support | Sribuai APIRouter Docs",
  description: "Daftar SDK dan library yang kompatibel dengan Sribuai APIRouter.",
}

const sdkSetupExamples = [
  {
    language: "python",
    label: "Python",
    code: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.sribuai.my.id/v1",
    api_key="sk-sri-xxxxx"
)`,
  },
  {
    language: "typescript",
    label: "JavaScript",
    code: `import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://api.sribuai.my.id/v1',
  apiKey: 'sk-sri-xxxxx',
})`,
  },
  {
    language: "langchain",
    label: "LangChain",
    code: `from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="claude-sonnet-4-5",
    openai_api_base="https://api.sribuai.my.id/v1",
    openai_api_key="sk-sri-xxxxx"
)`,
  },
  {
    language: "bash",
    label: "cURL",
    code: `curl https://api.sribuai.my.id/v1/chat/completions \\
  -H "Authorization: Bearer sk-sri-xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-sonnet-4-5",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`,
  },
]

export default function SdksPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">SDK &amp; Library Support</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Karena endpoint kami 100% OpenAI-compatible, semua library yang support custom base URL bisa digunakan.
      </p>

      <Alert type="tip" title="Zero Migration">
        Cukup ganti <code>base_url</code> ke <code>https://api.sribuai.my.id/v1</code> dan <code>api_key</code> ke key Sribuai Anda.
      </Alert>

      <h2 className="mt-8 text-xl font-semibold">Setup per SDK</h2>
      <LanguageTabs examples={sdkSetupExamples} />

      <h2 className="mt-8 text-xl font-semibold">Kiro Code / Claude Code / Cursor / Cline</h2>
      <p className="mt-2 text-muted-foreground">Konfigurasi di settings aplikasi:</p>
      <div className="mt-3 rounded-lg border bg-muted/30 p-4 text-sm">
        <div className="space-y-2 font-mono text-xs">
          <div><span className="text-muted-foreground">API Base URL:</span> <span className="text-foreground">https://api.sribuai.my.id/v1</span></div>
          <div><span className="text-muted-foreground">API Key:</span> <span className="text-foreground">sk-sri-xxxxx</span></div>
          <div><span className="text-muted-foreground">Model:</span> <span className="text-foreground">claude-sonnet-4-5</span></div>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between border-t pt-6">
        <a href="/docs/errors" className="text-sm font-medium text-primary hover:underline">← Error Codes</a>
        <a href="/docs/examples" className="text-sm font-medium text-primary hover:underline">Contoh Kode →</a>
      </div>
    </div>
  )
}
