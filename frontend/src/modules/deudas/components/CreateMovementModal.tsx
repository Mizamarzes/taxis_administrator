import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { DeudaMovementType } from "../types/deuda.types"
import { createMovementService } from "../services/deuda.service"
import { MovementFormFields, type MovementFormValues } from "./MovementFormFields"
import { movementTypeConfig } from "./movement-config"

interface CreateMovementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driverId: number
  driverName: string
  initialType: DeudaMovementType
  onSuccess?: () => void
}

const buildEmptyForm = (type: DeudaMovementType): MovementFormValues => ({
  type,
  amount: 0,
  movementDate: format(new Date(), "yyyy-MM-dd"),
  paymentMethod: type === "payment" ? "cash" : undefined,
  description: "",
})

export function CreateMovementModal({
  open,
  onOpenChange,
  driverId,
  driverName,
  initialType,
  onSuccess,
}: CreateMovementModalProps) {
  const [formData, setFormData] = useState<MovementFormValues>(buildEmptyForm(initialType))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setFormData(buildEmptyForm(initialType))
      setError(null)
    }
  }, [open, initialType])

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      await createMovementService({
        driverId,
        type: formData.type,
        amount: formData.amount,
        movementDate: formData.movementDate,
        paymentMethod: formData.type === "payment" ? formData.paymentMethod : undefined,
        description: formData.description || undefined,
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const label = movementTypeConfig[formData.type].label.toLowerCase()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-110">
        <DialogHeader>
          <DialogTitle>Registrar {label}</DialogTitle>
          <DialogDescription>
            Movimiento para <span className="font-medium text-foreground">{driverName}</span>.
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
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
