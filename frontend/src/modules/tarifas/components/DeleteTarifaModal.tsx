import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Tarifa } from "../types/tarifa.types"

interface DeleteTarifaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tarifa: Tarifa | null
}

export function DeleteTarifaModal({ open, onOpenChange, tarifa }: DeleteTarifaModalProps) {
  const handleDelete = () => {
    console.log("Eliminar tarifa:", tarifa?.id)
    // TODO: llamada a API
    onOpenChange(false)
  }

  if (!tarifa) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Eliminar Tarifa</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-1">
          <p className="text-sm text-muted-foreground">
            Estás eliminando la tarifa de{" "}
            <span className="font-semibold text-foreground">{tarifa.driverName}</span>{" "}
            — placa{" "}
            <span className="font-mono font-semibold text-foreground">{tarifa.vehiclePlate}</span>{" "}
            con fecha{" "}
            <span className="font-semibold text-foreground">
              {new Date(tarifa.date).toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
