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
import type { IUpdateTarifaPayload, PaymentMethod, Tarifa } from "../types/tarifa.types"
import { updateTarifaService } from "../services/tarifa.service"
import { getVehiclesService } from "@/modules/vehicles/services/vehicle.service"
import type { Vehicle } from "@/modules/vehicles/types/vehicle.types"

interface EditTarifaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tarifa: Tarifa | null
  onSuccess?: () => void
}

export function EditTarifaModal({ open, onOpenChange, tarifa, onSuccess }: EditTarifaModalProps) {
  const [formData, setFormData] = useState<IUpdateTarifaPayload>({})
  const [isLoading, setIsLoading] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  useEffect(() => {
    if (!open) return
    getVehiclesService({ page: 1, limit: 100 })
      .then((res) => setVehicles(res.data.items))
      .catch(() => setVehicles([]))
  }, [open])

  useEffect(() => {
    if (tarifa) {
      setFormData({
        amount: tarifa.amount,
        description: tarifa.description ?? "",
        paymentMethod: tarifa.paymentMethod ?? undefined,
        tarifaDate: tarifa.tarifaDate ?? "",
        vehicleId: tarifa.vehicleId ?? undefined,
      })
    }
  }, [tarifa])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: id === "amount" ? (value === "" ? undefined : Number(value)) : value,
    }))
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!tarifa) return
    setIsLoading(true)
    try {
      await updateTarifaService(tarifa.id, formData)
      onOpenChange(false)
      onSuccess?.()
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  if (!tarifa) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-110">
        <DialogHeader>
          <DialogTitle>Editar Tarifa</DialogTitle>
          <DialogDescription>
            Actualizando tarifa #{String(tarifa.id).padStart(3, "0")}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Monto ($)</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                value={formData.amount ?? ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Vehículo</Label>
              <Select
                value={formData.vehicleId ? String(formData.vehicleId) : ""}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, vehicleId: Number(val) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar vehículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      {v.plate}
                      {v.vehicleModel
                        ? ` — ${v.vehicleModel.brand.name} ${v.vehicleModel.name}`
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tarifaDate">Fecha</Label>
              <Input
                id="tarifaDate"
                type="date"
                value={formData.tarifaDate ?? ""}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label>Método de pago</Label>
              <Select
                value={formData.paymentMethod ?? ""}
                onValueChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentMethod: val as PaymentMethod,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="nequi">Nequi</SelectItem>
                  <SelectItem value="daviplata">Daviplata</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input
                id="description"
                value={formData.description ?? ""}
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