"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  className?: string
}

export function CodeBlock({ code, language, filename, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("group relative rounded-lg border border-zinc-700/50 bg-transparent text-sm", className)}>
      {filename && (
        <div className="flex items-center border-b border-zinc-700/50 px-4 py-2">
          <span className="text-xs text-zinc-400">{filename}</span>
        </div>
      )}
      <div className="relative">
        <pre className="overflow-x-auto p-4">
          <code className={language ? `language-${language}` : ""}>{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute right-3 top-3 rounded-md border border-zinc-700/50 bg-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-zinc-700/30"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="size-3.5 text-green-400" />
          ) : (
            <Copy className="size-3.5 text-zinc-400" />
          )}
        </button>
      </div>
    </div>
  )
}
