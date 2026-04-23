import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { TriangleAlertIcon } from "lucide-react"
import type { Vehicle } from "../types/vehicle.types"

interface DeleteVehicleModalProps {
  open: boolean
  vehicle: Vehicle | null
  onClose: () => void
  onConfirm: (id: string) => void
}

export const DeleteVehicleModal = ({
  open,
  vehicle,
  onClose,
  onConfirm,
}: DeleteVehicleModalProps) => {
  if (!vehicle) return null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlertIcon className="h-5 w-5 text-destructive" />
            Eliminar vehículo
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <p className="text-sm text-muted-foreground">
            ¿Estás seguro de que deseas eliminar el vehículo{" "}
            <span className="font-semibold text-foreground">
              {vehicle.brand} {vehicle.model}
            </span>{" "}
            con placa{" "}
            <span className="font-semibold text-foreground">{vehicle.plate}</span>?
          </p>
          <p className="text-sm text-destructive">
            Esta acción no se puede deshacer.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm(vehicle.id)
              onClose()
            }}
          >
            Eliminar vehículo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
