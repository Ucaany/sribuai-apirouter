"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { CodeBlock } from "./CodeBlock"

interface CodeExample {
  language: string
  label: string
  code: string
}

interface LanguageTabsProps {
  examples: CodeExample[]
}

export function LanguageTabs({ examples }: LanguageTabsProps) {
  const [active, setActive] = useState(examples[0]?.language)

  return (
    <div className="my-4 rounded-lg border overflow-hidden">
      <div className="flex border-b bg-muted/50">
        {examples.map((ex) => (
          <button
            key={ex.language}
            onClick={() => setActive(ex.language)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              active === ex.language
                ? "border-b-2 border-primary text-foreground bg-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {ex.label}
          </button>
        ))}
      </div>
      {examples.map((ex) => (
        <div key={ex.language} className={active === ex.language ? "block" : "hidden"}>
          <CodeBlock code={ex.code} language={ex.language} />
        </div>
      ))}
    </div>
  )
}
