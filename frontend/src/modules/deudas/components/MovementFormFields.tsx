import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PaymentMethod } from "@/modules/tarifas/types/tarifa.types"
import type { DeudaMovementType } from "../types/deuda.types"
import { movementTypeConfig, paymentMethodLabels } from "./movement-config"

export interface MovementFormValues {
  type: DeudaMovementType
  amount: number
  movementDate: string
  paymentMethod?: PaymentMethod
  description: string
}

interface MovementFormFieldsProps {
  values: MovementFormValues
  onChange: (values: MovementFormValues) => void
}

export function MovementFormFields({ values, onChange }: MovementFormFieldsProps) {
  const set = <K extends keyof MovementFormValues>(key: K, value: MovementFormValues[K]) =>
    onChange({ ...values, [key]: value })

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label>Tipo</Label>
        <Select
          value={values.type}
          onValueChange={(val) => {
            const type = val as DeudaMovementType
            onChange({
              ...values,
              type,
              paymentMethod: type === "payment" ? values.paymentMethod : undefined,
            })
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(movementTypeConfig) as DeudaMovementType[]).map((type) => (
              <SelectItem key={type} value={type}>
                {movementTypeConfig[type].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="amount">Monto ($)</Label>
        <Input
          id="amount"
          type="number"
          min={1}
          step="0.01"
          placeholder="50000"
          value={values.amount || ""}
          onChange={(e) => set("amount", e.target.value === "" ? 0 : Number(e.target.value))}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="movementDate">Fecha</Label>
        <Input
          id="movementDate"
          type="date"
          value={values.movementDate}
          onChange={(e) => set("movementDate", e.target.value)}
          required
        />
      </div>

      {values.type === "payment" && (
        <div className="grid gap-2">
          <Label>Método de pago</Label>
          <Select
            value={values.paymentMethod ?? ""}
            onValueChange={(val) => set("paymentMethod", val as PaymentMethod)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar método" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(paymentMethodLabels) as PaymentMethod[]).map((method) => (
                <SelectItem key={method} value={method}>
                  {paymentMethodLabels[method]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Input
          id="description"
          placeholder={
            values.type === "debt" ? "No entregó la tarifa del 15 y el 17" : "Observaciones..."
          }
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>
    </div>
  )
}
