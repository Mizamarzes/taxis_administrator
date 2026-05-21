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
import type { ICreateDriverPayload, DriverStatus } from "../types/driver.types"
import { createDriverService } from "../services/driver.service"

interface CreateDriverModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const emptyForm: ICreateDriverPayload = {
  userId: 0,
  phone: "",
  hireDate: "",
  vehicleId: undefined,
  photoUrl: "",
  status: "active",
}

export function CreateDriverModal({ open, onOpenChange, onSuccess }: CreateDriverModalProps) {
  const [formData, setFormData] = useState<ICreateDriverPayload>(emptyForm)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]:
        id === "userId" || id === "vehicleId"
          ? value === "" ? (id === "userId" ? 0 : undefined) : Number(value)
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const payload: ICreateDriverPayload = { userId: formData.userId }
    if (formData.status) payload.status = formData.status
    if (formData.phone?.trim()) payload.phone = formData.phone.trim()
    if (formData.hireDate?.trim()) payload.hireDate = formData.hireDate.trim()
    if (formData.vehicleId) payload.vehicleId = formData.vehicleId
    if (formData.photoUrl?.trim()) payload.photoUrl = formData.photoUrl.trim()
    try {
      await createDriverService(payload)
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
          <DialogTitle>Agregar conductor</DialogTitle>
          <DialogDescription>
            Registra un nuevo conductor vinculado a un usuario existente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userId">ID de usuario</Label>
              <Input
                id="userId"
                type="number"
                min={1}
                placeholder="1"
                value={formData.userId || ""}
                onChange={handleChange}
                required
              />
            </div>

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
              {isLoading ? "Creando..." : "Agregar conductor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}