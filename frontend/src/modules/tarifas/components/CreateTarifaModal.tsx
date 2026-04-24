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
import type { ICreateTarifaPayload, PaymentMethod } from "../types/tarifa.types"
import { createTarifaService } from "../services/tarifa.service"

interface CreateTarifaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const emptyForm: ICreateTarifaPayload = {
  amount: 0,
  description: "",
  paymentMethod: undefined,
  tarifaDate: "",
  driverId: undefined,
  vehicleId: undefined,
}

export function CreateTarifaModal({ open, onOpenChange, onSuccess }: CreateTarifaModalProps) {
  const [formData, setFormData] = useState<ICreateTarifaPayload>(emptyForm)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]:
        id === "amount" || id === "driverId" || id === "vehicleId"
          ? value === "" ? undefined : Number(value)
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await createTarifaService(formData)
      onOpenChange(false)
      setFormData(emptyForm)
      onSuccess?.()
    } catch {
      // error handled silently; could add toast here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-110">
        <DialogHeader>
          <DialogTitle>Nueva Tarifa</DialogTitle>
          <DialogDescription>
            Registra la remesa diaria del conductor.
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
                placeholder="50000"
                value={formData.amount || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="driverId">ID Conductor</Label>
              <Input
                id="driverId"
                type="number"
                min={1}
                placeholder="1"
                value={formData.driverId ?? ""}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vehicleId">ID Vehículo</Label>
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
                placeholder="Observaciones..."
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
              {isLoading ? "Creando..." : "Crear tarifa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
