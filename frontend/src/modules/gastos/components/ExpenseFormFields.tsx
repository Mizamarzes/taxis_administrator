import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusIcon, Trash2 } from "lucide-react"
import type { PaymentMethod } from "@/modules/tarifas/types/tarifa.types"
import type {
  ExpenseCategory,
  ExpenseItemType,
  IVehicleExpenseItemPayload,
  VehicleExpense,
} from "../types/gasto.types"
import {
  expenseCategoryConfig,
  formatCurrency,
  itemTypeLabels,
  paymentMethodLabels,
} from "./expense-config"

export interface ExpenseItemFormValues {
  itemType: ExpenseItemType
  description: string
  brand: string
  quantity: number
  unit: string
  unitPrice: number
}

export interface ExpenseFormValues {
  category: ExpenseCategory
  expenseDate: string
  odometerKm: string
  nextServiceKm: string
  nextServiceDate: string
  supplier: string
  invoiceNumber: string
  paymentMethod?: PaymentMethod
  description: string
  items: ExpenseItemFormValues[]
}

const NO_PAYMENT_METHOD = "none"

export const emptyItem = (itemType: ExpenseItemType = "part"): ExpenseItemFormValues => ({
  itemType,
  description: "",
  brand: "",
  quantity: 1,
  unit: "und",
  unitPrice: 0,
})

export const oilChangeItems = (): ExpenseItemFormValues[] => [
  { ...emptyItem("fluid"), description: "Aceite de motor", unit: "L", quantity: 4 },
  { ...emptyItem("part"), description: "Filtro de aceite" },
  { ...emptyItem("labor"), description: "Mano de obra", unit: "" },
]

export const expenseToFormValues = (expense: VehicleExpense): ExpenseFormValues => ({
  category: expense.category,
  expenseDate: expense.expenseDate,
  odometerKm: expense.odometerKm?.toString() ?? "",
  nextServiceKm: expense.nextServiceKm?.toString() ?? "",
  nextServiceDate: expense.nextServiceDate ?? "",
  supplier: expense.supplier ?? "",
  invoiceNumber: expense.invoiceNumber ?? "",
  paymentMethod: expense.paymentMethod ?? undefined,
  description: expense.description ?? "",
  items: expense.items.map((item) => ({
    itemType: item.itemType,
    description: item.description,
    brand: item.brand ?? "",
    quantity: item.quantity,
    unit: item.unit ?? "",
    unitPrice: item.unitPrice,
  })),
})

export const toItemsPayload = (items: ExpenseItemFormValues[]): IVehicleExpenseItemPayload[] =>
  items.map((item) => ({
    itemType: item.itemType,
    description: item.description.trim(),
    brand: item.brand.trim() || undefined,
    quantity: item.quantity,
    unit: item.unit.trim() || undefined,
    unitPrice: item.unitPrice,
  }))

export const toOptionalNumber = (value: string) => (value === "" ? undefined : Number(value))

export const calcTotal = (items: ExpenseItemFormValues[]) =>
  items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

export const getFormError = (values: ExpenseFormValues): string | null => {
  if (values.items.length === 0) return "Agrega al menos un ítem"
  if (values.items.some((item) => !item.description.trim())) {
    return "Todos los ítems necesitan descripción"
  }
  if (values.items.some((item) => item.quantity <= 0 || item.unitPrice < 0)) {
    return "Revisa cantidades y precios de los ítems"
  }
  const odometer = toOptionalNumber(values.odometerKm)
  const next = toOptionalNumber(values.nextServiceKm)
  if (odometer != null && next != null && next <= odometer) {
    return "El km del próximo servicio debe ser mayor al km actual"
  }
  return null
}

interface ExpenseFormFieldsProps {
  values: ExpenseFormValues
  onChange: (values: ExpenseFormValues) => void
}

