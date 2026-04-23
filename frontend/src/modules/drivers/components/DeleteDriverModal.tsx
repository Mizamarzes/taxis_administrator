import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { TriangleAlertIcon } from "lucide-react"
import type { Driver } from "../types/driver.types"

interface DeleteDriverModalProps {
  open: boolean
  driver: Driver | null
  onClose: () => void
  onConfirm: (id: string) => void
}

export const DeleteDriverModal = ({
  open,
  driver,
  onClose,
  onConfirm,
}: DeleteDriverModalProps) => {
  if (!driver) return null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlertIcon className="h-5 w-5 text-destructive" />
            Eliminar conductor
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <p className="text-sm text-muted-foreground">
            ¿Estás seguro de que deseas eliminar al conductor{" "}
            <span className="font-semibold text-foreground">{driver.name}</span>{" "}
            con licencia{" "}
            <span className="font-semibold text-foreground">{driver.licenseNumber}</span>?
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
              onConfirm(driver.id)
              onClose()
            }}
          >
            Eliminar conductor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
