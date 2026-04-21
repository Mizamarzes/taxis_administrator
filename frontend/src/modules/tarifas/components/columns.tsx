import type { ColumnDef } from "@tanstack/react-table"
import type { Tarifa } from "../types/tarifa.types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"

const statusConfig: Record<Tarifa["status"], { label: string; className: string }> = {
  paid: {
    label: "Pagada",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  pending: {
    label: "Pendiente",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  overdue: {
    label: "Vencida",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
}

interface ColumnsProps {
  onEdit: (tarifa: Tarifa) => void
  onDelete: (tarifa: Tarifa) => void
}

export const getColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Tarifa>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        #{String(row.getValue("id")).padStart(3, "0")}
      </span>
    ),
  },
  {
    accessorKey: "driverName",
    header: "Conductor",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("driverName")}</span>
    ),
  },
  {
    accessorKey: "vehiclePlate",
    header: "Placa",
    cell: ({ row }) => (
      <span className="font-mono font-semibold tracking-wider text-sm">
        {row.getValue("vehiclePlate")}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number
      return (
        <span className="font-semibold">
          ${amount.toLocaleString("es-CO")}
        </span>
      )
    },
  },
  {
    accessorKey: "date",
    header: "Fecha",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"))
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as Tarifa["status"]
      const config = statusConfig[status]
      return (
        <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
          {config.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "notes",
    header: "Notas",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground truncate max-w-[140px] block">
        {row.getValue("notes") ?? "—"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const tarifa = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(tarifa)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(tarifa)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
