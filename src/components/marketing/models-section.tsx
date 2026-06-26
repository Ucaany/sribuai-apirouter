'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { models, providers } from '@/lib/data/models'
import { Zap } from 'lucide-react'
import { ProviderIcon } from '@/components/ui/provider-icon'

export function ModelsSection() {
  const [selectedProvider, setSelectedProvider] = useState('All')

  const filteredModels = useMemo(
    () =>
      selectedProvider === 'All'
        ? models
        : models.filter((m) => m.provider === selectedProvider),
    [selectedProvider]
  )

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="font-bold text-3xl tracking-tight md:text-4xl">
            Model AI yang Tersedia
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Akses 37+ model AI premium melalui satu API
          </p>
        </div>

        {/* Provider filter buttons */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {providers.map((provider) => (
            <Button
              key={provider}
              variant={selectedProvider === provider ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs font-medium"
              onClick={() => setSelectedProvider(provider)}
            >
              {provider === 'All' ? 'Semua' : provider}
            </Button>
          ))}
        </div>

        {/* Grid */}
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

              {/* Meta row */}
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span>
                  Context:&nbsp;<span className="font-medium text-foreground">{model.contextWindow}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="size-3 text-amber-500" />
                  Streaming
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button variant="outline" render={<Link href="/models" />} nativeButton={false}>Lihat Semua Model</Button>
        </div>
      </div>
    </section>
  )
}
