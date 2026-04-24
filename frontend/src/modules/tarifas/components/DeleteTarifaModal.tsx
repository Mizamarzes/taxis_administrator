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
import type { Tarifa } from "../types/tarifa.types"
import { deleteTarifaService } from "../services/tarifa.service"

interface DeleteTarifaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tarifa: Tarifa | null
  onSuccess?: () => void
}

export function DeleteTarifaModal({ open, onOpenChange, tarifa, onSuccess }: DeleteTarifaModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!tarifa) return
    setIsLoading(true)
    try {
      await deleteTarifaService(tarifa.id)
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // error handled silently; could add toast here
    } finally {
      setIsLoading(false)
    }
  }

  if (!tarifa) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" >
        <DialogHeader>
          <DialogTitle>Eliminar Tarifa</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-1">
          <p className="text-sm text-muted-foreground">
            Estás eliminando la tarifa{" "}
            <span className="font-mono font-semibold text-foreground">
              #{String(tarifa.id).padStart(3, "0")}
            </span>{" "}
            con monto{" "}
            <span className="font-semibold text-foreground">
              ${Number(tarifa.amount).toLocaleString("es-CO")}
            </span>
            {tarifa.tarifaDate && (
              <>
                {" "}con fecha{" "}
                <span className="font-semibold text-foreground">
                  {new Date(tarifa.tarifaDate).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </>
            )}.
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
