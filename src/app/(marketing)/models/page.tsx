'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { models, providers } from '@/lib/data/models'
import { SearchIcon, Zap } from 'lucide-react'
import { ProviderIcon } from '@/components/ui/provider-icon'

export default function ModelsPage() {
  const [selectedProvider, setSelectedProvider] = useState('All')
  const [search, setSearch] = useState('')

  const filteredModels = useMemo(
    () =>
      models.filter((m) => {
        const matchProvider = selectedProvider === 'All' || m.provider === selectedProvider
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase())
        return matchProvider && matchSearch
      }),
    [selectedProvider, search]
  )

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-bold text-4xl tracking-tight md:text-5xl">
            37+ Model AI Premium
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Akses semua model AI terbaik melalui satu endpoint OpenAI-compatible
          </p>
        </div>
      </section>

      {/* Models Grid */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-6xl">
          {/* Search + Filter row */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Cari model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {providers.map((provider) => (
                <Button
                  key={provider}
                  variant={selectedProvider === provider ? 'default' : 'outline'}
                  size="sm"
                  className="h-9 text-xs font-medium"
                  onClick={() => setSelectedProvider(provider)}
                >
                  {provider === 'All' ? 'Semua' : provider}
                </Button>
              ))}
            </div>
          </div>

          {/* Empty state */}
          {filteredModels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <SearchIcon className="size-8 opacity-40" />
              <p className="text-sm">Model tidak ditemukan.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredModels.map((model) => (
                <div
                  key={model.name}
                  className="flex flex-col rounded-lg border bg-card p-5 transition-shadow duration-200 hover:shadow-sm"
                >
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
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
