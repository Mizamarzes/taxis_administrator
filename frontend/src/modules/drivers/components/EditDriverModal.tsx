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
import type { Driver, IUpdateDriverPayload } from "../types/driver.types"

interface EditDriverModalProps {
  open: boolean
  driver: Driver | null
  onClose: () => void
  onConfirm: (id: string, payload: IUpdateDriverPayload) => void
}

export const EditDriverModal = ({
  open,
  driver,
  onClose,
  onConfirm,
}: EditDriverModalProps) => {
  const [form, setForm] = useState<IUpdateDriverPayload>({})

  useEffect(() => {
    if (driver) {
      setForm({
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        licenseNumber: driver.licenseNumber,
        vehiclePlate: driver.vehiclePlate,
        vehicleModel: driver.vehicleModel,
        status: driver.status,
      })
    }
  }, [driver])

  const set = (field: keyof IUpdateDriverPayload, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!driver) return
    onConfirm(driver.id, form)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar conductor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre completo</Label>
              <Input
                id="edit-name"
                value={form.name ?? ""}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input
                id="edit-phone"
                value={form.phone ?? ""}
                onChange={(e) => set("phone", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">Correo electrónico</Label>
            <Input
              id="edit-email"
              type="email"
              value={form.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-license">Número de licencia</Label>
              <Input
                id="edit-license"
                value={form.licenseNumber ?? ""}
                onChange={(e) => set("licenseNumber", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={form.status ?? "active"}
                onValueChange={(v) => set("status", v as Driver["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="on_trip">En viaje</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-plate">Placa del vehículo</Label>
              <Input
                id="edit-plate"
                value={form.vehiclePlate ?? ""}
                onChange={(e) => set("vehiclePlate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-model">Modelo del vehículo</Label>
              <Input
                id="edit-model"
                value={form.vehicleModel ?? ""}
                onChange={(e) => set("vehicleModel", e.target.value)}
                required
              />
            </div>
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
