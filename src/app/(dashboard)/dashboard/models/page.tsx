'use client'

import { useState } from 'react'
import { models, providers } from '@/lib/data/models'
import type { Model } from '@/lib/data/models'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  CheckIcon,
  CopyIcon,
  SearchIcon,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProviderIcon } from '@/components/ui/provider-icon'

type SnippetLang = 'python' | 'javascript' | 'curl'

function buildSnippets(modelId: string): Record<SnippetLang, string> {
  return {
    python: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.sribuai.my.id/v1",
    api_key="YOUR_API_KEY"
)

response = client.chat.completions.create(
    model="${modelId}",
    messages=[{"role": "user", "content": "Halo!"}]
)
print(response.choices[0].message.content)`,
    javascript: `import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.sribuai.my.id/v1',
  apiKey: 'YOUR_API_KEY',
});

const response = await client.chat.completions.create({
  model: '${modelId}',
  messages: [{ role: 'user', content: 'Halo!' }],
});
console.log(response.choices[0].message.content);`,
    curl: `curl https://api.sribuai.my.id/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${modelId}",
    "messages": [{"role": "user", "content": "Halo!"}]
  }'`,
  }
}

/** Isolated per-card dialog so each card has its own activeSnippet + copied state */
function CodeDialog({ model, modelId }: { model: Model; modelId: string }) {
  const [activeSnippet, setActiveSnippet] = useState<SnippetLang>('python')
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedSnippet(id)
    setTimeout(() => setCopiedSnippet(null), 2000)
  }

  const snippets = buildSnippets(modelId)

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" className="w-full mt-4 h-8 text-xs font-medium" />}>
        Gunakan Model Ini
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{model.name} — Code Example</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            {(['python', 'javascript', 'curl'] as const).map((lang) => (
              <Button
                key={lang}
                size="sm"
                variant={activeSnippet === lang ? 'default' : 'outline'}
                onClick={() => setActiveSnippet(lang)}
              >
                {lang === 'javascript'
                  ? 'JavaScript'
                  : lang.charAt(0).toUpperCase() + lang.slice(1)}
              </Button>
            ))}
          </div>
          <div className="relative">
            <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed">
              {snippets[activeSnippet]}
            </pre>
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 size-7"
              onClick={() => handleCopy(snippets[activeSnippet], `${modelId}-${activeSnippet}`)}
            >
              {copiedSnippet === `${modelId}-${activeSnippet}` ? (
                <CheckIcon className="size-3" />
              ) : (
                <CopyIcon className="size-3" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ModelsPage() {
  const [search, setSearch] = useState('')
  const [filterProvider, setFilterProvider] = useState('All')

  const filteredModels = models.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase())
    const matchProvider = filterProvider === 'All' || m.provider === filterProvider
    return matchSearch && matchProvider
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Models</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {models.length} model AI tersedia dari {providers.length - 1} provider
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Cari model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={filterProvider} onValueChange={(v) => { if (v) setFilterProvider(v) }}>
          <SelectTrigger className="w-full md:w-44 h-9">
            <SelectValue placeholder="Provider" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((p) => (
              <SelectItem key={p} value={p}>
                {p === 'All' ? 'Semua Provider' : p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {filteredModels.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <SearchIcon className="size-8 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">Model tidak ditemukan.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredModels.map((model) => {
            const modelId = model.name.toLowerCase().replace(/\s+/g, '-')
            return (
              <Card
                key={model.name}
                className="flex flex-col border hover:shadow-sm transition-shadow duration-200"
              >
                <CardContent className="flex flex-col flex-1 p-5">
                  {/* Provider row + badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center size-6 rounded-md bg-muted text-muted-foreground">
                        <ProviderIcon provider={model.provider} />
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">{model.provider}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[11px] font-semibold px-2 py-0.5 rounded-full border',
                        model.badge === 'Free'
                          ? 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:bg-emerald-950/40'
                          : 'border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:bg-blue-950/40'
                      )}
                    >
                      {model.badge}
                    </Badge>
                  </div>

                  {/* Model name */}
                  <h3 className="font-semibold text-base leading-snug">{model.name}</h3>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed flex-1">
                    {model.description}
                  </p>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t">
                    <span className="text-xs text-muted-foreground">
                      Context:&nbsp;<span className="font-medium text-foreground">{model.contextWindow}</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Zap className="size-3 text-amber-500" />
                      Streaming
                    </span>
                  </div>

                  {/* CTA button — isolated dialog per card */}
                  <CodeDialog model={model} modelId={modelId} />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
