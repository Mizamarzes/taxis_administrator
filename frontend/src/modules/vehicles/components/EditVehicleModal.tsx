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
import type { IUpdateVehiclePayload, Vehicle, VehicleStatus } from "../types/vehicle.types"
import { updateVehicleService } from "../services/vehicle.service"

interface EditVehicleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Vehicle | null
  onSuccess?: () => void
}

export function EditVehicleModal({ open, onOpenChange, vehicle, onSuccess }: EditVehicleModalProps) {
  const [formData, setFormData] = useState<IUpdateVehiclePayload>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (vehicle) {
      setFormData({
        plate: vehicle.plate,
        drivingRestrictionDay: vehicle.drivingRestrictionDay ?? "",
        photoUrl: vehicle.photoUrl ?? "",
        vehicleModelId: vehicle.vehicleModelId ?? undefined,
        vehicleStatus: vehicle.vehicleStatus,
      })
    }
  }, [vehicle])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: id === "vehicleModelId" ? (value === "" ? undefined : Number(value)) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicle) return
    setIsLoading(true)
    const payload: IUpdateVehiclePayload = {}
    if (formData.plate?.trim()) payload.plate = formData.plate.trim()
    if (formData.vehicleModelId) payload.vehicleModelId = formData.vehicleModelId
    if (formData.vehicleStatus) payload.vehicleStatus = formData.vehicleStatus
    if (formData.drivingRestrictionDay?.trim()) payload.drivingRestrictionDay = formData.drivingRestrictionDay.trim()
    if (formData.photoUrl?.trim()) payload.photoUrl = formData.photoUrl.trim()
    try {
      await updateVehicleService(vehicle.id, payload)
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar vehículo</DialogTitle>
          <DialogDescription>
            Actualizando vehículo con placa{" "}
            <span className="font-mono font-semibold">{vehicle.plate}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="plate">Placa</Label>
              <Input
                id="plate"
                value={formData.plate ?? ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="vehicleModelId">ID Modelo de vehículo</Label>
              <Input
                id="vehicleModelId"
                type="number"
                min={1}
                placeholder="1"
                value={formData.vehicleModelId ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <Label>Estado</Label>
              <Select
                value={formData.vehicleStatus ?? "active"}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, vehicleStatus: val as VehicleStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="in_maintenance">En mantenimiento</SelectItem>
                  <SelectItem value="out_of_service">Fuera de servicio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="drivingRestrictionDay">Día de restricción (opcional)</Label>
              <Input
                id="drivingRestrictionDay"
                placeholder="Lunes"
                value={formData.drivingRestrictionDay ?? ""}
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