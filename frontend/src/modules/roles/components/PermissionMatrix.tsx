import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { PermissionGroup } from "../types/role.types"

const VERB_LABELS: Record<string, string> = {
  create: "Crear",
  read: "Ver",
  update: "Editar",
  delete: "Eliminar",
  train: "Entrenar",
}

interface PermissionMatrixProps {
  catalog: PermissionGroup[]
  selected: Set<string>
  disabled?: boolean
  onToggle: (action: string, checked: boolean) => void
  onToggleGroup: (group: PermissionGroup, checked: boolean) => void
}

export function PermissionMatrix({
  catalog,
  selected,
  disabled,
  onToggle,
  onToggleGroup,
}: PermissionMatrixProps) {
  return (
    <div className="divide-y rounded-lg border">
      {catalog.map((group) => {
        const granted = group.permissions.filter((p) => selected.has(p.action)).length
        const allGranted = granted === group.permissions.length
        return (
          <div
            key={group.resource}
            className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-6"
          >
            <div className="flex items-center justify-between gap-3 md:w-48 md:shrink-0">
              <div>
                <p className="font-medium">{group.label}</p>
                <p className="text-xs text-muted-foreground">
                  {granted} de {group.permissions.length}
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                Todos
                <Switch
                  size="sm"
                  checked={allGranted}
                  disabled={disabled}
                  onCheckedChange={(checked) => onToggleGroup(group, checked)}
                  aria-label={`Todos los permisos de ${group.label}`}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {group.permissions.map((permission) => {
                const checked = selected.has(permission.action)
                return (
                  <label
                    key={permission.action}
                    title={permission.description}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                      checked ? "border-primary/40 bg-primary/5" : "bg-background",
                      disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                    )}
                  >
                    <Switch
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={(value) => onToggle(permission.action, value)}
                      aria-label={permission.description}
                    />
                    {VERB_LABELS[permission.verb] ?? permission.verb}
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
