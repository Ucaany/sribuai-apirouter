'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { SendIcon, Loader2Icon, BotIcon, UserIcon, Trash2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type ModelConfig = Database['public']['Tables']['model_configs']['Row']
type Message = { role: 'user' | 'assistant'; content: string }

const SYSTEM_PROMPT = `Kamu adalah asisten AI yang dikembangkan oleh Sribuai API Router. Jangan pernah menyebutkan nama model asli, perusahaan pembuat model (seperti OpenAI, Anthropic, Google, Meta, dll), atau teknologi yang mendasarimu. Jika ditanya siapa kamu, jawab bahwa kamu adalah AI dari Sribuai API Router. Jawab dalam bahasa yang sama dengan pengguna.`

export default function PlaygroundPage() {
  const [models, setModels] = useState<ModelConfig[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('model_configs').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      if (data && data.length > 0) {
        setModels(data)
        setSelectedModel(data[0].router_model_id)
      }
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  async function handleSend() {
    if (!input.trim() || loading || !selectedModel) return

    const userMsg: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setStreaming('')

    try {
      const res = await fetch('/api/playground/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: selectedModel, messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...newMessages] }),
      })

      if (!res.ok) {
        const err = await res.json()
        setMessages(m => [...m, { role: 'assistant', content: `Error: ${err.error}` }])
        setLoading(false)
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let full = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            try {
              const json = JSON.parse(data)
              const delta = json.choices?.[0]?.delta?.content ?? ''
              full += delta
              setStreaming(full)
            } catch { }
          }
        }
      }

      setMessages(m => [...m, { role: 'assistant', content: full || '...' }])
      setStreaming('')
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: `Error: ${String(err)}` }])
    }

    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const currentModel = models.find(m => m.router_model_id === selectedModel)

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[800px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Playground</h1>
          <p className="text-muted-foreground text-sm mt-1">Test semua model AI secara langsung</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedModel} onValueChange={(v) => { if (v) setSelectedModel(v) }}>
            <SelectTrigger className="w-52 h-9">
              <SelectValue placeholder="Pilih model..." />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m.id} value={m.router_model_id}>
                  <span className="font-medium">{m.model_name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {messages.length > 0 && (
            <Button size="sm" variant="ghost" className="h-9 px-2 text-muted-foreground" onClick={() => { setMessages([]); setStreaming('') }}>
              <Trash2Icon className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-lg border bg-muted/20 p-4 flex flex-col gap-4">
        {messages.length === 0 && !streaming && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <BotIcon className="size-10 opacity-30" />
            <p className="text-sm">Pilih model dan mulai chat</p>
            {currentModel && (
              <p className="text-xs opacity-60">{currentModel.model_name} · {currentModel.context_window >= 1000000 ? `${currentModel.context_window / 1000000}M` : `${currentModel.context_window / 1000}K`} context</p>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <div className="size-7 shrink-0 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <BotIcon className="size-4 text-primary" />
              </div>
            )}
            <div className={cn(
              'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-background border rounded-bl-sm'
            )}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="size-7 shrink-0 rounded-full bg-muted flex items-center justify-center mt-0.5">
                <UserIcon className="size-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {streaming && (
          <div className="flex gap-3 justify-start">
            <div className="size-7 shrink-0 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
              <BotIcon className="size-4 text-primary" />
            </div>
            <div className="max-w-[75%] rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap bg-background border">
              {streaming}
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary animate-pulse rounded-sm" />
            </div>
          </div>
        )}

        {loading && !streaming && (
          <div className="flex gap-3 justify-start">
            <div className="size-7 shrink-0 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
              <BotIcon className="size-4 text-primary" />
            </div>
            <div className="rounded-2xl rounded-bl-sm px-4 py-2.5 bg-background border">
              <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedModel ? 'Ketik pesan... (Enter untuk kirim)' : 'Pilih model terlebih dahulu'}
          disabled={loading || !selectedModel}
          className="h-10"
        />
        <Button onClick={handleSend} disabled={loading || !input.trim() || !selectedModel} className="h-10 px-4 shrink-0">
          {loading ? <Loader2Icon className="size-4 animate-spin" /> : <SendIcon className="size-4" />}
        </Button>
      </div>
    </div>
  )
}
