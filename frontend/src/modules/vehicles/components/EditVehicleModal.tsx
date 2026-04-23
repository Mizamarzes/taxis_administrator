import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { IUpdateVehiclePayload, Vehicle } from "../types/vehicle.types"

interface EditVehicleModalProps {
  open: boolean
  vehicle: Vehicle | null
  onClose: () => void
  onConfirm: (id: string, payload: IUpdateVehiclePayload) => void
}

export const EditVehicleModal = ({
  open,
  vehicle,
  onClose,
  onConfirm,
}: EditVehicleModalProps) => {
  const [form, setForm] = useState<IUpdateVehiclePayload>({})

  useEffect(() => {
    if (vehicle) {
      setForm({
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        status: vehicle.status,
        mileage: vehicle.mileage,
        fuelType: vehicle.fuelType,
        assignedDriver: vehicle.assignedDriver ?? "",
      })
    }
  }, [vehicle])

  const set = (field: keyof IUpdateVehiclePayload, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicle) return
    onConfirm(vehicle.id, form)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar vehículo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-plate">Placa</Label>
              <Input
                id="edit-plate"
                value={form.plate ?? ""}
                onChange={(e) => set("plate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-color">Color</Label>
              <Input
                id="edit-color"
                value={form.color ?? ""}
                onChange={(e) => set("color", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-brand">Marca</Label>
              <Input
                id="edit-brand"
                value={form.brand ?? ""}
                onChange={(e) => set("brand", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-model">Modelo</Label>
              <Input
                id="edit-model"
                value={form.model ?? ""}
                onChange={(e) => set("model", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-year">Año</Label>
              <Input
                id="edit-year"
                type="number"
                min={1990}
                max={new Date().getFullYear() + 1}
                value={form.year ?? ""}
                onChange={(e) => set("year", Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-mileage">Kilometraje</Label>
              <Input
                id="edit-mileage"
                type="number"
                min={0}
                value={form.mileage ?? ""}
                onChange={(e) => set("mileage", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Combustible</Label>
              <Select
                value={form.fuelType ?? "gasoline"}
                onValueChange={(v) => set("fuelType", v as Vehicle["fuelType"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasoline">Gasolina</SelectItem>
                  <SelectItem value="diesel">Diésel</SelectItem>
                  <SelectItem value="electric">Eléctrico</SelectItem>
                  <SelectItem value="hybrid">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={form.status ?? "available"}
                onValueChange={(v) => set("status", v as Vehicle["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="on_trip">En viaje</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-driver">Conductor asignado (opcional)</Label>
            <Input
              id="edit-driver"
              placeholder="Nombre del conductor"
              value={form.assignedDriver ?? ""}
              onChange={(e) => set("assignedDriver", e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Guardar cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