export function ExpenseFormFields({ values, onChange }: ExpenseFormFieldsProps) {
  const set = <K extends keyof ExpenseFormValues>(key: K, value: ExpenseFormValues[K]) =>
    onChange({ ...values, [key]: value })

  const setItem = <K extends keyof ExpenseItemFormValues>(
    index: number,
    key: K,
    value: ExpenseItemFormValues[K]
  ) =>
    set(
      "items",
      values.items.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    )

  const removeItem = (index: number) =>
    set(
      "items",
      values.items.filter((_, i) => i !== index)
    )

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Categoría</Label>
          <Select
            value={values.category}
            onValueChange={(val) => set("category", val as ExpenseCategory)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(expenseCategoryConfig) as ExpenseCategory[]).map((category) => (
                <SelectItem key={category} value={category}>
                  {expenseCategoryConfig[category].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="expenseDate">Fecha</Label>
          <Input
            id="expenseDate"
            type="date"
            value={values.expenseDate}
            onChange={(e) => set("expenseDate", e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="odometerKm">Kilometraje actual (opcional)</Label>
          <Input
            id="odometerKm"
            type="number"
            min={0}
            placeholder="85300"
            value={values.odometerKm}
            onChange={(e) => set("odometerKm", e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="supplier">Taller / proveedor (opcional)</Label>
          <Input
            id="supplier"
            placeholder="Lubricentro El Pistón"
            value={values.supplier}
            onChange={(e) => set("supplier", e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="nextServiceKm">Próximo servicio km (opcional)</Label>
          <Input
            id="nextServiceKm"
            type="number"
            min={1}
            placeholder={
              values.odometerKm ? String(Number(values.odometerKm) + 5000) : "90300"
            }
            value={values.nextServiceKm}
            onChange={(e) => set("nextServiceKm", e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="nextServiceDate">Próximo servicio fecha (opcional)</Label>
          <Input
            id="nextServiceDate"
            type="date"
            value={values.nextServiceDate}
            onChange={(e) => set("nextServiceDate", e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="invoiceNumber">N° factura (opcional)</Label>
          <Input
            id="invoiceNumber"
            placeholder="FV-1234"
            value={values.invoiceNumber}
            onChange={(e) => set("invoiceNumber", e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label>Método de pago (opcional)</Label>
          <Select
            value={values.paymentMethod ?? NO_PAYMENT_METHOD}
            onValueChange={(val) =>
              set("paymentMethod", val === NO_PAYMENT_METHOD ? undefined : (val as PaymentMethod))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_PAYMENT_METHOD}>Sin especificar</SelectItem>
              {(Object.keys(paymentMethodLabels) as PaymentMethod[]).map((method) => (
                <SelectItem key={method} value={method}>
                  {paymentMethodLabels[method]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Input
          id="description"
          placeholder="Observaciones..."
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <Label>Ítems</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => set("items", [...values.items, emptyItem()])}
          >
            <PlusIcon className="size-3.5 mr-1.5" />
            Agregar ítem
          </Button>
        </div>

        {values.items.map((item, index) => (
          <div key={index} className="rounded-lg border p-3 grid grid-cols-6 gap-2">
            <div className="col-span-6 sm:col-span-2">
              <Select
                value={item.itemType}
                onValueChange={(val) => setItem(index, "itemType", val as ExpenseItemType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(itemTypeLabels) as ExpenseItemType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {itemTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              className="col-span-6 sm:col-span-3"
              placeholder="Descripción"
              value={item.description}
              onChange={(e) => setItem(index, "description", e.target.value)}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="col-span-6 sm:col-span-1 justify-self-end text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => removeItem(index)}
              disabled={values.items.length === 1}
              aria-label="Quitar ítem"
            >
              <Trash2 className="size-4" />
            </Button>

            <Input
              className="col-span-3 sm:col-span-2"
              placeholder="Marca"
              value={item.brand}
              onChange={(e) => setItem(index, "brand", e.target.value)}
            />
            <Input
              className="col-span-2 sm:col-span-1"
              type="number"
              min={0.01}
              step="0.01"
              placeholder="Cant."
              aria-label="Cantidad"
              value={item.quantity || ""}
              onChange={(e) =>
                setItem(index, "quantity", e.target.value === "" ? 0 : Number(e.target.value))
              }
              required
            />
            <Input
              className="col-span-1"
              placeholder="Und."
              aria-label="Unidad"
              value={item.unit}
              onChange={(e) => setItem(index, "unit", e.target.value)}
            />
            <Input
              className="col-span-4 sm:col-span-1"
              type="number"
              min={0}
              step="0.01"
              placeholder="Precio unit."
              aria-label="Precio unitario"
              value={item.unitPrice || ""}
              onChange={(e) =>
                setItem(index, "unitPrice", e.target.value === "" ? 0 : Number(e.target.value))
              }
            />
            <p className="col-span-2 sm:col-span-1 self-center text-right text-sm font-semibold tabular-nums">
              {formatCurrency(item.quantity * item.unitPrice)}
            </p>
          </div>
        ))}

        <div className="flex justify-between border-t pt-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-lg font-bold tabular-nums">
            {formatCurrency(calcTotal(values.items))}
          </span>
        </div>
      </div>
    </div>
  )
}
