import type { ColumnDef } from "@tanstack/react-table"
import type { User } from "../types/user.types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"

const roleConfig: Record<string, { label: string; className: string }> = {
  SUPERADMIN: {
    label: "Superadmin",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  ADMIN: {
    label: "Admin",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  USER: {
    label: "Usuario",
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
}

interface ColumnsProps {
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export const getColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<User>[] => [
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
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Correo",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.getValue("email")}</span>
    ),
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => {
      const roles = row.getValue("roles") as User["roles"]
      if (!roles?.length) return <span className="text-muted-foreground text-sm">—</span>
      return (
        <div className="flex flex-wrap gap-1">
          {roles.map((role) => {
            const config = roleConfig[role.name] ?? {
              label: role.name,
              className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
            }
            return (
              <Badge key={role.id} variant="outline" className={`text-xs font-medium ${config.className}`}>
                {config.label}
              </Badge>
            )
          })}
        </div>
      )
    },
  },
  {
    accessorKey: "isActive",
    header: "Estado",
    cell: ({ row }) => {
      const active = row.getValue("isActive") as boolean
      return (
        <Badge
          variant="outline"
          className={
            active
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }
        >
          {active ? "Activo" : "Inactivo"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "lastLogin",
    header: "Último acceso",
    cell: ({ row }) => {
      const val = row.getValue("lastLogin") as string | null
      if (!val) return <span className="text-muted-foreground text-sm">—</span>
      return (
        <span className="text-sm">
          {new Date(val).toLocaleDateString("es-CO", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Creado",
    cell: ({ row }) => {
      const val = row.getValue("createdAt") as string
      return (
        <span className="text-sm text-muted-foreground">
          {new Date(val).toLocaleDateString("es-CO", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      )
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const user = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(user)}
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