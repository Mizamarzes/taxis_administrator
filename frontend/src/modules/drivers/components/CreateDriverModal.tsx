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
import type { ICreateDriverPayload } from "../types/driver.types"

interface CreateDriverModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (payload: ICreateDriverPayload) => void
}

const defaultForm: ICreateDriverPayload = {
  name: "",
  email: "",
  phone: "",
  licenseNumber: "",
  vehiclePlate: "",
  vehicleModel: "",
}

export const CreateDriverModal = ({
  open,
  onClose,
  onConfirm,
}: CreateDriverModalProps) => {
  const [form, setForm] = useState<ICreateDriverPayload>(defaultForm)

  const set = (field: keyof ICreateDriverPayload, value: string) =>
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
          <DialogTitle>Agregar conductor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                placeholder="Carlos Ramírez"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="+57 312 345 6789"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="conductor@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber">Número de licencia</Label>
            <Input
              id="licenseNumber"
              placeholder="LIC-001"
              value={form.licenseNumber}
              onChange={(e) => set("licenseNumber", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehiclePlate">Placa del vehículo</Label>
              <Input
                id="vehiclePlate"
                placeholder="ABC-123"
                value={form.vehiclePlate}
                onChange={(e) => set("vehiclePlate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleModel">Modelo del vehículo</Label>
              <Input
                id="vehicleModel"
                placeholder="Toyota Corolla 2022"
                value={form.vehicleModel}
                onChange={(e) => set("vehicleModel", e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">Agregar conductor</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
