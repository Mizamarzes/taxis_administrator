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
import type { Vehicle } from "../types/vehicle.types"
import { deleteVehicleService } from "../services/vehicle.service"

interface DeleteVehicleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Vehicle | null
  onSuccess?: () => void
}

export function DeleteVehicleModal({ open, onOpenChange, vehicle, onSuccess }: DeleteVehicleModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!vehicle) return
    setIsLoading(true)
    try {
      await deleteVehicleService(vehicle.id)
      onOpenChange(false)
      onSuccess?.()
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  if (!vehicle) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Eliminar vehículo</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-1">
          <p className="text-sm text-muted-foreground">
            Estás eliminando el vehículo con placa{" "}
            <span className="font-mono font-semibold text-foreground">
              {vehicle.plate}
            </span>.
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