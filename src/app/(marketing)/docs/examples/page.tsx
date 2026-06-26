import type { Metadata } from "next"
import { LanguageTabs } from "@/components/docs/LanguageTabs"

export const metadata: Metadata = {
  title: "Contoh Kode | Sribuai APIRouter Docs",
  description: "Kumpulan contoh kode siap pakai untuk berbagai use case dengan Sribuai APIRouter.",
}

const chatbotExamples = [
  {
    language: "python",
    label: "Python",
    code: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.sribuai.my.id/v1",
    api_key="sk-sri-xxxxx"
)

history = []

while True:
    user_input = input("Kamu: ")
    history.append({"role": "user", "content": user_input})
    
    response = client.chat.completions.create(
        model="claude-sonnet-4-5",
        messages=history
    )
    
    reply = response.choices[0].message.content
    history.append({"role": "assistant", "content": reply})
    print(f"AI: {reply}")`,
  },
  {
    language: "typescript",
    label: "JavaScript",
    code: `import OpenAI from 'openai'
import * as readline from 'readline'

const client = new OpenAI({
  baseURL: 'https://api.sribuai.my.id/v1',
  apiKey: 'sk-sri-xxxxx',
})

const history: OpenAI.Chat.ChatCompletionMessageParam[] = []
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

const chat = () => {
  rl.question('Kamu: ', async (input) => {
    history.push({ role: 'user', content: input })
    const res = await client.chat.completions.create({
      model: 'claude-sonnet-4-5',
      messages: history,
    })
    const reply = res.choices[0].message.content ?? ''
    history.push({ role: 'assistant', content: reply })
    console.log(\`AI: \${reply}\`)
    chat()
  })
}
chat()`,
  },
]

const summaryExamples = [
  {
    language: "python",
    label: "Python",
    code: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.sribuai.my.id/v1",
    api_key="sk-sri-xxxxx"
)

def summarize(text: str) -> str:
    response = client.chat.completions.create(
        model="deepseek-v3",
        messages=[
            {
                "role": "system",
                "content": "Kamu adalah asisten yang ahli merangkum teks. Buat ringkasan singkat dan jelas dalam Bahasa Indonesia."
            },
            {
                "role": "user",
                "content": f"Rangkum teks berikut:\\n\\n{text}"
            }
        ],
        max_tokens=500
    )
    return response.choices[0].message.content

artikel = """
Kecerdasan buatan (AI) telah mengubah cara kita bekerja dan berinteraksi...
"""
print(summarize(artikel))`,
  },
  {
    language: "typescript",
    label: "JavaScript",
    code: `import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://api.sribuai.my.id/v1',
  apiKey: 'sk-sri-xxxxx',
})

async function summarize(text: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: 'deepseek-v3',
    messages: [
      {
        role: 'system',
        content: 'Kamu adalah asisten yang ahli merangkum teks. Buat ringkasan singkat dan jelas dalam Bahasa Indonesia.',
      },
      { role: 'user', content: \`Rangkum teks berikut:\\n\\n\${text}\` },
    ],
    max_tokens: 500,
  })
  return response.choices[0].message.content ?? ''
}`,
  },
]

const streamingExamples = [
  {
    language: "python",
    label: "Python",
    code: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.sribuai.my.id/v1",
    api_key="sk-sri-xxxxx"
)

print("AI: ", end="", flush=True)
stream = client.chat.completions.create(
    model="claude-sonnet-4-5",
    messages=[{"role": "user", "content": "Ceritakan kisah pendek yang menarik"}],
    stream=True,
    max_tokens=500
)

for chunk in stream:
    content = chunk.choices[0].delta.content
    if content:
        print(content, end="", flush=True)
print()`,
  },
  {
    language: "typescript",
    label: "JavaScript",
    code: `import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://api.sribuai.my.id/v1',
  apiKey: 'sk-sri-xxxxx',
})

process.stdout.write('AI: ')
const stream = await client.chat.completions.create({
  model: 'claude-sonnet-4-5',
  messages: [{ role: 'user', content: 'Ceritakan kisah pendek yang menarik' }],
  stream: true,
  max_tokens: 500,
})

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content ?? ''
  process.stdout.write(content)
}
console.log()`,
  },
]

export default function ExamplesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Contoh Kode</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Kumpulan contoh siap pakai untuk berbagai use case umum.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Chatbot Interaktif</h2>
      <p className="mt-2 text-muted-foreground">Chatbot dengan memory percakapan (multi-turn).</p>
      <LanguageTabs examples={chatbotExamples} />

      <h2 className="mt-8 text-xl font-semibold">Rangkum Artikel</h2>
      <p className="mt-2 text-muted-foreground">Merangkum teks panjang menjadi ringkasan singkat.</p>
      <LanguageTabs examples={summaryExamples} />

      <h2 className="mt-8 text-xl font-semibold">Streaming Response</h2>
      <p className="mt-2 text-muted-foreground">Tampilkan respons secara real-time.</p>
      <LanguageTabs examples={streamingExamples} />

      <div className="mt-10 flex items-center justify-start border-t pt-6">
        <a href="/docs/sdks" className="text-sm font-medium text-primary hover:underline">← SDK Support</a>
      </div>
    </div>
  )
}
