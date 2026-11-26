import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { DeudaMovement } from "../types/deuda.types"
import { updateMovementService } from "../services/deuda.service"
import { MovementFormFields, type MovementFormValues } from "./MovementFormFields"

interface EditMovementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  movement: DeudaMovement | null
  onSuccess?: () => void
}

export function EditMovementModal({
  open,
  onOpenChange,
  movement,
  onSuccess,
}: EditMovementModalProps) {
  const [formData, setFormData] = useState<MovementFormValues | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (movement) {
      setFormData({
        type: movement.type,
        amount: movement.amount,
        movementDate: movement.movementDate,
        paymentMethod: movement.paymentMethod ?? undefined,
        description: movement.description ?? "",
      })
      setError(null)
    }
  }, [movement])

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!movement || !formData) return
    setIsLoading(true)
    setError(null)
    try {
      await updateMovementService(movement.id, {
        type: formData.type,
        amount: formData.amount,
        movementDate: formData.movementDate,
        paymentMethod: formData.type === "payment" ? formData.paymentMethod : undefined,
        description: formData.description,
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!movement || !formData) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-110">
        <DialogHeader>
          <DialogTitle>Editar movimiento</DialogTitle>
          <DialogDescription>
            Movimiento{" "}
            <span className="font-mono font-semibold text-foreground">
              #{String(movement.id).padStart(3, "0")}
            </span>
            . El saldo se recalcula automáticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <MovementFormFields values={formData} onChange={setFormData} />

          {error && <p className="text-sm text-destructive pb-4">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || formData.amount <= 0}>
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
