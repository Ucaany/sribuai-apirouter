interface Param {
  name: string
  type: string
  required: boolean
  description: string
}

interface ParamTableProps {
  params: Param[]
}

export function ParamTable({ params }: ParamTableProps) {
  return (
    <div className="my-4 overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Parameter</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipe</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Wajib</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Deskripsi</th>
          </tr>
        </thead>
        <tbody>
          {params.map((param, i) => (
            <tr key={param.name} className={i % 2 === 0 ? "" : "bg-muted/20"}>
              <td className="px-4 py-3 font-mono text-xs text-foreground">
                <code className="rounded bg-muted px-1.5 py-0.5">{param.name}</code>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{param.type}</td>
              <td className="px-4 py-3">
                {param.required ? (
                  <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-500">Ya</span>
                ) : (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Tidak</span>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{param.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
