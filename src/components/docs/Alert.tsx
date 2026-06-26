import { cn } from "@/lib/utils"
import { Info, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react"

type AlertType = "info" | "warning" | "success" | "tip"

interface AlertProps {
  type?: AlertType
  title?: string
  children: React.ReactNode
}

const styles: Record<AlertType, { container: string; icon: string; Icon: React.ElementType }> = {
  info: {
    container: "border-blue-500/20 bg-blue-500/5 text-blue-900 dark:text-blue-100",
    icon: "text-blue-500",
    Icon: Info,
  },
  warning: {
    container: "border-yellow-500/20 bg-yellow-500/5 text-yellow-900 dark:text-yellow-100",
    icon: "text-yellow-500",
    Icon: AlertTriangle,
  },
  success: {
    container: "border-green-500/20 bg-green-500/5 text-green-900 dark:text-green-100",
    icon: "text-green-500",
    Icon: CheckCircle,
  },
  tip: {
    container: "border-purple-500/20 bg-purple-500/5 text-purple-900 dark:text-purple-100",
    icon: "text-purple-500",
    Icon: Lightbulb,
  },
}

export function Alert({ type = "info", title, children }: AlertProps) {
  const { container, icon, Icon } = styles[type]

  return (
    <div className={cn("my-4 flex gap-3 rounded-lg border p-4", container)}>
      <Icon className={cn("mt-0.5 size-4 shrink-0", icon)} />
      <div className="text-sm">
        {title && <p className="mb-1 font-semibold">{title}</p>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  )
}
