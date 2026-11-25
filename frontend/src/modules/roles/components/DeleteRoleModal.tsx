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
import type { Role } from "../types/role.types"
import { deleteRoleService } from "../services/role.service"

interface DeleteRoleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  onSuccess?: () => void
}

export function DeleteRoleModal({ open, onOpenChange, role, onSuccess }: DeleteRoleModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) setError(null)
  }, [open])

  const handleDelete = async () => {
    if (!role) return
    setIsLoading(true)
    setError(null)
    try {
      await deleteRoleService(role.id)
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!role) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Eliminar rol</DialogTitle>
          <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground">
            Estás eliminando el rol{" "}
            <span className="font-semibold text-foreground">{role.name}</span>. Solo se puede
            eliminar si no tiene usuarios asignados.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
