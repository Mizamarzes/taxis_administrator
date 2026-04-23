import { useState } from "react"
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
import type { ICreateVehiclePayload, Vehicle } from "../types/vehicle.types"

interface CreateVehicleModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (payload: ICreateVehiclePayload) => void
}

const defaultForm: ICreateVehiclePayload = {
  plate: "",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  color: "",
  fuelType: "gasoline",
  assignedDriver: "",
}

export const CreateVehicleModal = ({
  open,
  onClose,
  onConfirm,
}: CreateVehicleModalProps) => {
  const [form, setForm] = useState<ICreateVehiclePayload>(defaultForm)

  const set = (field: keyof ICreateVehiclePayload, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(form)
    setForm(defaultForm)
  }

  const handleClose = () => {
    setForm(defaultForm)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar vehículo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plate">Placa</Label>
              <Input
                id="plate"
                placeholder="ABC-123"
                value={form.plate}
                onChange={(e) => set("plate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                placeholder="Blanco"
                value={form.color}
                onChange={(e) => set("color", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                placeholder="Toyota"
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                placeholder="Corolla"
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Año</Label>
              <Input
                id="year"
                type="number"
                min={1990}
                max={new Date().getFullYear() + 1}
                value={form.year}
                onChange={(e) => set("year", Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Combustible</Label>
              <Select
                value={form.fuelType}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver">Conductor asignado (opcional)</Label>
            <Input
              id="driver"
              placeholder="Nombre del conductor"
              value={form.assignedDriver ?? ""}
              onChange={(e) => set("assignedDriver", e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">Agregar vehículo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
