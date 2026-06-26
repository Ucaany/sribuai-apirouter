"use client"

import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

const navItems = [
  {
    group: "Memulai",
    items: [
      { label: "Quick Start", href: "/docs" },
      { label: "Authentication", href: "/docs/authentication" },
    ],
  },
  {
    group: "API Reference",
    items: [
      { label: "Models", href: "/docs/models" },
      { label: "Chat Completions", href: "/docs/chat-completions" },
      { label: "Streaming", href: "/docs/streaming" },
    ],
  },
  {
    group: "Panduan",
    items: [
      { label: "Rate Limits", href: "/docs/rate-limits" },
      { label: "Error Codes", href: "/docs/errors" },
      { label: "SDK Support", href: "/docs/sdks" },
      { label: "Contoh Kode", href: "/docs/examples" },
    ],
  },
]

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0">
      <nav className="sticky top-20 space-y-6">
        {navItems.map((group) => (
          <div key={group.group}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.group}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={cn(
                      "block rounded-md px-3 py-1.5 text-sm transition-colors",
                      pathname === item.href
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
