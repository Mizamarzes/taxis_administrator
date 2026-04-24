import type { ColumnDef } from "@tanstack/react-table"
import type { PaymentMethod, Tarifa } from "../types/tarifa.types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"

const paymentMethodConfig: Record<PaymentMethod, { label: string; className: string }> = {
  cash: {
    label: "Efectivo",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  nequi: {
    label: "Nequi",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  daviplata: {
    label: "Daviplata",
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
    accessorKey: "driverId",
    header: "Conductor ID",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.getValue("driverId") ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "vehicleId",
    header: "Vehículo ID",
    cell: ({ row }) => (
      <span className="font-mono font-semibold tracking-wider text-sm">
        {row.getValue("vehicleId") ?? "—"}
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
          ${Number(amount).toLocaleString("es-CO")}
        </span>
      )
    },
  },
  {
    accessorKey: "tarifaDate",
    header: "Fecha",
    cell: ({ row }) => {
      const val = row.getValue("tarifaDate") as string | null
      if (!val) return <span className="text-muted-foreground">—</span>
      const date = new Date(val)
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Método de pago",
    cell: ({ row }) => {
      const method = row.getValue("paymentMethod") as PaymentMethod | null
      if (!method) return <span className="text-muted-foreground text-sm">—</span>
      const config = paymentMethodConfig[method]
      return (
        <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
          {config.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground truncate max-w-35 block">
        {row.getValue("description") ?? "—"}
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
