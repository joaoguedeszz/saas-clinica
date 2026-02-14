import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  agendado: {
    label: "Agendado",
    className:
      "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200",
  },
  confirmado: {
    label: "Confirmado",
    className:
      "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200",
  },
  atendido: {
    label: "Atendido",
    className:
      "bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200",
  },
  cancelado: {
    label: "Cancelado",
    className:
      "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
  },
}

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || {
    label: status,
    className: "",
  }

  return (
    <Badge variant="outline" className={cn("text-xs font-medium", config.className)}>
      {config.label}
    </Badge>
  )
}
