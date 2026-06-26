import type { Metadata } from "next"
import { ApiEndpoint } from "@/components/docs/ApiEndpoint"
import { ParamTable } from "@/components/docs/ParamTable"
import { LanguageTabs } from "@/components/docs/LanguageTabs"
import { CodeBlock } from "@/components/docs/CodeBlock"

export const metadata: Metadata = {
  title: "Chat Completions | Sribuai APIRouter Docs",
  description: "Dokumentasi endpoint Chat Completions API Sribuai APIRouter.",
}

const params = [
  { name: "model", type: "string", required: true, description: "ID model yang digunakan" },
  { name: "messages", type: "array", required: true, description: "Array pesan conversation" },
  { name: "max_tokens", type: "integer", required: false, description: "Maksimal token output" },
  { name: "temperature", type: "float", required: false, description: "0–2, default 1. Semakin tinggi semakin kreatif" },
  { name: "stream", type: "boolean", required: false, description: "Aktifkan streaming SSE" },
  { name: "top_p", type: "float", required: false, description: "Nucleus sampling, 0–1" },
  { name: "stop", type: "string | array", required: false, description: "Token stop sequence" },
]

const requestExamples = [
  {
    language: "python",
    label: "Python",
    code: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.sribuai.my.id/v1",
    api_key="sk-sri-xxxxx"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-5",
    messages=[
        {"role": "system", "content": "Kamu adalah asisten helpful."},
        {"role": "user", "content": "Jelaskan apa itu API Gateway"}
    ],
    max_tokens=1000,
    temperature=0.7
)

print(response.choices[0].message.content)`,
  },
  {
    language: "typescript",
    label: "JavaScript",
    code: `import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://api.sribuai.my.id/v1',
  apiKey: 'sk-sri-xxxxx',
})

const response = await client.chat.completions.create({
  model: 'claude-sonnet-4-5',
  messages: [
    { role: 'system', content: 'Kamu adalah asisten helpful.' },
    { role: 'user', content: 'Jelaskan apa itu API Gateway' },
  ],
  max_tokens: 1000,
  temperature: 0.7,
})

console.log(response.choices[0].message.content)`,
  },
  {
    language: "bash",
    label: "cURL",
    code: `curl https://api.sribuai.my.id/v1/chat/completions \\
  -H "Authorization: Bearer sk-sri-xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-sonnet-4-5",
    "messages": [
      {"role": "system", "content": "Kamu adalah asisten helpful."},
      {"role": "user", "content": "Jelaskan apa itu API Gateway"}
    ],
    "max_tokens": 1000,
    "temperature": 0.7
  }'`,
  },
]

const responseExample = `{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "model": "claude-sonnet-4-5",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "API Gateway adalah..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 120,
    "total_tokens": 165
  }
}`

export default function ChatCompletionsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Chat Completions</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Endpoint utama untuk membuat percakapan dengan model AI.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Endpoint</h2>
      <ApiEndpoint method="POST" path="https://api.sribuai.my.id/v1/chat/completions" />

      <h2 className="mt-8 text-xl font-semibold">Request Body</h2>
      <ParamTable params={params} />

      <h2 className="mt-8 text-xl font-semibold">Contoh Request</h2>
      <LanguageTabs examples={requestExamples} />

      <h2 className="mt-8 text-xl font-semibold">Response</h2>
      <CodeBlock code={responseExample} language="json" className="mt-3" />

      <div className="mt-10 flex items-center justify-between border-t pt-6">
        <a href="/docs/models" className="text-sm font-medium text-primary hover:underline">← Models</a>
        <a href="/docs/streaming" className="text-sm font-medium text-primary hover:underline">Streaming →</a>
      </div>
    </div>
  )
}
