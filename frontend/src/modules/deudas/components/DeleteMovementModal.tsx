import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatDateOnly } from "@/lib/utils"
import type { DeudaMovement } from "../types/deuda.types"
import { deleteMovementService } from "../services/deuda.service"
import { formatCurrency, movementTypeConfig } from "./movement-config"

interface DeleteMovementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  movement: DeudaMovement | null
  onSuccess?: () => void
}

export function DeleteMovementModal({
  open,
  onOpenChange,
  movement,
  onSuccess,
}: DeleteMovementModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!movement) return
    setIsLoading(true)
    setError(null)
    try {
      await deleteMovementService(movement.id)
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!movement) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Eliminar movimiento</DialogTitle>
          <DialogDescription>El saldo del conductor se recalculará.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Estás eliminando{" "}
            <span className="font-semibold text-foreground">
              {movementTypeConfig[movement.type].label.toLowerCase()}
            </span>{" "}
            por{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(movement.amount)}
            </span>{" "}
            del{" "}
            <span className="font-semibold text-foreground">
              {formatDateOnly(movement.movementDate, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            .
          </p>
          {error && <p className="text-sm text-destructive pt-3">{error}</p>}
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
