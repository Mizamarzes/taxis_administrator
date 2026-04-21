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
import type { ICreateTarifaPayload } from "../types/tarifa.types"

interface CreateTarifaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const emptyForm: ICreateTarifaPayload = {
  driverName: "",
  vehiclePlate: "",
  amount: 0,
  date: "",
  notes: "",
}

export function CreateTarifaModal({ open, onOpenChange }: CreateTarifaModalProps) {
  const [formData, setFormData] = useState<ICreateTarifaPayload>(emptyForm)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: id === "amount" ? Number(value) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Crear tarifa:", formData)
    // TODO: llamada a API
    onOpenChange(false)
    setFormData(emptyForm)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Nueva Tarifa</DialogTitle>
          <DialogDescription>
            Registra la remesa diaria del conductor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="driverName">Conductor</Label>
              <Input
                id="driverName"
                placeholder="Nombre del conductor"
                value={formData.driverName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vehiclePlate">Placa</Label>
              <Input
                id="vehiclePlate"
                placeholder="ABC-123"
                value={formData.vehiclePlate}
                onChange={handleChange}
                required
              />
            </div>
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
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input
                id="notes"
                placeholder="Observaciones..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Crear tarifa</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
