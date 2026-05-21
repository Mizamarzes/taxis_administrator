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
import { createVehicleService } from "../services/vehicle.service"

interface CreateVehicleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const emptyForm: ICreateVehiclePayload = {
  plate: "",
  drivingRestrictionDay: "",
  photoUrl: "",
  vehicleModelId: undefined,
  vehicleStatus: "active",
}

export function CreateVehicleModal({ open, onOpenChange, onSuccess }: CreateVehicleModalProps) {
  const [formData, setFormData] = useState<ICreateVehiclePayload>(emptyForm)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: id === "vehicleModelId" ? (value === "" ? undefined : Number(value)) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await createVehicleService(formData)
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
              {isLoading ? "Creando..." : "Agregar vehículo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}