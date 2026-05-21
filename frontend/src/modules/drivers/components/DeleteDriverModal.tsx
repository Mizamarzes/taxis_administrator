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
import type { Driver } from "../types/driver.types"
import { deleteDriverService } from "../services/driver.service"

interface DeleteDriverModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driver: Driver | null
  onSuccess?: () => void
}

export function DeleteDriverModal({ open, onOpenChange, driver, onSuccess }: DeleteDriverModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!driver) return
    setIsLoading(true)
    try {
      await deleteDriverService(driver.id)
      onOpenChange(false)
      onSuccess?.()
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  if (!driver) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Eliminar conductor</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-1">
          <p className="text-sm text-muted-foreground">
            Estás eliminando al conductor{" "}
            <span className="font-semibold text-foreground">{driver.user.name}</span>
            {driver.user.email && (
              <>
                {" "}(
                <span className="font-mono text-foreground">{driver.user.email}</span>)
              </>
            )}
            .
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