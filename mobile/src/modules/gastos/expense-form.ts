import { isValidDateOnly, toDateOnly, toOptionalNumber } from "@/lib/format"
import type { PaymentMethod } from "@/modules/tarifas/types/tarifa.types"
import type {
  ExpenseCategory,
  ExpenseItemType,
  IVehicleExpenseItemPayload,
  VehicleExpense,
} from "./types/gasto.types"

export interface ExpenseItemForm {
  key: string
  itemType: ExpenseItemType
  description: string
  brand: string
  quantity: string
  unit: string
  unitPrice: string
}

export interface ExpenseForm {
  category: ExpenseCategory
  expenseDate: string
  odometerKm: string
  nextServiceKm: string
  nextServiceDate: string
  supplier: string
  invoiceNumber: string
  paymentMethod: PaymentMethod | undefined
  description: string
  items: ExpenseItemForm[]
}

let itemKeyCounter = 0

export function createItem(itemType: ExpenseItemType = "part", overrides: Partial<ExpenseItemForm> = {}): ExpenseItemForm {
  itemKeyCounter += 1
  return {
    key: `item-${itemKeyCounter}`,
    itemType,
    description: "",
    brand: "",
    quantity: "1",
    unit: "und",
    unitPrice: "",
    ...overrides,
  }
}

const oilChangeItems = (): ExpenseItemForm[] => [
  createItem("fluid", { description: "Aceite de motor", unit: "L", quantity: "4" }),
  createItem("part", { description: "Filtro de aceite" }),
  createItem("labor", { description: "Mano de obra", unit: "" }),
]

export function buildEmptyForm(category: ExpenseCategory): ExpenseForm {
  return {
    category,
    expenseDate: toDateOnly(new Date()),
    odometerKm: "",
    nextServiceKm: "",
    nextServiceDate: "",
    supplier: "",
    invoiceNumber: "",
    paymentMethod: "cash",
    description: "",
    items: category === "oil_change" ? oilChangeItems() : [createItem()],
  }
}

export function expenseToForm(expense: VehicleExpense): ExpenseForm {
  return {
    category: expense.category,
    expenseDate: expense.expenseDate.slice(0, 10),
    odometerKm: expense.odometerKm?.toString() ?? "",
    nextServiceKm: expense.nextServiceKm?.toString() ?? "",
    nextServiceDate: expense.nextServiceDate?.slice(0, 10) ?? "",
    supplier: expense.supplier ?? "",
    invoiceNumber: expense.invoiceNumber ?? "",
    paymentMethod: expense.paymentMethod ?? undefined,
    description: expense.description ?? "",
    items: expense.items.map((item) =>
      createItem(item.itemType, {
        description: item.description,
        brand: item.brand ?? "",
        quantity: String(Number(item.quantity)),
        unit: item.unit ?? "",
        unitPrice: String(Number(item.unitPrice)),
      }),
    ),
  }
}

export const itemSubtotal = (item: ExpenseItemForm) => (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)

export const calcTotal = (items: ExpenseItemForm[]) => items.reduce((sum, item) => sum + itemSubtotal(item), 0)

export function getFormError(form: ExpenseForm): string | null {
  if (!isValidDateOnly(form.expenseDate)) return "La fecha del gasto debe tener el formato AAAA-MM-DD"
  if (form.nextServiceDate && !isValidDateOnly(form.nextServiceDate)) {
    return "La fecha del próximo servicio debe tener el formato AAAA-MM-DD"
  }
  if (form.items.length === 0) return "Agrega al menos un ítem"
  if (form.items.some((item) => !item.description.trim())) return "Todos los ítems necesitan descripción"
  if (form.items.some((item) => !(Number(item.quantity) > 0) || Number(item.unitPrice || 0) < 0)) {
    return "Revisa cantidades y precios de los ítems"
  }
  const odometer = toOptionalNumber(form.odometerKm)
  const next = toOptionalNumber(form.nextServiceKm)
  if (next != null && next <= 0) return "El km del próximo servicio debe ser mayor a 0"
  if (odometer != null && next != null && next <= odometer) {
    return "El km del próximo servicio debe ser mayor al km actual"
  }
  return null
}

export function toItemsPayload(items: ExpenseItemForm[]): IVehicleExpenseItemPayload[] {
  return items.map((item) => ({
    itemType: item.itemType,
    description: item.description.trim(),
    brand: item.brand.trim() || undefined,
    quantity: Number(item.quantity),
    unit: item.unit.trim() || undefined,
    unitPrice: Number(item.unitPrice || 0),
  }))
}
