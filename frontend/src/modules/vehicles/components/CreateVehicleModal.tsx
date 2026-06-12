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
import type { ICreateVehiclePayload, VehicleStatus } from "../types/vehicle.types"
import { RESTRICTION_DAYS } from "../types/vehicle.types"
import { createVehicleService } from "../services/vehicle.service"
import { getDriversService } from "@/modules/drivers/services/driver.service"
import type { Driver } from "@/modules/drivers/types/driver.types"

interface CreateVehicleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const emptyForm: ICreateVehiclePayload = {
  plate: "",
  vehicleStatus: "active",
}

const NONE = "none"

export function CreateVehicleModal({ open, onOpenChange, onSuccess }: CreateVehicleModalProps) {
  const [formData, setFormData] = useState<ICreateVehiclePayload>(emptyForm)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(false)

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
    setIsLoading(true)
    const payload: ICreateVehiclePayload = { plate: formData.plate.trim() }
    if (formData.vehicleStatus) payload.vehicleStatus = formData.vehicleStatus
    if (formData.drivingRestrictionDay) payload.drivingRestrictionDay = formData.drivingRestrictionDay
    if (formData.photoUrl?.trim()) payload.photoUrl = formData.photoUrl.trim()
    if (formData.driverId) payload.driverId = formData.driverId
    try {
      await createVehicleService(payload)
      onOpenChange(false)
      setFormData(emptyForm)
      onSuccess?.()
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar vehículo</DialogTitle>
          <DialogDescription>
            Registra un nuevo vehículo en la flota.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="plate">Placa</Label>
              <Input
                id="plate"
                placeholder="ABC123"
                value={formData.plate}
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
              {isLoading ? "Creando..." : "Agregar vehículo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}