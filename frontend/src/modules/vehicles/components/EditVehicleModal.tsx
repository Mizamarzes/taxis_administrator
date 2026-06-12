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
import { RESTRICTION_DAYS } from "../types/vehicle.types"
import { updateVehicleService } from "../services/vehicle.service"
import { getDriversService } from "@/modules/drivers/services/driver.service"
import type { Driver } from "@/modules/drivers/types/driver.types"

interface EditVehicleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Vehicle | null
  onSuccess?: () => void
}

const NONE = "none"

export function EditVehicleModal({ open, onOpenChange, vehicle, onSuccess }: EditVehicleModalProps) {
  const [formData, setFormData] = useState<IUpdateVehiclePayload>({})
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (vehicle) {
      setFormData({
        plate: vehicle.plate,
        drivingRestrictionDay: vehicle.drivingRestrictionDay ?? undefined,
        photoUrl: vehicle.photoUrl ?? "",
        vehicleStatus: vehicle.vehicleStatus,
        driverId: vehicle.driverId ?? undefined,
      })
    }
  }, [vehicle])

  useEffect(() => {
    if (!open) return
    getDriversService({ page: 1, limit: 100 })
      .then((res) => setDrivers(res.data.items))
      .catch(() => setDrivers([]))
  }, [open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicle) return
    setIsLoading(true)
    const payload: IUpdateVehiclePayload = {}
    if (formData.plate?.trim()) payload.plate = formData.plate.trim()
    if (formData.vehicleStatus) payload.vehicleStatus = formData.vehicleStatus
    if (formData.drivingRestrictionDay) payload.drivingRestrictionDay = formData.drivingRestrictionDay
    if (formData.photoUrl?.trim()) payload.photoUrl = formData.photoUrl.trim()
    if (formData.driverId) payload.driverId = formData.driverId
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
              <Label>Día de pico y placa (opcional)</Label>
              <Select
                value={formData.drivingRestrictionDay?.toString() ?? NONE}
                onValueChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    drivingRestrictionDay: val === NONE ? undefined : Number(val),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar día" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Sin restricción</SelectItem>
                  {RESTRICTION_DAYS.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Conductor asignado (opcional)</Label>
              <Select
                value={formData.driverId?.toString() ?? NONE}
                onValueChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    driverId: val === NONE ? undefined : Number(val),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar conductor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Sin asignar</SelectItem>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id.toString()}>
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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