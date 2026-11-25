import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { RoleDetail } from "../types/role.types"
import { createRoleService, updateRoleService } from "../services/role.service"

interface RoleFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: RoleDetail | null
  onSuccess?: (role: RoleDetail) => void
}

export function RoleFormModal({ open, onOpenChange, role, onSuccess }: RoleFormModalProps) {
  const isEdit = Boolean(role)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setName(role?.name ?? "")
      setDescription(role?.description ?? "")
      setError(null)
    }
  }, [open, role])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const payload = {
        ...(role?.isSystem ? {} : { name: name.trim().toUpperCase() }),
        description: description.trim(),
      }
      const response = role
        ? await updateRoleService(role.id, payload)
        : await createRoleService(payload)
      onOpenChange(false)
      onSuccess?.(response.data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar rol" : "Nuevo rol"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Cambia el nombre o la descripción. Los permisos se editan en la matriz."
              : "Crea el rol y después asígnale permisos en la matriz."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="role-name">Nombre</Label>
              <Input
                id="role-name"
                placeholder="CONTADOR"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                disabled={role?.isSystem}
                pattern="[A-Za-z][A-Za-z0-9_]{1,49}"
                title="2 a 50 caracteres: letras, números o guion bajo"
                required
              />
              {role?.isSystem && (
                <p className="text-xs text-muted-foreground">
                  Los roles del sistema no se pueden renombrar.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role-description">Descripción</Label>
              <Input
                id="role-description"
                placeholder="Revisa tarifas y gastos"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={255}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear rol"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
