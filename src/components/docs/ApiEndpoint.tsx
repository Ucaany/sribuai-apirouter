import { cn } from "@/lib/utils"

interface ApiEndpointProps {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
}

const methodColors: Record<string, string> = {
  GET: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  POST: "bg-green-500/10 text-green-500 border-green-500/20",
  PUT: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
  PATCH: "bg-purple-500/10 text-purple-500 border-purple-500/20",
}

export function ApiEndpoint({ method, path }: ApiEndpointProps) {
  return (
    <div className="my-4 flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3 font-mono text-sm">
      <span
        className={cn(
          "rounded border px-2 py-0.5 text-xs font-bold uppercase",
          methodColors[method]
        )}
      >
        {method}
      </span>
      <span className="text-foreground">{path}</span>
    </div>
  )
}
