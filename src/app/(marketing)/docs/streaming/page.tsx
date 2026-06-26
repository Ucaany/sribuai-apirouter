import type { Metadata } from "next"
import { ApiEndpoint } from "@/components/docs/ApiEndpoint"
import { LanguageTabs } from "@/components/docs/LanguageTabs"
import { Alert } from "@/components/docs/Alert"

export const metadata: Metadata = {
  title: "Streaming | Sribuai APIRouter Docs",
  description: "Cara menggunakan streaming SSE di Sribuai APIRouter.",
}

const streamExamples = [
  {
    language: "python",
    label: "Python",
    code: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.sribuai.my.id/v1",
    api_key="sk-sri-xxxxx"
)

stream = client.chat.completions.create(
    model="claude-sonnet-4-5",
    messages=[{"role": "user", "content": "Tulis puisi tentang AI"}],
    stream=True,
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="", flush=True)`,
  },
  {
    language: "typescript",
    label: "JavaScript",
    code: `import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://api.sribuai.my.id/v1',
  apiKey: 'sk-sri-xxxxx',
})

const stream = await client.chat.completions.create({
  model: 'claude-sonnet-4-5',
  messages: [{ role: 'user', content: 'Tulis puisi tentang AI' }],
  stream: true,
})

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content ?? ''
  process.stdout.write(content)
}`,
  },
  {
    language: "bash",
    label: "cURL",
    code: `curl https://api.sribuai.my.id/v1/chat/completions \\
  -H "Authorization: Bearer sk-sri-xxxxx" \\
  -H "Content-Type: application/json" \\
  --no-buffer \\
  -d '{
    "model": "claude-sonnet-4-5",
    "messages": [{"role": "user", "content": "Tulis puisi tentang AI"}],
    "stream": true
  }'`,
  },
]

export default function StreamingPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Streaming</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Terima respons secara real-time menggunakan Server-Sent Events (SSE).
      </p>

      <h2 className="mt-8 text-xl font-semibold">Endpoint</h2>
      <ApiEndpoint method="POST" path="https://api.sribuai.my.id/v1/chat/completions" />

      <Alert type="info" title="Cara Mengaktifkan">
        Tambahkan <code>stream: true</code> pada request body. Format respons menggunakan SSE — setiap chunk dikirim sebagai <code>data: &#123;...&#125;</code>.
      </Alert>

      <h2 className="mt-8 text-xl font-semibold">Contoh Streaming</h2>
      <LanguageTabs examples={streamExamples} />

      <h2 className="mt-8 text-xl font-semibold">Format Chunk</h2>
      <p className="mt-2 text-muted-foreground">Setiap chunk SSE memiliki format:</p>
      <pre className="mt-3 overflow-x-auto rounded-lg border bg-zinc-950 p-4 text-sm text-zinc-100">
{`data: {"id":"chatcmpl-abc","object":"chat.completion.chunk","choices":[{"delta":{"content":"Halo"},"index":0}]}

data: {"id":"chatcmpl-abc","object":"chat.completion.chunk","choices":[{"delta":{"content":" dunia"},"index":0}]}

data: [DONE]`}
      </pre>

      <Alert type="tip" title="End of Stream">
        Stream berakhir saat menerima <code>data: [DONE]</code>.
      </Alert>

      <div className="mt-10 flex items-center justify-between border-t pt-6">
        <a href="/docs/chat-completions" className="text-sm font-medium text-primary hover:underline">← Chat Completions</a>
        <a href="/docs/rate-limits" className="text-sm font-medium text-primary hover:underline">Rate Limits →</a>
      </div>
    </div>
  )
}
