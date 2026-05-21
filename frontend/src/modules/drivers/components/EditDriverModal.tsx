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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { IUpdateDriverPayload, Driver, DriverStatus } from "../types/driver.types"
import { updateDriverService } from "../services/driver.service"

interface EditDriverModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driver: Driver | null
  onSuccess?: () => void
}

export function EditDriverModal({ open, onOpenChange, driver, onSuccess }: EditDriverModalProps) {
  const [formData, setFormData] = useState<IUpdateDriverPayload>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (driver) {
      setFormData({
        status: driver.status,
        phone: driver.phone ?? "",
        hireDate: driver.hireDate ?? "",
        vehicleId: driver.vehicleId ?? undefined,
        photoUrl: driver.photoUrl ?? "",
      })
    }
  }, [driver])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: id === "vehicleId" ? (value === "" ? undefined : Number(value)) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!driver) return
    setIsLoading(true)
    const payload: IUpdateDriverPayload = {}
    if (formData.status) payload.status = formData.status
    if (formData.phone?.trim()) payload.phone = formData.phone.trim()
    if (formData.hireDate?.trim()) payload.hireDate = formData.hireDate.trim()
    if (formData.vehicleId) payload.vehicleId = formData.vehicleId
    if (formData.photoUrl?.trim()) payload.photoUrl = formData.photoUrl.trim()
    try {
      await updateDriverService(driver.id, payload)
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar conductor</DialogTitle>
          <DialogDescription>
            Actualizando a{" "}
            <span className="font-semibold">{driver.user.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Estado</Label>
              <Select
                value={formData.status ?? "active"}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, status: val as DriverStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="suspended">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input
                id="phone"
                placeholder="+573001234567"
                value={formData.phone ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hireDate">Fecha de contratación (opcional)</Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.hireDate ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="vehicleId">ID vehículo asignado (opcional)</Label>
              <Input
                id="vehicleId"
                type="number"
                min={1}
                placeholder="1"
                value={formData.vehicleId ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="photoUrl">URL de foto (opcional)</Label>
              <Input
                id="photoUrl"
                placeholder="https://ejemplo.com/foto.jpg"
                value={formData.photoUrl ?? ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}